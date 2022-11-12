import { Router } from 'express';


const router = Router();

import { CharacterService } from './services';
import { Characters } from './db/models'
import redis from './db/redis/config'
router.get('/', async (req, res, next) => {
    redis.getClient().flushAll()
    const character = await CharacterService.findOneByUserId(1)
    // const result = await Characters.findByPk(100);
console.log(character)
    res.status(200).json({
        message: 'API INDEX',
        // result
    });
});


export default router;
