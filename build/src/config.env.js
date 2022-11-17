"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
class dBConnection {
    constructor() {
        this.NODE_ENV = process.env.NODE_ENV ?
            (process.env.NODE_ENV).trim().toLowerCase() : 'development';
        const DB = {
            test: 'TEST',
            development: 'DEV',
            production: 'PRD',
        };
        this.DB_HOST = process.env[`${DB[this.NODE_ENV]}_HOST`];
        this.DB_NAME = process.env[`${DB[this.NODE_ENV]}_NAME`];
        this.DB_USER = process.env[`${DB[this.NODE_ENV]}_USER`];
        this.DB_PASSWORD = process.env[`${DB[this.NODE_ENV]}_PASSWORD`];
    }
}
class Env extends dBConnection {
    constructor() {
        super();
        this.PORT = Number(process.env.PORT) || 8080;
        this.ROOT_PATH = path_1.default.resolve('../');
        this.REDIS_HOST = process.env.REDIS_HOST;
        this.REDIS_USER = process.env.REDIS_USER;
        this.REDIS_PASSWORD = process.env.REDIS_PASSWORD;
    }
}
exports.default = new Env();
