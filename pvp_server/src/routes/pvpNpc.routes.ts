import { Router } from 'express';
import { pvpNpcController } from '../controllers';

const router = Router();

router.post('/pvpTalk', pvpNpcController.pvpTalk);

router.post('/pvpGo', pvpNpcController.pvpGo);

router.post('/help', pvpNpcController.help);

export default router;
