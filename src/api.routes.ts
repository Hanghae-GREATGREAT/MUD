import { Router } from 'express';


const router = Router();

import { CharacterService } from './services';
import { Characters } from './db/models'
router.get('/', async (req, res, next) => {

    // const character = await CharacterService.findOneByUserId(1)
    const result = await Characters.findByPk(100);

    res.status(200).json({
        message: 'API INDEX',
        result
    });
});


export default router;
