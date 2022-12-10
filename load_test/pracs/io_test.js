const { Worker } = require('worker_threads');
const path = require('path');
const fs = require('fs');


class TestWorker {
    #threads = new Set();
    #threadCount = 10;
    #MAX_CLIENT = 1;
    #TEST_DURATION_IN_MS = 1000;
    #CLIENT_CREATE_INTERVAL_IN_MS = 100;

    #file = path.join(__dirname, 'IO_testWorker.js');
    #reportInterval;
    #lastReport = new Date().getTime();
    #START = Date.now() + 1000*60*60*9;
    #TIME = '';
    #LOG_FLAG = false;

    #clientCount = 0;
    #totalProgressCount = 0;
    #prevProgressCount = 0;
    #totalEmitCount = 0;
    #prevEmitCount = 0;
    #avgEmitCount = [];
    #totalCompleteCount = 0;
    #prevCompleteCount = 0;
    #TotalCount = 0;
    #prevTotalCount = 0;
    #throughputAvg = [];
    #throughputSum = 0;

    constructor(MAX_CLIENT, TEST_DURATION_IN_MS, threadCount=10) {
        this.#threadCount = threadCount;
        this.#MAX_CLIENT = MAX_CLIENT;
        this.#TEST_DURATION_IN_MS = TEST_DURATION_IN_MS;
    }

    start = () => {
        const MAX_CLIENT = this.#MAX_CLIENT
        const threads = this.#threads;
        const count = this.#threadCount;

        // start logging
        this.#createLog();

        return new Promise((resolve, reject) => {
            // distribute work
            const range = Math.ceil(MAX_CLIENT / count);
            let start = 1;
            for (let i=0; i<count-1 ; i++) {
                const workerData = {
                    WORKER_MAX_CLIENT: range,
                    ID_START: start,
                    TEST_DURATION_IN_MS: this.#TEST_DURATION_IN_MS,
                    CLIENT_CREATE_INTERVAL_IN_MS: this.#CLIENT_CREATE_INTERVAL_IN_MS,
                }
                threads.add(new Worker(this.#file, { workerData }));
                start += range;
            }
            const workerData = {
                WORKER_MAX_CLIENT: MAX_CLIENT - (range * (count-1)),
                ID_START: start,
                TEST_DURATION_IN_MS: this.#TEST_DURATION_IN_MS,
                CLIENT_CREATE_INTERVAL_IN_MS: this.#CLIENT_CREATE_INTERVAL_IN_MS,
            }
            threads.add(new Worker(this.#file, { workerData }));
    
            // listener
            for (const worker of threads) {
                worker.on('message', (report) => {
                    const {
                        currentProgressCount, clientCount, currentEmitCount,
                        currentCompleteCount, currentTotalCount,
                        throughputSum, throughputAvg,
                    } = report;

                    this.#clientCount += clientCount;
                    this.#totalProgressCount += currentProgressCount;
                    this.#totalEmitCount += currentEmitCount;
                    this.#totalCompleteCount += currentCompleteCount;
                    this.#TotalCount += currentTotalCount;
                    this.#throughputSum += throughputSum;
                    this.#throughputAvg.push(throughputAvg);

                    this.#LOG_FLAG = true;
                });
    
                // worker.on('online', () => {
                //     console.log(`${worker.threadId} on`);
                // });
                worker.on('error', reject);
    
                worker.on('exit', (code) => {
                    if (code !== 0) console.log(`worker exit with ${code}`);

                    console.log(`${threads.size} off`);
                    threads.delete(worker);
                    if (threads.size === 0) {
                        console.log('TEST COMPLETE');
                        resolve();
                    }
                });
            }
        });
    }

    #createLog = () => {
        this.#getTime();
        const TIME = this.#TIME;
        const MAX_CLIENT = this.#MAX_CLIENT;
        const TEST_DURATION_IN_MS = this.#TEST_DURATION_IN_MS;

        const FILE_NAME = `[LOG]io_load-${MAX_CLIENT}-${TEST_DURATION_IN_MS}(${TIME}).txt`;
        const FILE_PATH = path.join(__dirname, 'logs', FILE_NAME);
        const LOG_HEADER = (
            `${FILE_NAME}
            \n### DETAIL LOGS ###\n\n`
        );
        fs.writeFileSync(FILE_PATH, LOG_HEADER);
        console.log(`log file created '${FILE_NAME}'`);

        this.#reportInterval = setInterval(() => {
            this.#printLog(FILE_PATH)
        }, 1000*10);
    }
    
    #printLog = (FILE_PATH) => {
        const now = new Date().getTime();
        const durationSinceLastReport = (now - this.#lastReport) / 1000;

        const currentProgressCount = this.#totalProgressCount - this.#prevProgressCount;
        const currentEmitCount = this.#totalEmitCount - this.#prevEmitCount;
        const currentCompleteCount = this.#totalCompleteCount - this.#prevCompleteCount;
        const currentTotalCount = this.#TotalCount - this.#prevTotalCount;
        const clientCount = this.#clientCount;
        this.#clientCount = 0;

        const length = this.#throughputAvg.length;
        const currentThroughputs = this.#throughputAvg.splice(0, length);
        const averageThroughput = (
            currentThroughputs.reduce((a,b) => a+b, 0) / length
        ).toFixed(2);

        const connections = clientCount * 2;
        const emitSeconds = (
            currentEmitCount / durationSinceLastReport
        ).toFixed(2);
        if (+emitSeconds !== 0) this.#avgEmitCount.push(+emitSeconds * 100);
        const scenarioCompleteRate = (
            currentCompleteCount / currentTotalCount
        ).toFixed(4) * 100 || 0;

        // resourceReport()
        // const [ ONE_MIN, FIVE_MIN, FIFTEEN_MIN ] = []
    
        const LOG = 
        `progress: ${currentProgressCount}, clients: ${clientCount}, connections: ${connections}\n` + 
        `emits/sec: ${emitSeconds}, ` +
        `scenario completion: ${currentCompleteCount}/${currentTotalCount} => ${scenarioCompleteRate}, ` +
        `average throughput: ${averageThroughput}ms\n`;
        // `load average: ${ONE_MIN}/1min, ${FIVE_MIN}/5min, ${FIFTEEN_MIN}/15min\n`;

        fs.appendFile(FILE_PATH, LOG+'\n', (err) => {
            if (err) {
                console.log(err.message);
                return process.exit(0);
            }
            console.log(LOG, clientCount);

            if (clientCount === 0 && this.#LOG_FLAG) {
                this.#createReport();
                clearInterval(this.#reportInterval);
            }
        });

        this.#lastReport = now;
        this.#prevProgressCount += currentProgressCount;
        this.#prevEmitCount += currentEmitCount;
        this.#prevCompleteCount += currentCompleteCount;
        this.#prevTotalCount += currentTotalCount;
    }

    #createReport = () => {
        // TEST END TIME
        const start = this.#START;
        const end = Date.now() + 1000*60*60*9;
        const [min, t] = [((end-start)/60000)|0, (end-start)%60000];
        const sec = (t/1000).toFixed(2);

        const al = this.#avgEmitCount.length;
        const EMIT_PER_SECONDS = (
            this.#avgEmitCount.reduce((a,b) => a+b, 0) / (al*100)
        ).toFixed(2);
        const AVG_THROUGHPUT = (
            this.#throughputSum / this.#totalEmitCount
        ).toFixed(2);

        const RESULT = 
        {
            // TEST NAME
            "TEST_NAME": "io load test (concurrency test)",

            // TEST TIME
            "test_start": new Date(start),
            "test_end": new Date(end),
            "test_running_time": `${min}m ${sec}s`,

            // TEST VARIABLES
            "MAX_CLIENT": this.#MAX_CLIENT,
            "THREAD_COUNT": this.#threadCount,
            "CLIENT_CREATE_INTERVAL_IN_MS": this.#CLIENT_CREATE_INTERVAL_IN_MS,
            "TEST_DURATION_IN_MS": this.#TEST_DURATION_IN_MS,

            // TEST RESULT SUMMARY
            "total_emit_count": this.#totalEmitCount,
            "emit_per_seconds": EMIT_PER_SECONDS,
            "total_scenario_try": this.#TotalCount,
            "scenario_complete": this.#totalCompleteCount,
            "scenario_fail": this.#TotalCount - this.#totalCompleteCount,
            "average_throughput": `${AVG_THROUGHPUT}ms`,
            // "average_memory_usage": `${AVG_MEMORY}/${availableMemoryMb}MB`,
            // "average_cpu_usage": `${AVG_CPU_USAGE}ms/sec`,
            // "average_cpu_consumption": `${AVG_CPU_CONSUMPTION}%`,

            // RESERVED FOR AWS CW AGENT
            "AWS_MAX_CPU_UTILIZATION": "",
            "AWS_MAX_MEM_USED": "",
            "AWS_MAX_MEM_USED_PERCENT": ""
        }

        const TIME = this.#TIME;
        const MAX_CLIENT = this.#MAX_CLIENT;
        const TEST_DURATION_IN_MS = this.#TEST_DURATION_IN_MS;

        // CREATE REPORT FILE
        const REPORT_NAME = `[REPORT]io_load-${MAX_CLIENT}-${TEST_DURATION_IN_MS}(${TIME}).json`;
        // const TEST_DIRECTORY = path.resolve('../');
        const REPORT_PATH = path.join(__dirname, 'reports', REPORT_NAME);
        fs.writeFileSync(REPORT_PATH, JSON.stringify(RESULT))
        console.log(`report created '${REPORT_NAME}'`);

        this.terminate();
        process.exit(0);
    }

    #getTime = () => {
        this.#lastReport = new Date().getTime();
        this.#START = Date.now() + 1000*60*60*9;

        const date = new Date(Date.now())
        const day = date.toLocaleDateString().replaceAll(' ', '');
        const hour = ('00'+date.getHours()).slice(-2);
        const minute = ('00'+date.getMinutes()).slice(-2);

        this.#TIME = `${day}${hour}${minute}`;
    }

    terminate = () => {
        for (const worker of this.#threads) {
            worker.terminate();
        }
    }
}


module.exports = TestWorker;