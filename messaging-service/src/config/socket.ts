import { Server as SocketServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import jwt from 'jsonwebtoken';

export interface AuthenticatedSocket extends Socket {
  userId: string;
  userType: string;
}

export class SocketConfig {
  private io: SocketServer;

  constructor(httpServer: HttpServer) {
    this.io = new SocketServer(httpServer, {
      cors: {
        origin: "*", 
        methods: ['GET', 'POST'],
        credentials: false
      },
      allowEIO3: true,
      transports: ['websocket', 'polling']
    });

    this.setupAuthentication();
  }

  private setupAuthentication(): void {
    this.io.use((socket: any, next) => {
      try {
        const userId = socket.handshake.auth?.userId || socket.handshake.query?.userId;

        if (!userId) {
          return next(new Error('User ID required'));
        }

        socket.userId = userId;
        socket.userType = socket.handshake.auth?.userType || 'mentee';

        next();
      } catch (error) {
        next(new Error('Authentication failed'));
      }
    });
  }

  public getIO(): SocketServer {
    return this.io;
  }

  public setupEventHandlers(messagingController: any): void {
    this.io.on('connection', (socket: any) => {
      socket.join(`user:${socket.userId}`);

      socket.on('send_message', (data: any) => {
        messagingController.handleSendMessage(socket, data);
      });

      socket.on('join_conversation', (data: any) => {
        messagingController.handleJoinConversation(socket, data);
      });

      socket.on('leave_conversation', (data: any) => {
        messagingController.handleLeaveConversation(socket, data);
      });

      socket.on('typing_start', (data: any) => {
        messagingController.handleTypingStart(socket, data);
      });

      socket.on('typing_stop', (data: any) => {
        messagingController.handleTypingStop(socket, data);
      });

      socket.on('disconnect', () => {});
    });
  }
}
