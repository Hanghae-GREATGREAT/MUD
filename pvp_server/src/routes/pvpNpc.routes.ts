import { Router } from 'express';
import { pvpNpcController } from '../controllers';

const router = Router();

router.post('/pvpTalk', pvpNpcController.pvpTalk);

router.post('/pvpGo', pvpNpcController.pvpGo);

export default router;
