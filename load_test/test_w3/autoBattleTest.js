/**

자동전투 테스트

front/in >> sign:20 >> sign:21 >> front/D
dungeon/입장 1 >> battle/자동 >> ...sleep(300) >> autoBattle/중단 >> dungeon/out

자동: 단일스레드 자동전투
자동1: 멀티스레드 자동전투

client count: 현재 요청을 보내는 중인 클라이언트 수
scenario completion: 시나리오 성공률. 성공 / 전체 => 백분률
average performace time: 시나리오 1회 소요시간

memory usuage: 프로세스 사용 메모리 / 가용 메모리
user cpu per seconds: cpu 활성 시간
cpu consumption percent: cpu 사용률

 */

const { io } = require('socket.io-client');
const { getResourceUsage } = require('../resource');
const fs = require('fs');
const path = require('path');

const URL = 'http://0.0.0.0:3333';
const NAME = 'autoSingle'
const MAX_CLIENTS = 1;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATE_INTERVAL_IN_MS = 500;
const SCENARIO_INTERVAL_IN_MS = 10000;
const SCENARIO_REPEAT_PER_USER = 1;
const TOTAL_TRY = MAX_CLIENTS * SCENARIO_REPEAT_PER_USER;
const BATTLE_RUN_TIME = 100000;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

let emitCount = 0;
let previousEmitCount = 0;
let failCount = 0;
let previousFailCount = 0;
let completeCount = 0;
let previousCompleteCount = 0;

const performanceTime = [];
const avgEmits = [];
const avgTimes = [];
const avgMemory = [];
const avgCpuUsage = [];
const avgCpuOccupy = [];

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}

const createClient = async(i) => {

    const socket = io(URL, { transports: ['websocket'] });

    const emit = (field, input) => {
        emitCount++;
        return new Promise( (resolve, reject) => {
            socket.emit(field, input);

            socket.on('print', resolve);
            socket.on('printBattle', resolve);
            socket.on('signout', resolve);
    
            socket.on('disconnect', () => {reject(socket.connected)});
        });
    }

    let field = 'front';
    let userInfo = {};
    let userStatus = {};
    let option = '';

    const userNumber = i + 1;
    let username = `user${userNumber}`;

    clientCount++;
    try {
        // const start = performance.now().toFixed(2);
        await emit('front', { line: 'in', userInfo, userStatus, option });

        let r2 = await emit('sign', { line: username, userInfo, userStatus, option: '20' });
        userInfo = r2.userInfo;

        let r3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '21' });
        userInfo = r3.userInfo;
        userStatus = r3.userStatus;

        await emit('front', { line: 'D', userInfo, userStatus, option });

        await emit('dungeon', { line: '입장 1', userInfo, userStatus, option });

        await emit('battle', { line: '자동단일', userInfo, userStatus, option });

        await sleep(BATTLE_RUN_TIME);

        await emit('autoBattle', { line: '중단', userInfo, userStatus, option });

        await emit('global', { line: 'out', userInfo, userStatus, option });

        // const end = performance.now().toFixed(2);
        // performanceTime.push(end-start);

        completeCount++;
    } catch (error) {
        failCount++;
    }
    clientCount--;
}
// createClient(0);
const main = async() => {
    for(let i=0; i<MAX_CLIENTS; i++) {
        await sleep(CLIENT_CREATE_INTERVAL_IN_MS);
        createClient(i);
    }
};

(async() => {
    const { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent } = await getResourceUsage(`${URL}/api/resource`);
    const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
    const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
    const INITAL_STATUS = (
        'SERVER INITIAL STATUS\n'+
        `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%\n`
    );

    const start = Date.now() + 1000*60*60*9;
    main();

    // 테스트 시간
    const date = new Date(Date.now())
    const day = date.toLocaleDateString();
    const hour = ('00'+date.getHours()).slice(-2);
    const minute = ('00'+date.getMinutes()).slice(-2);

    // 로그 생성
    const FILE_NAME = `${NAME}-${MAX_CLIENTS}-${BATTLE_RUN_TIME}-${CLIENT_CREATE_INTERVAL_IN_MS}(${day} ${hour}${minute}).txt`;
    const FILE_PATH = path.join(__dirname, 'logs', FILE_NAME);
    fs.writeFileSync(FILE_PATH, '');
    console.log(`log file '${FILE_NAME}' created`);

    // 로그 기록
    const printReport = setInterval(async() => {
        
        // 현재 분기 시간 간격(seconds)
        const now = new Date().getTime();
        const durationSinceLastReport = (now - lastReport) / 1000;
    
        // 현재 분기 요청 카운팅
        const currentEmitCount = emitCount - previousEmitCount;
        const emitSeconds = (
            currentEmitCount / durationSinceLastReport
        ).toFixed(2);
        avgEmits.push((+emitSeconds*100)|0)

        // 현재 분기 처리 시나리오 카운팅
        const currentFailCount = failCount - previousFailCount;
        const currentCompleteCount = completeCount - previousCompleteCount;
        const currentTotalCount = currentCompleteCount + currentFailCount;
        const scenarioCompleteRate = (
            currentCompleteCount / currentTotalCount
        ).toFixed(4) * 100 || 0;

        const currentTryCount = (
            (previousCompleteCount + currentCompleteCount) +
            (previousFailCount + currentFailCount)
        );
    
        // const performanceTimeSlice = performanceTime.slice(previousCompleteCount, previousCompleteCount+currentRoundCompleteCount);
        // const averagePerformanceTime = (
        //     performanceTimeSlice.reduce((a,b)=>a+b,0) / currentRoundCompleteCount
        // ).toFixed(2);
    
        // 현재 서버 자원 상태
        const { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent } = await getResourceUsage(`${URL}/api/resource`);
        const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
        const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
        avgMemory.push((+totalMemoryMb*100)|0);
        avgCpuUsage.push(userCpuSeconds);
        avgCpuOccupy.push(cpuConsumptionPercent);
    
        // 로그 생성
        const LOG = `progress: ${currentTryCount}/${TOTAL_TRY}, `+
        `clients: ${clientCount}\n` +
        `emits/sec: ${emitSeconds}, `+
        `scenario completion: ${currentCompleteCount}/${currentTotalCount} => ${scenarioCompleteRate}, `+
        // `average performance time: ${averagePerformanceTime}ms\n` +
        `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%\n`;
    
        fs.appendFile(FILE_PATH, LOG+'\n', (err) => {
            if (err) {
                console.log(err.message);
                return process.exit(0);
            }
            console.log(LOG);

            // 테스트 종료 확인
            if (clientCount === 0) {
                console.log('end of test...total scenario tried: ', completeCount+failCount);
                clearInterval(printReport);
                const end = Date.now() + 1000*60*60*9;
                const [min, t] = [((end-start)/60000)|0, (end-start)%60000];
                const sec = (t/1000).toFixed(2);
    
                // 최종 리포트 작성
                const EMIT_PER_SECONDS = (
                    avgEmits.reduce((a,b)=>a+b,0) / avgEmits.length / 100
                ).toFixed(2);
                // const AVG_PERFORMANCE = (
                //     avgTimes.reduce((a,b)=>a+b,0) / avgTimes.length / 100
                // ).toFixed(2);
                const AVG_MEMORY = (
                    avgMemory.reduce((a,b)=>a+b,0) / avgMemory.length / 100
                ).toFixed(2);
                const AVG_CPU_USAGE = (
                    avgCpuUsage.reduce((a,b)=>a+b,0) / avgCpuUsage.length
                ).toFixed(2);
                const AVG_CPU_CONSUMPTION = (
                    avgCpuOccupy.reduce((a,b)=>a+b,0) / avgCpuOccupy.length
                ).toFixed(2);
                const RESULT = `TEST RESULT: ${FILE_NAME}\n\n`+
                    `start: ${new Date(start)}\n`+
                    `end: ${new Date(end)}\n`+
                    `time: ${min}m ${sec}s\n\n`+
                    `scenario: front/in >> sign:20 >> sign:21 >> front/D\n`+
                    `dungeon/입장 1 >> battle/자동 >> sleep(${BATTLE_RUN_TIME}) >> autoBattle/중단 >> dungeon/out\n\n`+
                    `MAX_CLIENTS: ${MAX_CLIENTS}\n`+
                    `CLIENT_CREATE_INTERVAL_IN_MS: ${CLIENT_CREATE_INTERVAL_IN_MS}\n`+
                    `SCENARIO_REPEAT_PER_USER: ${SCENARIO_REPEAT_PER_USER}\n\n`+
                    `total emit count: ${emitCount}\n`+
                    `emit per seconds: ${EMIT_PER_SECONDS}\n`+
                    `total scenario try: ${TOTAL_TRY}\n`+
                    `scenario complete: ${completeCount}\n`+
                    `scenario fail: ${failCount}\n`+
                    // `average performace: ${AVG_PERFORMANCE}ms\n`+
                    `average memory usage: ${AVG_MEMORY}/${availableMemoryMb}MB\n`+
                    `average cpu usage: ${AVG_CPU_USAGE}ms/sec\n`+
                    `average cpu consumption: ${AVG_CPU_CONSUMPTION}%\n\n\n`+
                    `${INITAL_STATUS}\n`+
                    `### DETAIL LOG ###\n\n`;
    
                fs.readFile(FILE_PATH, (err, data) => {
                    if (err) {
                        console.log(err.message);
                        return process.exit(0);
                    }
                    
                    fs.writeFile(FILE_PATH, RESULT+data, (err) => {
                        if (err) {
                            console.log(err.message);
                        }
                        return process.exit(0);
                    });
                });
            }
        });

        previousEmitCount += currentEmitCount;
        previousFailCount += currentFailCount;
        previousCompleteCount += currentCompleteCount;
        lastReport = now;

    }, 5000);
})();
