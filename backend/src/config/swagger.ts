// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'The Base API',
      version: '2.0.0',
      description: 'Complete Personal Finance Platform API for Kenya',
      contact: {
        name: 'The Base Team',
        email: 'support@thebase.co.ke',
        url: 'https://thebase.co.ke'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3001/api',
        description: 'Development server'
      },
      {
        url: 'https://api.thebase.co.ke/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            email: { type: 'string', example: 'user@example.com' },
            firstName: { type: 'string', example: 'John' },
            lastName: { type: 'string', example: 'Doe' },
            phoneNumber: { type: 'string', example: '254712345678' },
            roles: { type: 'array', items: { type: 'string' } }
          }
        },
        Transaction: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            amount: { type: 'number', example: 5000 },
            type: { type: 'string', enum: ['income', 'expense', 'saving', 'investment'] },
            category: { type: 'string' },
            description: { type: 'string' },
            date: { type: 'string', format: 'date-time' }
          }
        },
        Goal: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            targetAmount: { type: 'number' },
            currentAmount: { type: 'number' },
            deadline: { type: 'string', format: 'date' },
            progress: { type: 'number' }
          }
        },
        Investment: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['mmf', 'sacco', 'stocks'] },
            name: { type: 'string' },
            amount: { type: 'number' },
            returns: { type: 'number' },
            returnsPercentage: { type: 'number' }
          }
        },
        Budget: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            category: { type: 'string' },
            amount: { type: 'number' },
            spent: { type: 'number' },
            period: { type: 'string', enum: ['monthly', 'weekly'] }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string' },
            statusCode: { type: 'number' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ],
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Users', description: 'User management' },
      { name: 'Transactions', description: 'Transaction management' },
      { name: 'Goals', description: 'Savings goals' },
      { name: 'Budgets', description: 'Budget management' },
      { name: 'Investments', description: 'Investment portfolio' },
      { name: 'Challenges', description: 'Gamification challenges' },
      { name: 'M-Pesa', description: 'M-Pesa integration' },
      { name: 'AI Coach', description: 'AI financial coach' },
      { name: 'Reports', description: 'Financial reports' },
      { name: 'Analytics', description: 'Financial analytics' },
      { name: 'Notifications', description: 'Push notifications' },
      { name: 'Admin', description: 'Admin operations' }
    ]
  },
  apis: ['./src/routes/*.ts', './src/models/*.ts']
};

export const swaggerSpec = swaggerJsdoc(options);
