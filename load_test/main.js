const TestWorker = require('./IO_test');


const io_load = () => {
    const MAX_CLIENTS = 500;
    const TEST_DURATION_IN_MS = 1000 * 60;
    const threadCount = MAX_CLIENTS > 100 ? 10 : Math.ceil(MAX_CLIENTS/10);
    // const threadCount = 20;

    console.log('gogo', MAX_CLIENTS, TEST_DURATION_IN_MS, threadCount)

    const IO_TEST = new TestWorker(MAX_CLIENTS, TEST_DURATION_IN_MS, threadCount);

    IO_TEST.start().then(() => {
        console.log('SUCCESS');
    }).catch((err) => {
        console.error(err);
    }).finally(() => {
        IO_TEST.terminate();
        process.exit(0);
    });
}


io_load();