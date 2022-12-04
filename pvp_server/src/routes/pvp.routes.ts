import { Router } from 'express';
import { pvpController } from '../controllers';

const router = Router();

router.get('/', (req, res) => {
    res.status(200).json({
        message: 'PVP SERVER',
    });
});

router.post('/createRoom', pvpController.createRoom);

router.post('/joinRoom', pvpController.joinRoom);

router.post('/getUsers', pvpController.getUsers);

router.post('/leaveRoom', pvpController.leaveRoom);

router.post('/target', pvpController.target);

router.post('/pickSkill', pvpController.pickSkill);

router.post('/wrongCommand', pvpController.wrongCommand);

router.post('/help', pvpController.help)

export default router;
