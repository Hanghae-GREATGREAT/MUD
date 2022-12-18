const user_load = require('./load');

const sleep = (ms) => {
    return new Promise(r => setTimeout(r, ms));
}

(async() => {
    user_load('random', 1000, 1000*60*15, 500, 10);
    await sleep(1000*120);
    
    user_load('random', 2000, 1000*60*3, 200, 10);

    await sleep(1000*180);

    user_load('random', 3000, 1000*60*6, 500, 10);

    setTimeout(()=>process.exit(0), 1000*(600)*1.2);

    process.on('uncaughtException', ()=>{
        console.log('uncaughtException');
        process.exit(0);
    });
})();