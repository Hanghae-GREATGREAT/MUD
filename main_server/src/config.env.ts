import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

interface DBInterface {
    [key: string]: string;
}

class dBConnection {
    NODE_ENV: string;

    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;

    REDIS_URL: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : 'development';

        const DB: DBInterface = {
            test: 'TEST',
            development: 'DEV',
            production: 'PRD',
        };

        this.DB_HOST = process.env[`${DB[this.NODE_ENV]}_HOST`]!;
        this.DB_NAME = process.env[`${DB[this.NODE_ENV]}_NAME`]!;
        this.DB_USER = process.env[`${DB[this.NODE_ENV]}_USER`]!;
        this.DB_PASSWORD = process.env[`${DB[this.NODE_ENV]}_PASSWORD`]!;

        const REDIS_HOST = process.env[`REDIS_${DB[this.NODE_ENV]}_HOST`]!;
        const REDIS_USER = process.env[`REDIS_${DB[this.NODE_ENV]}_USER`]!;
        const REDIS_PASSWORD = process.env[`REDIS_${DB[this.NODE_ENV]}_PASSWORD`]!;
        const REDIS_PORT = Number(process.env[`REDIS_${DB[this.NODE_ENV]}_PORT`]);

        this.REDIS_URL =
            this.NODE_ENV === 'production'
                ? `redis://${REDIS_HOST}:${REDIS_PORT}`
                : `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0`;
    }
}

class Env extends dBConnection {
    HTTP: string;
    WS: string;

    HOST: string;
    ROOT_PATH: string;
    SRC_PATH: string;
    WAS_LB: string;
    
    PORT: number;
    BATTLE_PORT: number;
    FRONT_PORT: number;
    PVP_PORT: number;


    constructor() {
        super();

        this.HTTP = process.env.HTTP || 'http';
        this.WS = process.env.WS || 'ws';

        this.PORT = Number(process.env.PORT);
        this.BATTLE_PORT = Number(process.env.BATTLE_SERVER_PORT);
        this.FRONT_PORT = Number(process.env.FRONT_SERVER_PORT);
        this.PVP_PORT = Number(process.env.PVP_SERVER_PORT);

        this.HOST =
            this.NODE_ENV === 'production' ? process.env.HOST || 'localhost' : 'localhost';
        this.WAS_LB = `${this.HOST}:${process.env.WAS_LB_PORT}`;


        this.ROOT_PATH = path.resolve('./');
        this.SRC_PATH = path.resolve(__dirname);
    }
}

export default new Env();
