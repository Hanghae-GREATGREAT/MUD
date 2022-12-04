import { Router } from 'express';
import frontRouter from './front.routes';
import chatRouter from './chat.routes';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'FRONT/CHAT SERVER',
    });
});

export { frontRouter, chatRouter };
