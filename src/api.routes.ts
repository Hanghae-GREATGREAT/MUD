import { Router } from 'express';


const router = Router();

import { battleCache, redis } from './db/cache';
router.get('/', async (req, res, next) => {

    const data = {
        dungeonLevel: 1,
        monsterId: 10,
        loopId: 'loopId',
        quit: '1',
        characterId: 1
    }    
    // await redis.hSet('111', data)
    const { monsterId } = await redis.hGetAll('222');

    res.status(200).json({
        message: 'API INDEX',
        monsterId
    });
});


export default router;
