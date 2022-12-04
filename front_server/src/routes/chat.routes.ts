import { Router } from 'express';
import { chatController } from '../controllers';

const router = Router();

router.post('/submit', chatController.submit);
router.post('/chatLeave', chatController.chatLeave);

export default router;
