import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'The Base API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    data: { version: '2.0.0' }
  });
});

app.listen(port, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 The Base API - Kenyan Personal Finance Platform    ║
║                                                          ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║   📡 Server: http://localhost:${port}                      ║
║   ⚕️  Health: http://localhost:${port}/health               ║
║   🧪 Test:   http://localhost:${port}/api/test             ║
║                                                          ║
║   🌍 Environment: ${process.env.NODE_ENV?.padEnd(12) || 'development'.padEnd(12)}         ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});
