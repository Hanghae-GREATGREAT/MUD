import { Router } from 'express';
import pvpRouter from './pvp.routes';
import pvpNpcRouter from './pvpNpc.routes'

const router = Router();

router.get('/', (req, res) => {
    console.log('BATTLE INDEX');
    res.status(200).json({ message: 'BATTLE INDEX '});
});

router.get('/report', (req, res) => {

    res.status(200).json({
        report: process.report?.getReport()
    })
});

router.use('/pvp', pvpRouter);
router.use('/pvpNpc', pvpNpcRouter);

export default router;
