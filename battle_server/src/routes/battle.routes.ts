import { Router } from 'express';
import { battleController, dungeonController } from '../controllers';


const router = Router();

router.post('/help', battleController.help);
router.post('/ectHelp', battleController.encounterHelp);
router.post('/autoHelp', battleController.autoHelp);
router.post('/autoHelpS', battleController.autoHelpS);

router.post('/normal', battleController.encounter);
router.post('/attack', battleController.attack);
router.post('/quit', battleController.quit);
router.post('/action', battleController.action);

router.post('/auto', battleController.autoBattle);
router.post('/autoW', battleController.autoBattleWorker);
router.post('/autoQuit', battleController.autoQuit);
router.post('/autoQuitS', battleController.autoQuitS);

router.post('/dungeonInfo', dungeonController.dungeonList);


export default router;