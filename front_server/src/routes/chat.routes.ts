import { Router } from 'express';
import { chatController } from '../controllers';

const router = Router();

router.post('/submit', chatController.submit);
router.post('/chatLeave', chatController.chatLeave);

router.post('/pvpSubmit', chatController.pvpSubmit);
router.post('/pvpChatStart', chatController.pvpChatStart);
router.post('/pvpChatLeave', chatController.pvpChatLeave);

export default router;
