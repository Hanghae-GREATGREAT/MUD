import { Router } from 'express';
import { battleCache } from './db/cache';
import { CharacterService } from './services';


const router = Router();

router.get('/', async (req, res, next) => {


    res.status(200).json({
        message: 'API INDEX',
    });
});

router.get('/userStatus/:characterId', async(req, res) => {
    const { characterId } = req.params;

    const userStatus = await CharacterService.getUserStatus(characterId);
    
    res.status(200).json({ userStatus });
});

router.get('/battleCache', (req, res) => {
    const cache = battleCache.getAll();

    console.log(cache);
    res.status(200).json({ cache });
});


export default router;
