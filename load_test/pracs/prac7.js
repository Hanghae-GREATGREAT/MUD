const { EventEmitter } = require('events');
const { AsyncResource } = require('async_hooks');

const a = new AsyncResource()
const b = a.runInAsyncScope()


class WorkerPool extends EventEmitter {}

const w = new WorkerPool();

w.on

// const worker = require('workerpool');

// if (worker.isMainThread) {
//     const pool = worker.pool(__filename, {
//         maxWorkers: 10,
//         minWorkers: 5,
//         maxQueueSize: 10
//     });
    
//     const M = 10;
//     const threads = new Set();
    
//     for(let i=0; i<M; i++) {
//         pool.exec('client', [i]).then((res) => {
//             console.log(res);
//         }).catch(err => console.error(err)).then(() => pool.terminate());
//     }
// } else {
//     const sleep = (ms) => {
//         return new Promise(r => setTimeout(r, ms));
//     }
    
//     const asyncFunc = (N, i, n) => {
//         return new Promise((resolve, reject) => {
//             setTimeout(() => {
//                 console.log('ASYNC!!!', N, i, n);
//                 resolve(`ASYNC RESOLVED ${N} ${i} ${n}`);
//             }, 500);
//         });
//     }
    
//     const client = async(N) => {
//         const start = Date.now();
//         let i = 0;
//         while (true) {
//             const res = await asyncFunc(N, i, 1);
//             console.log(res);
        
//             await sleep(Math.random()*3000);
        
//             const res2 = await asyncFunc(N, i, 2);
//             console.log(res2);
        
//             await sleep(Math.random()*3000);
//             i++;
            
//             const time = Date.now();
//             if (time - start > 30000) break;
//         }
//     }

//     worker.pool({
//         client: client
//     })
// }