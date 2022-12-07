import { createClient, RedisClientType, SetOptions } from 'redis';
import env from '../../env';
import { PvpUser } from '../../interfaces/pvp';
import { UserStatus } from '../../interfaces/user';

interface KeyPair {
    [key: string]: string | number;
}

interface PvpKeyPair {
    [key: string]: string;
}

class RedisCache {
    private readonly client: RedisClientType;

    constructor() {
        const { REDIS_URL } = env
        this.client = createClient({ url: REDIS_URL });
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

    async hGetPvpUser(key: string, field: string): Promise<UserStatus> {
        const user = await this.client.hGet(key.toString(), field);

        return JSON.parse(user!);
    }

    async hGetPvpRoom(key: string): Promise<PvpUser> {
        const room = await this.client.hGetAll(key.toString());
        
        const entries = Object.entries(room);
        const parse = [];
        for (const entry of entries) {
            parse.push([entry[0], JSON.parse(entry[1])]);
        }
        const output: PvpUser = Object.fromEntries(parse);

        return output
    }

    async hSetPvpUser(key: string, data: PvpUser) {
        const entries = Object.entries(data);
        const serialize = [];
        for (const entry of entries) {
            serialize.push([entry[0], JSON.stringify(entry[1])]);
        }
        const input: PvpKeyPair = Object.fromEntries(serialize);

        await this.client.hSet(key.toString(), input);
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