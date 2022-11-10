import { Router } from 'express';


const router = Router();


import front from './front'

router.get('/', async (req, res, next) => {
    console.log('APIIIIIIIIIIIIIIII')


    res.status(200).json({
        message: 'API INDEX',
    });
});


export default router;
