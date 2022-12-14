import express from 'express';
import associate from './db/config/associate';
import sequelize from './db/config/connection';
import env from './env';
import { errorHandler } from './middlewares/errorHandler';
import { frontRouter, chatRouter } from './routes';

const { PORT } = env;
const app = express();

sequelize
    .authenticate()
    .then(() => {
        associate();
        //console.log('DB CONNECTED');
    })
    .catch((error) => {
        console.error(error);
        //console.log('DB CONNECTION FAIL');
        process.exit(0);
    });

app.use(express.json());
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origins': req.headers.origin,
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    next();
});

app.get('/', (req, res) => {
    //console.log('FRONT INDEX');
    res.status(200).json({ message: 'FRONT INDEX' });
});

import { FRONT, CHAT } from './redis';
app.get('/cache', (req, res) => {
    //console.log(FRONT)
    //console.log(CHAT)

    res.status(200).json({ FRONT, CHAT });
});

app.get('/report', (req, res) => {

    res.status(200).json({
        report: process.report?.getReport()
    })
});

app.use('/front', frontRouter);
app.use('/chat', chatRouter);

app.use(errorHandler);

app.listen(PORT, () => {
    //console.log(env);
    //console.log(`FRONT SERVER RUNNING ON ${PORT}`);
});
