const TestWorker = require('./testWorker');


const io_load = () => {
    const TEST_CONDITION = {

        // 'io' | 'cpu' | 'random'
        // TEST: 'io',
        // TEST: 'cpu',
        TEST: 'random',

        MAX_CLIENT: 500,
        TEST_DURATION_IN_MS: 1000 * 300,
        CLIENT_CREATE_INTERVAL_IN_MS: 1500,

        // client increment per interval
        threadCount: 20,
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

io_load();
process.on('uncaughtException', ()=>{
    console.log('uncaughtException');
    process.exit(0);
})