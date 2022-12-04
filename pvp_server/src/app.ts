import express from 'express';
import sequelize from './db/config/connection';
import env from './env';
import { errorHandler } from './middlewares/errorHandler';
import router from './routes';
import associate from './db/config/associate';

const { PORT } = env;
const app = express();

if (process.env.NODE_ENV !== 'test') {
    sequelize.authenticate().then(() => {
        associate();
        console.log('DB CONNECTED');
    }).catch((error) => {
        console.error(error);
        console.log('DB CONNECTION FAIL');
    
        process.exit(0);
    });    
}

app.use(express.json());
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origins': req.headers.origin,
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    next();
});

app.use('/', router);

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(env);
    console.log(`PVP SERVER RUNNING ON ${PORT}`);
});