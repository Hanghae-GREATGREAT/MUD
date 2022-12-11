import { createClient, RedisClientType, SetOptions } from 'redis';
import env from '../../env';

interface KeyPair {
    [key: string]: string | number;
}

class RedisCache {
    private readonly client: RedisClientType;

    constructor() {
        this.client = createClient({
            url: env.REDIS_URL,
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

    // { dungeonLevel, monsterId, LOOP }
    async battleSet(key: string|number, value: KeyPair) {
        const cache = await this.battleGet(key);

        const input = { ...cache, ...value }
        await this.client.set(`battle${key}`, JSON.stringify(input), { EX: 60 });
    }

    async battleGet(key: string|number): Promise<KeyPair> {
        const cache = await this.client.get(`battle${key}`) || '{}';
        return JSON.parse(cache);
    }

    async battleDel(key: string|number) {
        await this.client.del(`battle${key}`);
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

    async disconnect() {
        await this.client.disconnect();
    }

    getClient() {
        return this.client;
    }
}

export default new RedisCache();