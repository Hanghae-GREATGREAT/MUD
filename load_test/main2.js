const TestWorker = require('./testWorker');

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

const io_load = (
    TEST='random', 
    MAX_CLIENT=100, 
    TEST_DURATION_IN_MS=1000*300,
    CLIENT_CREATE_INTERVAL_IN_MS=1000,
    threadCount=10
    ) => {
    const TEST_CONDITION = {

        // 'io' | 'cpu' | 'random'
        TEST,

        MAX_CLIENT,
        TEST_DURATION_IN_MS,
        CLIENT_CREATE_INTERVAL_IN_MS,

        // client increment per interval
        threadCount: 10,
    }
    // const threadCount = MAX_CLIENTS > 100 ? 10 : Math.ceil(MAX_CLIENTS/10);

    console.log('TEST START', TEST_CONDITION);
    const IO_TEST = new TestWorker(TEST_CONDITION);

    IO_TEST.start().then(() => {
        console.log('SUCCESS');
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        IO_TEST.terminate();
    });
}

(async() => {
    let CLIENTS = 0;
    
    const MAX_CLIENT = Math.ceil(Math.random()*100) + 50;
    const TEST_DURATION = Math.ceil(Math.random()*150 + 30) * 1000;
    const threadCount = Math.ceil(MAX_CLIENT / 20);
    io_load('random', MAX_CLIENT, TEST_DURATION, 1000, threadCount);

    CLIENTS += MAX_CLIENT;
    setTimeout(()=>{
        CLIENTS -= MAX_CLIENT;
    }, TEST_DURATION);

    setInterval(() => {
        const MAX_CLIENT = Math.ceil(Math.random()*100) + 50;
        const TEST_DURATION = Math.ceil(Math.random()*150 + 30) * 1000;
        const threadCount = Math.ceil(MAX_CLIENT / 20);
        io_load('random', MAX_CLIENT, TEST_DURATION, 1000, threadCount);

        CLIENTS += MAX_CLIENT;
        setTimeout(()=>{
            CLIENTS -= MAX_CLIENT;
        }, TEST_DURATION);
    }, 120*1000);

    setInterval(() => {
        console.log(
            `CURRENT CLIENTS: ${CLIENTS}`
        )
    }, 30*1000);

    process.on('uncaughtException', ()=>{
        console.log('uncaughtException');
        process.exit(0);
    });
})();