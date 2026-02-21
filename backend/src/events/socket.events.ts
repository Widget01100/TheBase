// src/events/socket.events.ts
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { User } from '@/models/User.model';
import { NotificationService } from '@/services/notification.service';
import { RedisService } from '@/services/redis.service';

export class SocketEvents {
  private io: Server;
  private notificationService: NotificationService;
  private redisService: RedisService;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.notificationService = NotificationService.getInstance();
    this.redisService = RedisService.getInstance();
    this.initialize();
  }

  private initialize() {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };
        const user = await User.findById(decoded.id);

        if (!user) {
          return next(new Error('User not found'));
        }

        socket.data.user = user;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: Socket) {
    const user = socket.data.user;
    const userId = user.id.toString();

    console.log(`🔌 User ${userId} connected`);

    // Track user socket
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Join user room
    socket.join(`user:${userId}`);

    // Update user status
    await this.redisService.set(`user:online:${userId}`, 'true', 300); // 5 minutes

    // Send initial data
    await this.sendInitialData(socket, userId);

    // Handle events
    this.registerEventHandlers(socket, userId);

    socket.on('disconnect', () => this.handleDisconnect(socket, userId));
  }

  private async sendInitialData(socket: Socket, userId: string) {
    try {
      // Get unread notifications count
      const unreadCount = await this.notificationService.getUnreadCount(userId);

      // Get user's online status from Redis
      const onlineUsers = await this.getOnlineFriends(userId);

      socket.emit('init', {
        unreadCount,
        onlineUsers,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Failed to send initial data:', error);
    }
  }

  private registerEventHandlers(socket: Socket, userId: string) {
    // Mark notification as read
    socket.on('notification:read', async (notificationId: string) => {
      try {
        await this.notificationService.markAsRead(notificationId, userId);
        socket.emit('notification:read:success', { notificationId });
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark notification as read' });
      }
    });

    // Mark all notifications as read
    socket.on('notifications:read:all', async () => {
      try {
        await this.notificationService.markAllAsRead(userId);
        socket.emit('notifications:read:all:success');
      } catch (error) {
        socket.emit('error', { message: 'Failed to mark all notifications as read' });
      }
    });

    // Typing indicator
    socket.on('typing:start', (data: { to: string }) => {
      socket.to(`user:${data.to}`).emit('typing:start', { from: userId });
    });

    socket.on('typing:stop', (data: { to: string }) => {
      socket.to(`user:${data.to}`).emit('typing:stop', { from: userId });
    });

    // Send message
    socket.on('message:send', async (data: { to: string; content: string }) => {
      try {
        // Save message to database
        // Emit to recipient
        socket.to(`user:${data.to}`).emit('message:received', {
          from: userId,
          content: data.content,
          timestamp: new Date()
        });

        // Send notification if recipient is offline
        const isOnline = await this.redisService.get(`user:online:${data.to}`);
        if (!isOnline) {
          await this.notificationService.createNotification(
            data.to,
            'message',
            'New Message',
            `You have a new message from ${socket.data.user.firstName}`,
            { from: userId }
          );
        }
      } catch (error) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Join challenge room
    socket.on('challenge:join', (challengeId: string) => {
      socket.join(`challenge:${challengeId}`);
    });

    // Leave challenge room
    socket.on('challenge:leave', (challengeId: string) => {
      socket.leave(`challenge:${challengeId}`);
    });

    // Challenge progress update
    socket.on('challenge:progress', (data: { challengeId: string; progress: number }) => {
      socket.to(`challenge:${data.challengeId}`).emit('challenge:progress:update', {
        userId,
        progress: data.progress,
        timestamp: new Date()
      });
    });

    // Budget alert acknowledgement
    socket.on('budget:alert:ack', async (budgetId: string) => {
      // Update budget alert status
      socket.emit('budget:alert:ack:success', { budgetId });
    });

    // Investment price update subscription
    socket.on('investment:subscribe', (investmentId: string) => {
      socket.join(`investment:${investmentId}`);
    });

    socket.on('investment:unsubscribe', (investmentId: string) => {
      socket.leave(`investment:${investmentId}`);
    });

    // Ping/Pong for connection health
    socket.on('ping', (cb) => {
      if (typeof cb === 'function') {
        cb();
      }
    });

    // User status update
    socket.on('user:status', async (status: 'online' | 'away' | 'busy') => {
      await this.redisService.set(`user:status:${userId}`, status, 300);
      this.io.emit('user:status:changed', { userId, status });
    });
  }

  private async handleDisconnect(socket: Socket, userId: string) {
    console.log(`🔌 User ${userId} disconnected`);

    // Remove socket from tracking
    const userSockets = this.userSockets.get(userId);
    if (userSockets) {
      userSockets.delete(socket.id);
      
      // If no more sockets, user is offline
      if (userSockets.size === 0) {
        this.userSockets.delete(userId);
        await this.redisService.del(`user:online:${userId}`);
        await this.redisService.del(`user:status:${userId}`);
        
        // Notify friends
        this.io.emit('user:offline', { userId });
      }
    }
  }

  private async getOnlineFriends(userId: string): Promise<string[]> {
    // In production, get user's friends from database
    // For now, return empty array
    return [];
  }

  // Broadcast to all users
  public broadcast(event: string, data: any) {
    this.io.emit(event, data);
  }

  // Send to specific user
  public sendToUser(userId: string, event: string, data: any) {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Send to challenge room
  public sendToChallenge(challengeId: string, event: string, data: any) {
    this.io.to(`challenge:${challengeId}`).emit(event, data);
  }

  // Send to investment room
  public sendToInvestment(investmentId: string, event: string, data: any) {
    this.io.to(`investment:${investmentId}`).emit(event, data);
  }

  // Get online users count
  public async getOnlineUsersCount(): Promise<number> {
    return this.userSockets.size;
  }

  // Check if user is online
  public async isUserOnline(userId: string): Promise<boolean> {
    return this.userSockets.has(userId);
  }
}
