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
    PORT: number;
    HOST: string;
    CLIENT_URL: string;
    ROOT_PATH: string;
    SRC_PATH: string;

    BATTLE_URL: string;
    BATTLE_PORT: number;


    FRONTCHAT_URL: string;
    FRONTCHAT_PORT: number;
    
    PVP_URL: string;
    PVP_PORT: number;

    constructor() {
        super();

        this.PORT = Number(process.env.PORT) || 8080;
        this.HOST = process.env.HOST || 'localhost';
        this.CLIENT_URL = process.env.CLIENT_URL || 'localhost:80';
        this.ROOT_PATH = path.resolve('./');
        this.SRC_PATH = path.resolve(__dirname);

        this.BATTLE_PORT = Number(process.env.BATTLE_SERVER_PORT);
        this.BATTLE_URL =
            this.NODE_ENV === 'production' ? process.env.BATTLE_SERVER_URL || 'localhost' : 'localhost';

        this.FRONTCHAT_PORT = Number(process.env.FRONTCHAT_SERVER_PORT);
        this.FRONTCHAT_URL =
            this.NODE_ENV === 'production' ? process.env.FRONTCHAT_SERVER_URL || 'localhost' : 'localhost';

        this.PVP_PORT = Number(process.env.PVP_SERVER_PORT);
        this.PVP_URL =
            this.NODE_ENV === 'production' ? process.env.PVP_SERVER_URL || 'localhost' : 'localhost';
    }
}

export default new Env();
