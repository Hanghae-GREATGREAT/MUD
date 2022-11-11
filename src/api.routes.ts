import { Router } from 'express';


const router = Router();


router.get('/', async (req, res, next) => {
    res.status(200).json({
        message: 'API INDEX',
    });
});


export default router;
