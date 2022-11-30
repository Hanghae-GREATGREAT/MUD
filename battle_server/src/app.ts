import express from 'express';
import env from './env';
import { errorHandler } from './middlewares/errorHandler';
import { battleRouter, dungeonRouter } from './routes';

const { PORT } = env;
const app = express();


app.use(express.json());
app.use((req, res, next) => {
    res.set({
        'Access-Control-Allow-Origins': req.headers.origin,
        'Access-Control-Allow-Methods': 'GET,POST',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    next();
});

app.use('/battle', battleRouter);
app.use('/dungeon', dungeonRouter);

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(env);
    console.log(`BATTLE SERVER RUNNING ON ${PORT}`);
});