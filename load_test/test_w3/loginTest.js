/**

로그인/로그아웃 테스트

파일이름
login-${MAX_CLIENTS}-${SCENARIO_REPEAT_PER_USER}-${CLIENT_CREATE_INTERVAL_IN_MS}
        (${day} ${hour}${minute}).txt

시나리오
front/in >> sign:20 >> sign:21 >> front/out

측정항목
client count: 현재 요청을 보내는 중인 클라이언트 수
scenario completion: 시나리오 성공률. 성공 / 전체 => 백분률
average performace time: 시나리오 1회 소요시간
emit per seconds: 초당 요청 처리 시간
memory usuage: 프로세스 사용 메모리 / 가용 메모리
user cpu per seconds: cpu 활성 시간
cpu consumption percent: cpu 사용률


 */

const { io } = require('socket.io-client');
const getResourceUsage = require('../resource');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:3333';
const MAX_CLIENTS = 100;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATE_INTERVAL_IN_MS = 10;
const SCENARIO_INTERVAL_IN_MS = 10000;
const SCENARIO_REPEAT_PER_USER = 100;
const TOTAL_TRY = MAX_CLIENTS * SCENARIO_REPEAT_PER_USER;

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
    let username = `test${('0000'+userNumber).slice(-4)}`;

    clientCount++;
    for (let j=0; j<SCENARIO_REPEAT_PER_USER; j++) {
        try {
            const start = performance.now().toFixed(2);
            await emit('front', { line: 'in', userInfo, userStatus, option });
    
            let r2 = await emit('sign', { line: username, userInfo, userStatus, option: '20' });
    
            userInfo = r2.userInfo;
            let r3 = await emit('sign', { line: '1234', userInfo, userStatus, option: '21' });
    
            userInfo = r3.userInfo;
            userStatus = r3.userStatus;
            await emit('front', { line: 'out', userInfo, userStatus, option });
    
            const end = performance.now().toFixed(2);
            (end-start) !== NaN ? performanceTime.push(end-start) : 0;

            completeCount++;
        } catch (error) {
            failCount++;
        }
        // console.log(userNumber, failCount, completeCount);
    }
    clientCount--;
}

const main = async() => {
    const { totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent } = await getResourceUsage(`${URL}/api/resource`);
    const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
    const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
    console.log(
        'SERVER CURRENT STATUS\n'+
        `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%
    `);
    for(let i=0; i<MAX_CLIENTS; i++) {
        await sleep(CLIENT_CREATE_INTERVAL_IN_MS);
        createClient(i);
    }
};

(() => {
    const start = Date.now() + 1000*60*60*9;
    main();

    // 테스트 시간
    const date = new Date(Date.now())
    const day = date.toLocaleDateString();
    const hour = ('00'+date.getHours()).slice(-2);
    const minute = ('00'+date.getMinutes()).slice(-2);

    // 로그 생성
    const FILE_NAME = `login-${MAX_CLIENTS}-${SCENARIO_REPEAT_PER_USER}-${CLIENT_CREATE_INTERVAL_IN_MS}(${day} ${hour}${minute}).txt`;
    const FILE_PATH = path.join(__dirname, FILE_NAME);
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
        

        // 현재 분기 평균 시나리오 처리 시간
        const performanceTimeSlice = performanceTime.slice(previousCompleteCount, previousCompleteCount+currentCompleteCount);
        const averagePerformanceTime = (
            performanceTimeSlice.reduce((a,b)=>a+b,0) / currentCompleteCount
        ).toFixed(2);
        avgTimes.push((+averagePerformanceTime*100)|0);

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
        `average performance time: ${averagePerformanceTime}ms\n` +
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
                const AVG_PERFORMANCE = (
                    avgTimes.reduce((a,b)=>a+b,0) / avgTimes.length / 100
                ).toFixed(2);
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
                    `scenario: front/in >> sign:20 >> sign:21 >> front/out\n`+
                    `MAX_CLIENTS: ${MAX_CLIENTS}\n`+
                    `CLIENT_CREATE_INTERVAL_IN_MS: ${CLIENT_CREATE_INTERVAL_IN_MS}\n`+
                    `SCENARIO_REPEAT_PER_USER: ${SCENARIO_REPEAT_PER_USER}\n\n`+
                    `total emit count: ${emitCount}\n`+
                    `emit per seconds: ${EMIT_PER_SECONDS}\n`+
                    `total scenario try: ${TOTAL_TRY}\n`+
                    `scenario complete: ${completeCount}\n`+
                    `scenario fail: ${failCount}\n`+
                    `average performace: ${AVG_PERFORMANCE}ms\n`+
                    `average memory usage: ${AVG_MEMORY}/${availableMemoryMb}MB\n`+
                    `average cpu usage: ${AVG_CPU_USAGE}ms/sec\n`+
                    `average cpu consumption: ${AVG_CPU_CONSUMPTION}%\n\n\n`+
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
