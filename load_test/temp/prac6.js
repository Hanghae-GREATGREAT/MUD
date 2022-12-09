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




if (isMainThread) {
    const M = 10;
    const threads = new Set();
    
    for(let i=0; i<M; i++) {
        threads.add(
            new Worker(__filename, {
                workerData: { id: i }
            })
        );
    }

    for (const worker of threads) {
        worker.on('message', (res) => {
            console.log(res);
        });

        worker.on('exit', (res) => {
            console.log('exitexit')
            threads.delete(worker);
        })
    }

    
} else {
    const { id } = workerData;

    const client = async(N) => {
        const start = Date.now();
        let i = 0;
        
        const aaa = setInterval(async() =>{
            const res = await asyncFunc(N, i, 1);
            parentPort.postMessage(res);
        
            await sleep(Math.random()*3000);
        
            const res2 = await asyncFunc(N, i, 2);
            parentPort.postMessage(res2);
        
            await sleep(Math.random()*3000);
            i++;
            
            const time = Date.now();
            if (time - start > 10000) clearInterval(aaa);
        }, 2000)
        // while (true) {
        //     const res = await asyncFunc(N, i, 1);
        //     parentPort.postMessage(res);
        
        //     await sleep(Math.random()*3000);
        
        //     const res2 = await asyncFunc(N, i, 2);
        //     parentPort.postMessage(res2);
        
        //     await sleep(Math.random()*3000);
        //     i++;
            
        //     const time = Date.now();
        //     if (time - start > 10000) break;
        // }
    }
    
    client(id);
}


