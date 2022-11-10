import { createClient, RedisClientType, SetOptions } from 'redis';
import env from '../../config.env';


class RedisCache {

    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: `redis://${env.REDIS_USER}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}`
        });
        this.connect();

        this.client.on('connect', () => {
            console.log('Redis connected');
        });

        this.client.on('error', (error) => {
            console.log('Redis error, service degraded: ', error);
        });
    }

    private async connect() {
        await this.client.connect();
    }

    async set(key: string, value: string, option: SetOptions = {} ) {
        await this.client.set(key, value, option);
    }

    async get(key: string) {
        return await this.client.get(key);
    }

    async del(key: string) {
        await this.client.del(key);
    }

    async disconnect() {
        await this.client.disconnect();
    }
}


export default new RedisCache();


// export class RedisCache {
//     private readonly cache: RedisClientType;
//     private ttl: number;

//     constructor(ttl: number) {

//         this.ttl = ttl;
//         this.cache = createClient({
//             url: `redis://${env.REDIS_USER}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}`
//         });

//         this.cache.on('connect', () => {
//             console.log('Redis connected');
//         });

//         this.cache.on('error', (error) => {
//             console.log('Redis error, service degraded: ', error);
//         });
//     }

//     async get<T>(key: string, fetcher: ()=>Promise<T>): Promise<T> {

//         if (!this.cache.connect) {}

//     }
// }
