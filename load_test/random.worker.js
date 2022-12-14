
const { workerData, parentPort } = require('worker_threads');
console.log('workerData received', workerData);
const { 
    WORKER_MAX_CLIENT, ID_START, 
    CLIENT_CREATE_INTERVAL_IN_MS, TEST_DURATION_IN_MS,
    TEST_NAME
} = workerData;

// const URL = 'localhost:3333';
const URL = 'api.great-effect.com:3333';

const MAX_WAIT_TIME = 1.2 * TEST_DURATION_IN_MS;

// LOGGING VARIABLES
const clientCount = new Set();
const throughputs = [];
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
const IN_BATTLE = new Map();


const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}

const signoutCnt = [];
const createClient = async(i) => {
    // SOCKET CONNECTION
    const { io } = require('socket.io-client');
    const mainSocket = io(`wss://${URL}/`, { transports: ['websocket'] });
    const frontSocket = io(`wss://${URL}/front`, { transports: ['websocket'] });
    const battleSocket = io(`wss://${URL}/battle`, { transports: ['websocket'] });
    const pvpSocket = io(`wss://${URL}/pvp`, { transports: ['websocket'] });

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
        clientCount.add(i);
        
        // SET START TIME
        const CLIENT_START = Date.now();
        
        // SIGN IN / OUT
        let sign = true;
        let tryCnt = 0;
        while (sign) {
            const SIGN = Math.round(Math.random());
            var username = SIGN === 0 ? `user${i}` : 'user'+`${Date.now()*i}`.slice(-10);

            const res = await selector.sign[SIGN](username);
            if (res?.error) {
                console.log('SIGN FAIL', ++tryCnt);
                if (tryCnt > 5) return clientCount.delete(i);
                failCount++;
                continue;
            };

            var { field, userInfo, userStatus, cnt, throughput } = res;
            emitCount += cnt;
            throughputs.push(...throughput);
            break;
        }

        chatLoop = setInterval(() => {
            if (Date.now() - CLIENT_START > TEST_DURATION_IN_MS) {
                // console.log('STOP CHAT', userInfo?.characterId);
                return clearInterval(chatLoop);
            }
            if (Math.random() < 0.80) return;
            front.chatSubmit(username, 'chatchat').then((res) => {
                if (res?.error) {
                    failCount++;
                    return;
                }
                throughputs.push(...res.throughput);
                emitCount++;
            })
        }, 3000);

        let loop = true;
        setTimeout(() => {
            const userInfo = IN_BATTLE.get(i);
            if (userInfo) {
                loop = false;
                completeCount++;
                clientCount.delete(i);
                battle.quitAuto('autuBattle', userInfo, {});
            }
        }, TEST_DURATION_IN_MS);

        while (loop) {
            // console.log(`[${new Date(Date.now()+1000*60*60*9)}]`, field, userInfo?.characterId);

            const FIELD = Math.random() < 0.9 ? selector[field] : selector['global'];
            const SELECT = (Math.random()*FIELD.length)|0;

            if (field === 'battle' || (field === 'dungeon' && SELECT <= 1)) {
                const REMAIN_TEST_DURATION = TEST_DURATION_IN_MS - (Date.now() - CLIENT_START);
                if (REMAIN_TEST_DURATION < 5) {
                    completeCount++;
                    clientCount.delete(i);
                    break;
                }
                const BATTLE_DURATION = (
                    ((Math.random() * 0.8 * REMAIN_TEST_DURATION) / 1000)|0
                );
                // console.log('battle duration: ', userInfo?.characterId, BATTLE_DURATION);
    
                IN_BATTLE.set(i, userInfo);
                const res = await FIELD[0](field, userInfo, userStatus, BATTLE_DURATION);
                if (res?.error) {
                    failCount++;
                    continue;
                }

                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
                IN_BATTLE.delete(i);
            } else {
                const res = await FIELD[SELECT](field, userInfo, userStatus);
                if (res?.error) {
                    failCount++;
                    continue;
                }

                field = res.field;
                userInfo = res.userInfo;
                userStatus = res.userStatus;
                emitCount += res.cnt;
                throughputs.push(...res.throughput);
            }
            
            completeCount++;            
            const now = Date.now();
            // console.log(`${now} - ${CLIENT_START} > ${TEST_DURATION_IN_MS}`,
            // now - CLIENT_START > TEST_DURATION_IN_MS);
            if (now - CLIENT_START > TEST_DURATION_IN_MS) {
                // console.log('BREAK LOOP', userInfo.characterId);
                loop = false;
                clientCount.delete(i);
                break;
            }
        }

        // console.log('signout...')
        // const res = await front.signout();
        // signoutCnt.push(userInfo?.characterId);
        // emitCount += res.cnt;
        // throughputs.push(...res.throughput);

        // console.log('TEST SUCCESS', userInfo)
        clientCount.delete(i);
    } catch (error) {
        console.log('TEST FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIIIIL', i, error?.message);

        failCount++;
        clientCount.delete(i);
    }
    END();
}

const main = async() => {
    console.log('MAIN CALLED');

    for(let i=0; i<WORKER_MAX_CLIENT; i++) {
        // console.log('create client', ID_START+i);
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
        const now = Date.now() + 1000*60*60*9;
        if (now - start > MAX_WAIT_TIME) {
            failCount += clientCount.size;
            clientCount.clear();
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
            currentProgressCount, clientCount: clientCount.size, currentEmitCount,
            currentCompleteCount, currentTotalCount,
            throughputSum, throughputAvg,
        }
        parentPort.postMessage(report);

        previousEmitCount += currentEmitCount;
        previousFailCount += currentFailCount;
        previousCompleteCount += currentCompleteCount;

        if (clientCount.size === 0) {
            console.log('WORKER END', clientCount.size)
            clearInterval(printReport);
        }
    }, 10000);

} catch (error) {
    // CREATE REPORT
    console.error(error);
    console.log('TRY CATCH ERROR');
}