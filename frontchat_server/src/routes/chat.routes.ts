import { Router } from 'express';
import { chatController } from '../controllers';

const router = Router();

router.post('/submit', chatController.submit);

export default router;
