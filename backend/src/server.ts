// src/server.ts
import express, { Application } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';

// Load environment variables
dotenv.config();

// Import routes
import routes from './routes';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { SocketEvents } from './events/socket.events';
import { QueueService } from './queues/queue.service';
import { RedisService } from './services/redis.service';
import { EmailService } from './services/email.service';
import { SMSService } from './services/sms.service';

// Initialize express app
const app: Application = express();
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Initialize services
const redisService = RedisService.getInstance();
const emailService = EmailService.getInstance();
const smsService = SMSService.getInstance();
const queueService = QueueService.getInstance();
const socketEvents = new SocketEvents(io);

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ MongoDB connected successfully');

    // Create indexes
    await mongoose.connection.syncIndexes();
    console.log('✅ Database indexes synced');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: process.env.CLIENT_URL?.split(',') || ['http://localhost:5173'],
  credentials: true,
  optionsSuccessStatus: 200
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined'));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    ttl: 24 * 60 * 60 // 1 day
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Rate limiting
app.use('/api', apiLimiter);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'The Base API Documentation'
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    services: {
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      redis: redisService.getClient().status === 'ready' ? 'connected' : 'disconnected'
    },
    version: '2.0.0'
  });
});

// API routes
app.use('/api', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('\n🔄 Received shutdown signal, closing connections...');

  try {
    // Close HTTP server
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
    console.log('✅ HTTP server closed');

    // Close Socket.IO
    await io.close();
    console.log('✅ Socket.IO closed');

    // Close queue connections
    await queueService.closeAll();
    console.log('✅ Queues closed');

    // Close Redis connection
    await redisService.disconnect();
    console.log('✅ Redis disconnected');

    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('✅ MongoDB disconnected');

    console.log('👋 Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Verify email service
    await emailService.verifyConnection();

    // Schedule recurring jobs
    await queueService.scheduleRecurringJobs();
    console.log('✅ Recurring jobs scheduled');

    // Start listening
    const PORT = process.env.PORT || 3001;
    httpServer.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 The Base API - Kenyan Personal Finance Platform    ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   📡 Server: http://localhost:${PORT}                      ║
║   📚 API Docs: http://localhost:${PORT}/api-docs           ║
║   🔌 WebSocket: ws://localhost:${PORT}                     ║
║   ⚕️  Health: http://localhost:${PORT}/health               ║
║                                                          ║
║   🌍 Environment: ${process.env.NODE_ENV?.padEnd(12)}                    ║
║   💾 Database: ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}        ║
║   📦 Redis: ${redisService.getClient().status === 'ready' ? '✅ Connected' : '❌ Disconnected'}           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
      `);
    });

    // Handle shutdown signals
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
    process.on('uncaughtException', (error) => {
      console.error('❌ Uncaught Exception:', error);
      gracefulShutdown();
    });
    process.on('unhandledRejection', (error) => {
      console.error('❌ Unhandled Rejection:', error);
      gracefulShutdown();
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export { io };
