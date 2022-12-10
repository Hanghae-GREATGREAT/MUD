const URL = 'localhost:3333';

// SOCKET CONNECTION IMPORT
const { io } = require('socket.io-client');
const mainSocket = io(`ws://${URL}/`, { transports: ['websocket'] });
const battleSocket = io(`ws://${URL}/battle`, { transports: ['websocket'] });

const WAIT_COMMAND = Math.random()*2 + 0.5;
const front = require('./units/front')(mainSocket, WAIT_COMMAND);
const battle = require('./units/battle')(battleSocket, WAIT_COMMAND);
const village = require('./units/village')(mainSocket, WAIT_COMMAND);
const fields = { front, battle, village };
const selector = require('./units/selector')(fields);

// LOGGING IMPORT
const getResourceUsage = require('./resource_ec2');
const fs = require('fs');
const path = require('path');

// DECLARE TEST VARIABLES
const TEST_NAME = 'auto_scenario_prac1';
const MAX_CLIENTS = 1;
const CLIENT_CREATE_INTERVAL_IN_MS = 2000;
const TEST_DURATION_IN_MS = 1000 * 30;
const SCENARIO_LENGTH_IN_MS = 1000 * 10;

// LOGGING VARIABLES
const performanceTime = [];
const avgEmits = [];
const avgTimes = [];
const avgMemory = [];
const avgCpuUsage = [];
const avgCpuOccupy = [];

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;
let emitCount = 0;
let previousEmitCount = 0;
let failCount = 0;
let previousFailCount = 0;
let completeCount = 0;
let previousCompleteCount = 0;


const END = () => {
    mainSocket.disconnect();
    battleSocket.disconnect();
    process.exit(0);
}

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}

// CREATE TEST SCENARIO
const createClient = async(i) => {
    try {
        clientCount++;

        // SET START TIME
        const SET_TIME = Date.now();

        // RANDOM SIGNIN or SIGNUP
        const SIGNUP_ID = SET_TIME.toString().slice(3,7);
        let { field, userInfo, userStatus } =
            Math.random() < 0.5 ? 
            await selector.sign[0](`user${i}`) : 
            await selector.sign[1](`test${SET_TIME}`);

        let prev_end_time = SET_TIME;
        console.log('SIGNED', userInfo);
        // START RANDOM SCENARIO LOOP
        // example scenario on test... dungeon > autobattle > quit/heal > home
        
        while (SET_TIME + TEST_DURATION_IN_MS > Date.now()) {
            // console.log('loop start');
            const start = performance.now().toFixed(2);
            console.log('try', start);

            // while (prev_end_time + SCENARIO_LENGTH_IN_MS > Date.now()) {
            const current_action = selector[field];
            const field_length = current_action.length;
            const field_index = (Math.random()*field_length)|0;

            if (field === 'battle' || (field === 'dungeon' && field_index === 0)) {
                const battle_duration = Math.random() * ( SCENARIO_LENGTH_IN_MS / 1000 );
                console.log('field === battle', battle_duration);
                const response = await current_action[field_index](field, userInfo, userStatus, battle_duration);

                field = response.field;
                userInfo = response.userInfo;
                userStatus = response.userStatus;

                console.log(response);
                // prev_end_time = Date.now();
                continue;
            }
            const response = await current_action[field_index](field, userInfo, userStatus);

            field = response.field;
            userInfo = response.userInfo;
            userStatus = response.userStatus;

            console.log(response);
                // prev_end_time = Date.now();
            // }

            const end = performance.now().toFixed(2);
            (end-start) !== NaN ? performanceTime.push(end-start) : 0;
            completeCount++;

            console.log('REPEAT...?')
        }

        await selector.out[(Math.random()*2)|0]();

        console.log('TEST SUCCESS', i)
        clientCount--;

    } catch (error) {
        console.log('FAIL');
        failCount++;
    }
}

const main = async() => {
    console.log('MAIN CALLED');
    for(let i=1; i<=MAX_CLIENTS; i++) {
        console.log('create client', i);
        await sleep(CLIENT_CREATE_INTERVAL_IN_MS);
        createClient(i);
    }
}


(async() => {
    // INITIAL SERVER STATUS
    console.log(`http://${URL}/api/resource`)
    const { 
        OS_LOADAVGH, totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent 
    } = await getResourceUsage(`http://${URL}/api/resource`);
    const [ONE_MIN, FIVE_MIN, FIFTEEN_MIN] = OS_LOADAVGH;
    const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
    const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
    const INITIAL_SERVER_STATUS =
        `SERVER CURRENT STATUS\n` +
        `load average: ${ONE_MIN}/1min, ${FIVE_MIN}/5min, ${FIFTEEN_MIN}/15min\n` +
        `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%`;
    console.log(INITIAL_SERVER_STATUS);

    // TEST START TIME
    const start = Date.now() + 1000*60*60*9;
    const date = new Date(Date.now())
    const day = date.toLocaleDateString();
    const hour = ('00'+date.getHours()).slice(-2);
    const minute = ('00'+date.getMinutes()).slice(-2);

    main()
    // // CREATE LOG FILE
    // const FILE_NAME = `[LOG]${TEST_NAME}-${MAX_CLIENTS}-${TEST_DURATION_IN_MS}(${day} ${hour}${minute}).txt`;
    // // const TEST_DIRECTORY = path.resolve('../');
    // const FILE_PATH = path.join(__dirname, 'logs', FILE_NAME);
    // const LOG_HEADER = (
    //     `${FILE_NAME}
    //     \n${INITIAL_SERVER_STATUS}
    //     \n### DETAIL LOGS ###\n\n`
    // );
    // fs.writeFileSync(FILE_PATH, LOG_HEADER);
    // console.log(`log file created '${FILE_NAME}'`);

    // try {
        
    //     // RUN TEST    
    //     main();
    
    //     // START LOGGING
    //     const printReport = setInterval(async() => {
            
    //         // LOGGING INTERVAL BY SECONDS
    //         const now = new Date().getTime();
    //         const durationSinceLastReport = (now - lastReport) / 1000;
    
    //         // EMIT COUNTS
    //         const currentEmitCount = emitCount - previousEmitCount;
    //         const emitSeconds = (
    //             currentEmitCount / durationSinceLastReport
    //         ).toFixed(2);
    //         avgEmits.push((+emitSeconds*100)|0)
    
    //         // SCENARIO COMPLETE COUNT
    //         const currentFailCount = failCount - previousFailCount;
    //         const currentCompleteCount = completeCount - previousCompleteCount;
    //         const currentTotalCount = currentCompleteCount + currentFailCount;
    //         const scenarioCompleteRate = (
    //             currentCompleteCount / currentTotalCount
    //         ).toFixed(4) * 100 || 0;
    
    //         const currentRoundCount = (
    //             (previousCompleteCount + currentCompleteCount) +
    //             (previousFailCount + currentFailCount)
    //         );
    
    //         // // 현재 분기 평균 시나리오 처리 시간
    //         const performanceTimeSlice = performanceTime.slice(previousCompleteCount, previousCompleteCount+currentCompleteCount);
    //         const averagePerformanceTime = (
    //             performanceTimeSlice.reduce((a,b)=>a+b,0) / currentCompleteCount
    //         ).toFixed(2);
    //         if ((+averagePerformanceTime*100)|0 !== NaN) avgTimes.push((+averagePerformanceTime*100)|0);
    
    //         // SERVER STATUS QUO
    //         const { 
    //             OS_LOADAVGH, totalMemory, availableMemory, userCpuSeconds, cpuConsumptionPercent 
    //         } = await getResourceUsage(`http://${URL}/api/resource`);
    //         const [ONE_MIN, FIVE_MIN, FIFTEEN_MIN] = OS_LOADAVGH;
    //         const totalMemoryMb = (totalMemory/1024/1024).toFixed(2);
    //         const availableMemoryMb = (availableMemory/1024/1024).toFixed(2);
    //         avgMemory.push((+totalMemoryMb*100)|0);
    //         avgCpuUsage.push(userCpuSeconds);
    //         avgCpuOccupy.push(cpuConsumptionPercent);
    
    //         // CREATE LOG MESSAGE
    //         const LOG = 
    //         `progress: ${currentRoundCount}, clients: ${clientCount}\n` + 
    //         `emits/sec: ${emitSeconds}, ` +
    //         `scenario completion: ${currentCompleteCount}/${currentTotalCount} => ${scenarioCompleteRate}, ` +
    //         `average performance time: ${averagePerformanceTime}ms\n` +
    //         `load average: ${ONE_MIN}/1min, ${FIVE_MIN}/5min, ${FIFTEEN_MIN}/15min\n` +
    //         `total memory: ${totalMemoryMb}/${availableMemoryMb}mb, cpu usuage: ${userCpuSeconds}ms/sec, cpu occupied: ${cpuConsumptionPercent}%\n`;
    
    //         // WRITE LOG
    //         fs.appendFile(FILE_PATH, LOG+'\n', (err) => {
    //             if (err) {
    //                 console.log(err.message);
    //                 return process.exit(0);
    //             }
    //             console.log(LOG);
    
    //             // CHECK TEST ACTIVITY
    //             if (clientCount === 0) {
    //                 console.log('end of test...total scenario tried: ', completeCount+failCount);
    
    //                 // CLEAR INTERVAL
    //                 clearInterval(printReport);
    
    //                 // TEST END TIME
    //                 const end = Date.now() + 1000*60*60*9;
    //                 const [min, t] = [((end-start)/60000)|0, (end-start)%60000];
    //                 const sec = (t/1000).toFixed(2);
        
    //                 // CREATE TEST REPORT JSON
    //                 const EMIT_PER_SECONDS = (
    //                     avgEmits.reduce((a,b)=>a+b,0) / avgEmits.length / 100
    //                 ).toFixed(2);
    //                 const AVG_PERFORMANCE = (
    //                     avgTimes.reduce((a,b)=>a+b,0) / avgTimes.length / 100
    //                 ).toFixed(2);
    //                 const AVG_MEMORY = (
    //                     avgMemory.reduce((a,b)=>a+b,0) / avgMemory.length / 100
    //                 ).toFixed(2);
    //                 const AVG_CPU_USAGE = (
    //                     avgCpuUsage.reduce((a,b)=>a+b,0) / avgCpuUsage.length
    //                 ).toFixed(2);
    //                 const AVG_CPU_CONSUMPTION = (
    //                     avgCpuOccupy.reduce((a,b)=>a+b,0) / avgCpuOccupy.length
    //                 ).toFixed(2);
    //                 const RESULT = 
    //                 {
    //                     // TEST NAME
    //                     "TEST_REPORT": FILE_NAME,
    //                     "TEST_NAME": TEST_NAME,
    
    //                     // TEST TIME
    //                     "test_start": new Date(start),
    //                     "test_end": new Date(end),
    //                     "test_running_time": `${min}m ${sec}s`,
    
    //                     // TEST VARIABLES
    //                     "MAX_CLIENTS": MAX_CLIENTS,
    //                     "CLIENT_CREATE_INTERVAL_IN_MS": CLIENT_CREATE_INTERVAL_IN_MS,
    //                     "TEST_DURATION_IN_MS": TEST_DURATION_IN_MS,
    
    //                     // TEST RESULT SUMMARY
    //                     "total_emit_count": emitCount,
    //                     "emit_per_seconds": EMIT_PER_SECONDS,
    //                     "total_scenario_try": completeCount + failCount,
    //                     "scenario_complete": completeCount,
    //                     "scenario_fail": failCount,
    //                     "average_performace": `${AVG_PERFORMANCE}ms`,
    //                     "average_memory_usage": `${AVG_MEMORY}/${availableMemoryMb}MB`,
    //                     "average_cpu_usage": `${AVG_CPU_USAGE}ms/sec`,
    //                     "average_cpu_consumption": `${AVG_CPU_CONSUMPTION}%`,
    //                 }
    
    //                 // CREATE REPORT FILE
    //                 const REPORT_NAME = `[REPORT]${TEST_NAME}-${MAX_CLIENTS}-${TEST_DURATION_IN_MS}(${day} ${hour}${minute}).json`;
    //                 // const TEST_DIRECTORY = path.resolve('../');
    //                 const REPORT_PATH = path.join(__dirname, 'reports', REPORT_NAME);
    //                 fs.writeFileSync(REPORT_PATH, JSON.stringify(RESULT))
    //                 console.log(`report created '${REPORT_NAME}'`);
                    
    //                 END();
    //             }
    //         });
    
    //         previousEmitCount += currentEmitCount;
    //         previousFailCount += currentFailCount;
    //         previousCompleteCount += currentCompleteCount;
    //         lastReport = now;

    //     }, 5000);

    // } catch (error) {
    //     // CREATE REPORT
    //     console.error(error);
    //     console.log('TRY CATCH ERROR');

    //     END();
    // }
})();