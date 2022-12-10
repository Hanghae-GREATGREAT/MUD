const { Worker, isMainThread, workerData, parentPort } = require('node:worker_threads');


const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

const asyncFunc = (N, i, n) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log('ASYNC!!!', N, i, n);
            resolve(`ASYNC RESOLVED ${N} ${i} ${n}`);
        }, 500);
    });
}

const worker = async(id, N) => {
    const client = async(id) => {
        const start = Date.now();
        let i = 0;
        while (true) {
            const res = await asyncFunc(id, i, 1);
            parentPort.postMessage({res})
            // console.log(res);
        
            await sleep(Math.random()*3000);
        
            const res2 = await asyncFunc(id, i, 2);
            // console.log(res2);
            parentPort.postMessage({res2})
        
            await sleep(Math.random()*3000);
            i++;
            
            const time = Date.now();
            if (time - start > 10000) break;
        }
    }

    for (let i=0; i<N; i++) {
        client(id);
    }
    
}


if (isMainThread) {
    const M = 1000;
    const threads = new Set();
    const num = 10;
    
    for(let i=0; i<num; i++) {
        threads.add(
            new Worker(__filename, {
                workerData: { id: i, N: M/num }
            })
        );
    }

    for (const worker of threads) {
        worker.on('message', (res) => {
            console.log(res);
        });

        worker.on('error', (error) => console.error(error));

        worker.on('exit', (code) => {
            if (code !== 0) console.log('exit: ', code);

            threads.delete(worker);
            if (threads.size === 0) {
                console.log('WORK DONE');
            }
        });
    }

} else {
    const { id, N } = workerData;
    
    worker(id, N);
}
