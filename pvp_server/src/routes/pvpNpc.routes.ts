import { Router } from 'express';
import { pvpNpcController } from '../controllers';

const router = Router();

router.post('/pvpTalk', pvpNpcController.pvpTalk);

router.post('/pvpGo', pvpNpcController.pvpGo);

// router.post('/wrongCommand', pvpController.wrongCommand);

// router.post('/help', pvpController.help)

export default router;
