import { Router } from 'express';


const router = Router();

import redis from './db/redis/config';
router.get('/', async (req, res, next) => {

    const dungeonSession = {
        dungeonLevel: 999,
        monsterId: 789
    }
    // await redis.hSet('222', dungeonSession);
    const result = await redis.hGetAll('222');
    console.log(result);
    console.log(typeof result.dungeonLevel)
    console.log(typeof result.monsterId)

    res.status(200).json({
        message: 'API INDEX',
    });
});


export default router;
