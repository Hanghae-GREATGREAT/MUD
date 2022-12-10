/**
 * 
 * 동시처리 테스트
 * 반복IO
 * 
 */
const { workerData, parentPort } = require('worker_threads');
console.log('workerData received', workerData);
const { 
    WORKER_MAX_CLIENT, ID_START, 
    CLIENT_CREATE_INTERVAL_IN_MS, TEST_DURATION_IN_MS,
    TEST_NAME
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
const BATTLE_SOCKETS = new Set();
const PVP_SOCKETS = new Set();

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}


const createClient = async(i) => {
    // SOCKET CONNECTION
    const { io } = require('socket.io-client');
    const mainSocket = io(`ws://${URL}/`, { transports: ['websocket'] });
    const frontSocket = io(`ws://${URL}/front`, { transports: ['websocket'] });
    const battleSocket = io(`ws://${URL}/battle`, { transports: ['websocket'] });
    const pvpSocket = io(`ws://${URL}/pvp`, { transports: ['websocket'] });

    MAIN_SOCKETS.add(mainSocket);
    FRONT_SOCKETS.add(frontSocket);
    BATTLE_SOCKETS.add(battleSocket);
    PVP_SOCKETS.add(pvpSocket);

    const WAIT_COMMAND = Math.random()*2 + 0.5;
    const front = require('./units/front')(frontSocket, WAIT_COMMAND);
    const village = require('./units/village')(mainSocket, WAIT_COMMAND);
    const battle = require('./units/battle')(battleSocket, WAIT_COMMAND);
    const pvp = require('./units/pvp')(pvpSocket, WAIT_COMMAND);
    const fields = { front, battle, village, pvp };
    const selector = require('./units/selector')(fields);

    let chatLoop = undefined;
    const END = () => {
        clearInterval(chatLoop);

        mainSocket.disconnect();
        frontSocket.disconnect();
        battleSocket.disconnect();
        pvpSocket.disconnect();

        MAIN_SOCKETS.delete(mainSocket);
        FRONT_SOCKETS.delete(frontSocket);
        BATTLE_SOCKETS.delete(battleSocket);
        PVP_SOCKETS.delete(pvpSocket);
    }
    
    try {
        clientCount++;
        
        // SET START TIME
        const CLIENT_START = Date.now();
        
        // SIGN IN / OUT
        const SIGN = Math.round(Math.random());
        const username = SIGN === 0 ? `user${i}` : 'user'+`${Date.now()*i}`.slice(-10);
        const res = await selector.sign[SIGN](username);
        let { field, userInfo, userStatus, cnt, throughput } = res;
        emitCount += cnt;
        throughputs.push(...throughput);


        chatLoop = setInterval(() => {
            if (Math.random() < 0.80) return;
            front.chatSubmit(username, 'chatchat').then((res) => {
                throughputs.push(...res.throughput);
                emitCount++;
                // console.log(res.script);
            })
        }, 3000);
    
        while (true) {
            const FIELD = Math.random() < 0.9 ?
                selector[field] : selector['global'];
            const SELECT = (Math.random()*FIELD.length)|0;
            
            if (field === 'battle' || (field === 'dungeon' && SELECT <= 1)) {
                const REMAIN_TEST_DURATION = TEST_DURATION_IN_MS - (Date.now() - CLIENT_START);
                const BATTLE_DURATION = (
                    ((Math.random() * 0.8 * REMAIN_TEST_DURATION) / 1000)|0
                );
                console.log('battle duration: ', userInfo.userId, BATTLE_DURATION);
    
                const res = await FIELD[0](field, userInfo, userStatus, BATTLE_DURATION);
                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
            } else {
                const res = await FIELD[SELECT](field, userInfo, userStatus);
                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
            }
            
            console.log(userInfo.userId, field);
    
            if (Date.now() - CLIENT_START > TEST_DURATION_IN_MS) break;
        }

        console.log('TEST SUCCESS', i)

        completeCount++;
        clientCount--;
    } catch (error) {
        console.log('TEST FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIIIL', i);

        const fs = require('fs');
        const path = require('path');
        const ERROR_NAME = `[ERROR]${TEST_NAME}.txt`;
        const ERROR_PATH = path.join(__dirname, 'errors', ERROR_NAME);
        fs.appendFile(ERROR_PATH, error.message, ()=>{});
        failCount++;
        clientCount--;
    }
    END();
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
        if (expire - start > 1.2*TEST_DURATION_IN_MS) {
            failCount += clientCount;
            clientCount = 0;
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