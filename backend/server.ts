import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    message: 'The Base Backend is running!',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Test route
app.get('/', (req: Request, res: Response) => {
  res.json({
    name: 'The Base API',
    version: '1.0.0',
    description: 'Kenyan Personal Finance Platform Backend',
    endpoints: {
      health: '/health',
      api: '/api'
    }
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔍 Test the API at http://localhost:${port}/health`);
});
