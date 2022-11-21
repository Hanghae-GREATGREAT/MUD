import { Router } from 'express';
import { battleCache } from './db/cache';


const router = Router();

router.get('/', async (req, res, next) => {


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
