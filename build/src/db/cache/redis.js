"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
const config_env_1 = __importDefault(require("../../config.env"));
class RedisCache {
    constructor() {
        this.client = (0, redis_1.createClient)({
            url: `redis://${config_env_1.default.REDIS_USER}:${config_env_1.default.REDIS_PASSWORD}@${config_env_1.default.REDIS_HOST}/0`,
        });
        this.connect();
        this.client.on('connect', () => {
            console.log('Redis connected');
        });
        this.client.on('error', (error) => {
            console.log('Redis error, service degraded: ', error);
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.connect();
        });
    }
    set(key, value, option = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.set(key.toString(), value, option);
        });
    }
    get(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.get(key.toString());
        });
    }
    del(key) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.del(key.toString());
        });
    }
    hSet(key, data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.hSet(key.toString(), data);
        });
    }
    hGet(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.hGet(key.toString(), field);
        });
    }
    hGetAll(key) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.client.hGetAll(key.toString());
        });
    }
    hDel(key, field) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.hDel(key.toString(), field);
        });
    }
    hDelBattleCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // const fields = Object.keys(data);
            const fields = [
                'characterId', 'dungeonLevel', 'monsterId', 'autoAttackId', 'quit', 'dead'
            ];
            yield this.client.hDel(key.toString(), [...fields]);
        });
    }
    hDelResetCache(key) {
        return __awaiter(this, void 0, void 0, function* () {
            // const fields = Object.keys(data);
            const fields = [
                'characterId', 'monsterId', 'autoAttackId', 'quit', 'dead'
            ];
            yield this.client.hDel(key.toString(), [...fields]);
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.client.disconnect();
        });
    }
    getClient() {
        return this.client;
    }
}
exports.default = new RedisCache();
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
