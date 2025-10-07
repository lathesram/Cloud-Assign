import { Request, Response } from 'express';
import { Server as SocketServer } from 'socket.io';
import { MessagingService } from '../../core/services/messaging.service';
import { SendMessageRequest, SocketEvents } from '../../models/message.model';
import Joi from 'joi';

export class MessagingController {
  private messagingService: MessagingService;
  private io: SocketServer;

  constructor(io: SocketServer) {
    this.messagingService = new MessagingService();
    this.io = io;
  }

  async handleSendMessage(socket: any, data: any): Promise<void> {
    try {
      const schema = Joi.object({
        receiverId: Joi.string().required(),
        content: Joi.string().required(),
        messageType: Joi.string().valid('text', 'image', 'file', 'code').default('text')
      });

      const { error, value } = schema.validate(data);
      if (error) {
        socket.emit(SocketEvents.ERROR, { message: error.details[0]?.message || 'Validation error' });
        return;
      }

      const messageRequest: SendMessageRequest = value;
      const message = await this.messagingService.sendMessage(socket.userId, messageRequest);

      socket.emit(SocketEvents.MESSAGE_SENT, message);

      socket.to(`user:${messageRequest.receiverId}`).emit(SocketEvents.MESSAGE_RECEIVED, message);

      const conversationRoom = `conv:${message.conversationId}`;
      socket.join(conversationRoom);
      socket.to(`user:${messageRequest.receiverId}`).socketsJoin(conversationRoom);

    } catch (error) {
      socket.emit(SocketEvents.ERROR, { message: 'Failed to send message' });
    }
  }

  async handleJoinConversation(socket: any, data: any): Promise<void> {
    try {
      const { otherUserId } = data;
      if (!otherUserId) {
        socket.emit(SocketEvents.ERROR, { message: 'Other user ID is required' });
        return;
      }

      const conversationId = this.generateConversationId(socket.userId, otherUserId);
      socket.join(`conv:${conversationId}`);

      await this.messagingService.markMessagesAsRead(conversationId, socket.userId);

      socket.emit('joined_conversation', { conversationId });
    } catch (error) {
      socket.emit(SocketEvents.ERROR, { message: 'Failed to join conversation' });
    }
  }

  async handleLeaveConversation(socket: any, data: any): Promise<void> {
    try {
      const { conversationId } = data;
      if (conversationId) {
        socket.leave(`conv:${conversationId}`);
        socket.emit('left_conversation', { conversationId });
      }
    } catch (error) {}
  }

  async handleTypingStart(socket: any, data: any): Promise<void> {
    try {
      const { otherUserId } = data;
      if (otherUserId) {
        socket.to(`user:${otherUserId}`).emit(SocketEvents.USER_TYPING, {
          userId: socket.userId,
          isTyping: true
        });
      }
    } catch (error) {}
  }

  async handleTypingStop(socket: any, data: any): Promise<void> {
    try {
      const { otherUserId } = data;
      if (otherUserId) {
        socket.to(`user:${otherUserId}`).emit(SocketEvents.USER_TYPING, {
          userId: socket.userId,
          isTyping: false
        });
      }
    } catch (error) {}
  }

  async getConversationMessages(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.params;
      const { limit, lastEvaluatedKey } = req.query;
      const userId = (req as any).user?.userId;

      if (!otherUserId) {
        res.status(400).json({ error: 'Other user ID is required' });
        return;
      }

      if (!userId) {
        res.status(400).json({ error: 'User ID required' });
        return;
      }

      const result = await this.messagingService.getConversationMessages(
        userId,
        otherUserId,
        limit ? parseInt(limit as string) : 50,
        lastEvaluatedKey ? JSON.parse(lastEvaluatedKey as string) : undefined
      );

      res.json(result);
    } catch (error) {

      res.status(500).json({ error: 'Failed to retrieve messages' });
    }
  }

  async getUserConversations(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(400).json({ error: 'User ID required' });
        return;
      }

      const conversations = await this.messagingService.getUserConversations(userId);
      res.json({ conversations });
    } catch (error) {

      res.status(500).json({ error: 'Failed to retrieve conversations' });
    }
  }

  async sendMessageHTTP(req: Request, res: Response): Promise<void> {
    try {
      const { receiverId, content, messageType = 'text' } = req.body;
      const userId = (req as any).user?.userId;

      if (!userId) {
        res.status(400).json({ error: 'User ID required' });
        return;
      }

      if (!receiverId || !content) {
        res.status(400).json({ error: 'Receiver ID and content are required' });
        return;
      }

      const messageRequest: SendMessageRequest = {
        receiverId,
        content,
        messageType
      };

      const message = await this.messagingService.sendMessage(userId, messageRequest);

      this.io.to(`user:${receiverId}`).emit(SocketEvents.MESSAGE_RECEIVED, message);

      res.json({ success: true, message });
    } catch (error) {

      res.status(500).json({ error: 'Failed to send message' });
    }
  }

  async markConversationAsRead(req: Request, res: Response): Promise<void> {
    try {
      const { otherUserId } = req.params;
      const userId = (req as any).user?.userId;

      if (!userId || !otherUserId) {
        res.status(400).json({ error: 'User ID and other user ID required' });
        return;
      }

      const conversationId = this.generateConversationId(userId, otherUserId);
      await this.messagingService.markMessagesAsRead(conversationId, userId);

      res.json({ success: true });
    } catch (error) {

      res.status(500).json({ error: 'Failed to mark messages as read' });
    }
  }

  private generateConversationId(userId1: string, userId2: string): string {
    const sortedIds = [userId1, userId2].sort();
    return `conv_${sortedIds[0]}_${sortedIds[1]}`;
  }
}
