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
    io_load('random', 300, 1000*120, 1000, 10);

    // await sleep(1000*120);

    // io_load('random', 500, 1000*600, 2000, 10);

    // setTimeout(()=>process.exit(0), 1000*(120+600)*1.2);
    process.on('uncaughtException', ()=>{
        console.log('uncaughtException');
        process.exit(0);
    });
})();