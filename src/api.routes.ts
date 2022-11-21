import { Router } from 'express';


const router = Router();

import { battleCache, redis } from './db/cache';
import { Skills } from './db/models';
import { CharacterService } from './services';
import { battle } from './handler'

router.get('/', async (req, res, next) => {

    // // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    // const { attack, skill } = await CharacterService.findByPk(2);
    
    // const result = battle.skillSelector(skill);


    battleCache.set(1111, { monsterId: 123 });
    console.log(battleCache.get(1111));

    battleCache.set(1111, { dungeonLevel: 1 });
    console.log(battleCache.get(1111));

    res.status(200).json({
        message: 'API INDEX',
    });
});

router.get('/battleCache', (req, res) => {
    const cache = battleCache.getAll();

    console.log(cache);
    res.status(200).json({ cache });
});


export default router;
