import express from 'express';
import { MessagingController } from '../controllers/messaging.controller';
import { authMiddleware, devAuthMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

let messagingController: MessagingController;

export const initializeRoutes = (controller: MessagingController) => {
  messagingController = controller;
};

const authMW = process.env.NODE_ENV === 'development' ? devAuthMiddleware : authMiddleware;

router.post('/send', authMW, async (req, res) => {
  await messagingController.sendMessageHTTP(req, res);
});

router.get('/conversations/:otherUserId/messages', authMW, async (req, res) => {
  await messagingController.getConversationMessages(req, res);
});

router.get('/conversations', authMW, async (req, res) => {
  await messagingController.getUserConversations(req, res);
});

router.put('/conversations/:otherUserId/read', authMW, async (req, res) => {
  await messagingController.markConversationAsRead(req, res);
});

router.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'messaging-service',
    timestamp: new Date().toISOString()
  });
});

export default router;
