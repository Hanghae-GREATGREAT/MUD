/**
 * 
 * 동시처리 테스트
 * 반복IO
 * 
 */
const { workerData, parentPort } = require('worker_threads');
console.log('workerData received', workerData);
const { 
    WORKER_MAX_CLIENT, ID_START, CLIENT_CREATE_INTERVAL_IN_MS, TEST_DURATION_IN_MS
} = workerData;

// const URL = 'localhost:3333';
// const URL = '3.39.234.153:3333';
const URL = 'great-effect.com:3333';

// LOGGING VARIABLES
const throughputs = [];
let clientCount = 0;
let emitCount = 0;
let previousEmitCount = 0;
let failCount = 0;
let previousFailCount = 0;
let completeCount = 0;
let previousCompleteCount = 0;

const MAIN_SOCKETS = new Set();
const FRONT_SOCKETS = new Set();

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}


const createClient = async(i) => {
    // SOCKET CONNECTION
    const { io } = require('socket.io-client');
    const mainSocket = io(`ws://${URL}/`, { transports: ['websocket'] });
    const frontSocket = io(`ws://${URL}/front`, { transports: ['websocket'] });

    MAIN_SOCKETS.add(mainSocket);
    FRONT_SOCKETS.add(frontSocket);

    const WAIT_COMMAND = Math.random()*2 + 0.5;
    const front = require('./units/front')(frontSocket, WAIT_COMMAND);
    const village = require('./units/village')(mainSocket, WAIT_COMMAND);
    
    try {
        const username = `user${i}`;
        clientCount++;

        // SET START TIME
        const CLIENT_START = Date.now();

        /**
         * const response = await emit()
         * emitCount += response.cnt
         * througputs.push(...response.throughput);
         */

        while (true) {
            const res1 = await front.signin(username);
            emitCount += res1.cnt;
            throughputs.push(...res1.throughput);

            const res2 = await front.signout();
            emitCount += res2.cnt;
            throughputs.push(...res1.throughput);

            if (Date.now() - CLIENT_START > TEST_DURATION_IN_MS) {
                break;
            }
        }

        console.log('TEST SUCCESS', i)
        completeCount++;
        clientCount--;

    } catch (error) {
        console.log('FAIL', error.message);
        console.error(error);
        failCount++;
        clientCount--;
    }

    mainSocket.disconnect();
    frontSocket.disconnect();
    MAIN_SOCKETS.delete(mainSocket);
    FRONT_SOCKETS.delete(frontSocket);
}

const main = async() => {
    console.log('MAIN CALLED');

    for(let i=0; i<WORKER_MAX_CLIENT; i++) {
        console.log('create client', ID_START+i);
        await sleep(CLIENT_CREATE_INTERVAL_IN_MS);
        createClient(ID_START+i);
    }
}


// TEST START TIME
const start = Date.now() + 1000*60*60*9;

try {
    // RUN TEST    
    main();

    // START LOGGING
    const printReport = setInterval(() => {
        const expire = Date.now() + 1000*60*60*9;
        if (expire - start > 1.5*TEST_DURATION_IN_MS) {
            failCount += clientCount;
            clientCount = 0;
            
            const [ main_remains, front_remains ] = [ MAIN_SOCKETS.values(), FRONT_SOCKETS.values() ];            
            let [ main, front ] = [ main_remains.next(), front_remains.next() ];
            while (!main.done && !front.done) {
                main.value?.disconnect();
                front.value?.disconnect();
                [ main, front ] = [ main_remains.next(), front_remains.next() ];
            }
        }

        // EMIT COUNTS
        const currentEmitCount = emitCount - previousEmitCount;

        // SCENARIO COMPLETE COUNT
        const currentFailCount = failCount - previousFailCount;
        const currentCompleteCount = completeCount - previousCompleteCount;
        const currentTotalCount = currentCompleteCount + currentFailCount;

        const currentProgressCount = (
            (previousCompleteCount + currentCompleteCount) +
            (previousFailCount + currentFailCount)
        );

        // AVERAGE THROUGHPUT
        const throughputSlice = throughputs.slice(previousEmitCount, previousEmitCount+currentEmitCount);
        const throughputSum = throughputSlice.reduce((a,b)=>a+b,0);
        const throughputAvg = throughputSum / currentEmitCount;

        const report = {
            currentProgressCount, clientCount, currentEmitCount,
            currentCompleteCount, currentTotalCount,
            throughputSum, throughputAvg,
        }
        parentPort.postMessage(report);

        previousEmitCount += currentEmitCount;
        previousFailCount += currentFailCount;
        previousCompleteCount += currentCompleteCount;

        if (clientCount === 0) {
            console.log('WORKER END', clientCount)
            clearInterval(printReport);
        }
    }, 10000);

} catch (error) {
    // CREATE REPORT
    console.error(error);
    console.log('TRY CATCH ERROR');
}