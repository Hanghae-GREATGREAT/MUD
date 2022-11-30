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
    REDIS_HOST: string;
    REDIS_USER: string;
    REDIS_PASSWORD: string;
    REDIS_PORT: number;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV ? 
            ( process.env.NODE_ENV ).trim().toLowerCase() : 'development';

        const DB: DBInterface = {
            test: 'TEST',
            development: 'DEV',
            production: 'PRD',
        }

        this.DB_HOST = process.env[`${DB[this.NODE_ENV]}_HOST`]!;
        this.DB_NAME = process.env[`${DB[this.NODE_ENV]}_NAME`]!;
        this.DB_USER = process.env[`${DB[this.NODE_ENV]}_USER`]!;
        this.DB_PASSWORD = process.env[`${DB[this.NODE_ENV]}_PASSWORD`]!;

        this.REDIS_HOST = process.env[`REDIS_${DB[this.NODE_ENV]}_HOST`]!;
        this.REDIS_USER = process.env[`REDIS_${DB[this.NODE_ENV]}_USER`]!;
        this.REDIS_PASSWORD = process.env[`REDIS_${DB[this.NODE_ENV]}_PASSWORD`]!;
        this.REDIS_PORT = Number(process.env.REDIS_PORT);
    }
}

class Env extends dBConnection {

    PORT: number;
    HOST: string;
    CLIENT_URL: string;
    ROOT_PATH: string;
    SRC_PATH: string;

    constructor() {
        super();

        this.PORT = Number(process.env.PORT) || 8080;
        this.HOST = process.env.HOST || 'localhost';
        this.CLIENT_URL = process.env.CLIENT_URL || 'localhost:80';
        this.ROOT_PATH = path.resolve('./');
        this.SRC_PATH = path.resolve(__dirname);

    }
}


export default new Env();