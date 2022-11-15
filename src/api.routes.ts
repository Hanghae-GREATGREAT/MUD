import { Router } from 'express';


const router = Router();

import { battleCache, redis } from './db/cache';
import { Skills } from './db/models';
import { CharacterService } from './services';
import { battle } from './handler'

router.get('/', async (req, res, next) => {

    // 스킬 정보 가져오기 & 사용할 스킬 선택 (cost 반비례 확률)
    const { attack, skill } = await CharacterService.findByPk(2);
    
    const result = battle.skillSelector(skill);


    res.status(200).json({
        message: 'API INDEX',
        result,
    });
});


export default router;
