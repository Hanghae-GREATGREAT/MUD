import { createClient, RedisClientType, SetOptions } from 'redis';
import env from '../../config.env';

interface KeyPair {
    [key: string]: string | number;
}

class RedisCache {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: `redis://${env.REDIS_USER}:${env.REDIS_PASSWORD}@${env.REDIS_HOST}/0`,
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

    async set(key: string|number, value: string, option: SetOptions = {}) {
        await this.client.set(key.toString(), value, option);
    }

    async get(key: string|number) {
        return await this.client.get(key.toString());
    }

    async del(key: string|number) {
        await this.client.del(key.toString());
    }

    async hSet(key: string|number, data: KeyPair) {
        await this.client.hSet(key.toString(), data);
    }

    async hGet(key: string|number, field: string) {
        return await this.client.hGet(key.toString(), field);
    }

    async hGetAll(key: string|number) {
        return await this.client.hGetAll(key.toString());
    }

    async hDel(key: string|number, field: string) {
        await this.client.hDel(key.toString(), field);
    }

    async hDelBattleCache(key: string|number) {
        // const fields = Object.keys(data);
        const fields = [
            'characterId', 'dungeonLevel', 'monsterId', 'autoAttackId', 'quit', 'dead'
        ];
        await this.client.hDel(key.toString(), [...fields]);
    }

    async hDelResetCache(key: string|number) {
        // const fields = Object.keys(data);
        const fields = [
            'characterId', 'monsterId', 'autoAttackId', 'quit', 'dead'
        ];
        await this.client.hDel(key.toString(), [...fields]);
    }

    async disconnect() {
        await this.client.disconnect();
    }

    getClient() {
        return this.client;
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
