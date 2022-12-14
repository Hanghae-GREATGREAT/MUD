

import { redis } from './src/db/cache';


const main = async() => {
    console.log('hi')
    
    const map = new Map();

    map.set('map', 'qwe');
    await redis.set('redis', '123', { EX: 60 });

    console.time('map');
    const getMap = map.get('map');
    console.timeEnd('map');

    await redis.get('redis');
    console.time('redis');
    const getRedis = await redis.get('redis');
    console.timeEnd('redis');

    return 'good';
}

main().then((res) => {
    console.log(res);

    redis.disconnect().then(() => {
        process.exit(0);
    }).catch((err)=>{
        process.exit(1);
    });
}).catch(console.error)