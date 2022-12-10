import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

class Env {
    PORT: number;
    SRC_PATH: string;
    DB_HOST: string;
    DB_NAME: string;
    DB_USER: string;
    DB_PASSWORD: string;

    NODE_ENV: string;
    
    HOST: string;
    FRONT_PORT: number;

    REDIS_URL: string;

    constructor() {
        this.NODE_ENV = process.env.NODE_ENV ? process.env.NODE_ENV.trim().toLowerCase() : 'development';

        this.PORT = Number(process.env.PVP_PORT);
        this.SRC_PATH = path.resolve(__dirname);

        this.DB_HOST = process.env.NODE_ENV === 'production' ? 
            process.env.PRD_HOST! : process.env.DEV_HOST!;
        this.DB_NAME = process.env.NODE_ENV === 'production' ? 
            process.env.PRD_NAME! : process.env.DEV_NAME!;
        this.DB_USER = process.env.NODE_ENV === 'production' ? 
            process.env.PRD_USER! : process.env.DEV_USER!;
        this.DB_PASSWORD = process.env.NODE_ENV === 'production' ? 
            process.env.PRD_PASSWORD! : process.env.DEV_PASSWORD!;

        const REDIS_PORT = process.env.NODE_ENV === 'production' ?
            Number(process.env.REDIS_PORT) : Number(process.env.REDIS_CLOUD_PORT);
        const REDIS_HOST = process.env.NODE_ENV === 'production' ? 
            process.env.REDIS_HOST! : process.env.REDIS_CLOUD_HOST!;
        const REDIS_USER = process.env.NODE_ENV === 'production' ?
            process.env.REDIS_USER! : process.env.REDIS_CLOUD_USER!;
        const REDIS_PASSWORD = process.env.NODE_ENV === 'production' ? 
            process.env.REDIS_PASSWORD! : process.env.REDIS_CLOUD_PASSWORD!;

        this.REDIS_URL = process.env.NODE_ENV === 'production' ?
            `redis://${REDIS_HOST}:${REDIS_PORT}` :
            `redis://${REDIS_USER}:${REDIS_PASSWORD}@${REDIS_HOST}:${REDIS_PORT}/0`;

        this.FRONT_PORT = Number(process.env.FRONT_PORT);
        this.HOST =
            this.NODE_ENV === 'production' ? process.env.HOST || 'localhost' : 'localhost';
    }
}

export default new Env();