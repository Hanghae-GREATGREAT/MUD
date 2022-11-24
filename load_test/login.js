/**

로그인/로그아웃 테스트


 */

const { io } = require('socket.io-client');

const URL = 'http://0.0.0.0:3333';
const MAX_CLIENTS = 1000;
const POLLING_PERCENTAGE = 0.05;
const CLIENT_CREATE_INTERVAL_IN_MS = 10;
const SCENARIO_INTERVAL_IN_MS = 10000;
const SCENARIO_REPEAT_PER_USER = 100;

let clientCount = 0;
let lastReport = new Date().getTime();
let packetsSinceLastReport = 0;

let failCount = 0;
let previousFailCount = 0;
let completeCount = 0;
let previousCompleteCount = 0;

const performanceTime = [];

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms))
}

const createClient = async(i) => {

    const socket = io(URL, { transports: ['websocket'] });

    const emit = (field, input) => {
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

    ++clientCount;
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
            performanceTime.push(end-start);

            completeCount++;
        } catch (error) {
            failCount++;
        }
        // console.log(userNumber, failCount, completeCount);
    }
    --clientCount;
}
// createClient(0);
const main = async() => {
    for(let i=0; i<MAX_CLIENTS; i++) {
        await sleep(CLIENT_CREATE_INTERVAL_IN_MS);
        createClient(i);
    }
};
main();

const printReport = setInterval(() => {
    if (clientCount === 0) {
        console.log('end report');
        clearInterval(printReport);
    }
    const now = new Date().getTime();
    const durationSinceLastReport = (now - lastReport) / 1000;

    const currentRoundFailCount = failCount - previousFailCount;
    const currentRoundCompleteCount = completeCount - previousCompleteCount;
    const currentRoundTotalCount = currentRoundCompleteCount + currentRoundFailCount;

    const scenarioCompleteRate = (
        currentRoundCompleteCount / currentRoundTotalCount
    ).toFixed(4) * 100;

    const performanceTimeSlice = performanceTime.slice(previousCompleteCount, previousCompleteCount+currentRoundCompleteCount);
    const averagePerformanceTime = (
        performanceTimeSlice.reduce((a,b)=>a+b,0) / currentRoundCompleteCount
    ).toFixed(2);

    console.log(
        'clients: ' + clientCount + ' || ' +
        'scenario completion: ' + currentRoundCompleteCount + '/' + currentRoundTotalCount + ' => ' + scenarioCompleteRate + ' || ' +
        'average performance time: ' + averagePerformanceTime + 'ms'
    );

    previousFailCount += currentRoundFailCount;
    previousCompleteCount += currentRoundCompleteCount;
    lastReport = now;
}, 5000);