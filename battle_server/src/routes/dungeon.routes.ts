import { Router } from 'express';
import { dungeonController } from '../controllers';


const router = Router();

router.post('/load', dungeonController.dungeonList);
router.post('/help', dungeonController.help);
router.post('/wrongCommand', dungeonController.wrongCommand);

router.post('/dungeonList', dungeonController.dungeonList);
router.post('/dungeonInfo', dungeonController.dungeonInfo);


export default router;