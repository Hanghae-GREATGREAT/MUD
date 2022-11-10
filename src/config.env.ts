import path from 'path';
import dotenv from 'dotenv';
dotenv.config();


interface DBI {
    [key: string]: string;
}

class dBConnection {

    NODE_ENV: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_HOST: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV ? 
            ( process.env.NODE_ENV ).trim().toLowerCase() : 'development';

        const DB: DBI = {
            test: 'TEST',
            development: 'DEV',
            production: 'PRD',
        }

        this.DB_HOST = process.env[`${DB[this.NODE_ENV]}_HOST`]!;
        this.DB_NAME = process.env[`${DB[this.NODE_ENV]}_NAME`]!;
        this.DB_USER = process.env[`${DB[this.NODE_ENV]}_USER`]!;
        this.DB_PASSWORD = process.env[`${DB[this.NODE_ENV]}_PASSWORD`]!;   
    }
}


class Env extends dBConnection {

    PORT: number;
    ROOT_PATH: string;
    REDIS_HOST: string;
    REDIS_USER: string;
    REDIS_PASSWORD: string;

    constructor() {
        super();

        this.PORT = Number(process.env.PORT) || 8080;
        this.ROOT_PATH = path.resolve('../');

        this.REDIS_HOST = process.env.REDIS_HOST!;
        this.REDIS_USER = process.env.REDIS_USER!;
        this.REDIS_PASSWORD = process.env.REDIS_PASSWORD!;
    }
}


export default new Env();