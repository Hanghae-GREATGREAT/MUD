const TestWorker = require('./testWorker');

const user_load = (
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

module.exports = user_load;