import request from 'supertest';
import app from '../src/app';
import env from '../src/config.env';
import sequelize from '../src/db/config/connection';
import association from '../src/db/config/associate';


describe('api test', () => {
    const OLD_ENV = process.env;

    beforeAll(async()=>{
        console.log(env);
        await sequelize.authenticate();
        association();
    });

    beforeEach(()=>{
        jest.resetModules();
        process.env = { ...OLD_ENV };
    });

    afterAll(async()=>{
        process.env = OLD_ENV;
        await sequelize.close();
    });

    test('api test. success. status 200', async() => {
        const response = await request(app).get('/api');

        expect(response.status).toBe(200);
    });

    test('front page test. success. status 200', async() => {
        const response = await request(app).get('/');

        expect(response.status).toBe(200);
    });
});