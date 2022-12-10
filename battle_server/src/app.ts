import express from 'express';
import associate from './db/config/associate';
import sequelize from './db/config/connection';
import env from './env';
import { errorHandler } from './middlewares/errorHandler';
import { battleRouter, dungeonRouter } from './routes';

const { PORT } = env;
const app = express();


sequelize.authenticate().then(() => {
    associate();
    console.log('DB CONNECTED');
}).catch((error) => {
    console.error(error);
    console.log('DB CONNECTION FAIL');
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
    console.log('BATTLE INDEX');
    res.status(200).json({ message: 'BATTLE INDEX '});
});

import { autoAttackWorker, skillAttackWorker, isMonsterDeadWorker } from './workers';
import { battleCache } from './db/cache';
app.get('/cache', (req, res) => {
    const autoWorkers = autoAttackWorker.all();
    const skillWorkers = skillAttackWorker.all();
    const deadWorkers = isMonsterDeadWorker.all();
    const cache = battleCache.getAll();
    console.log(cache);

    res.status(200).json({
        autoWorkers, skillWorkers, deadWorkers, cache
    });
});

app.get('/clear', (req, res) => {
    const cache = battleCache.getAll();
    const battles = Object.entries(cache);

    const total = battles.length;
    let cnt = 0;
    for (const battle of battles) {
        const [ characterId, cache ] = battle;
        if (Object.hasOwn(cache, 'autoAttackTimer')) {
            clearInterval(cache.autoAttackTimer);
            cnt++;
        }
        battleCache.delete(characterId);
    }

    const message = `deleted Timers: ${cnt}, deleted Cache: ${total}`;
    console.log(message);

    res.status(200).json({ message });
});

app.get('/report', (req, res) => {

    res.status(200).json({
        report: process.report?.getReport()
    })
});

app.use('/battle', battleRouter);
app.use('/dungeon', dungeonRouter);

app.use(errorHandler);


app.listen(PORT, () => {
    console.log(env);
    console.log(`BATTLE SERVER RUNNING ON ${PORT}`);
});