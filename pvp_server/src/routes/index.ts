import { Router } from 'express';
import pvpRouter from './pvp.routes';
import pvpNpcRouter from './pvpNpc.routes'

const router = Router();

router.use('/pvp', pvpRouter);
router.use('/pvpNpc', pvpNpcRouter);

export default router;
