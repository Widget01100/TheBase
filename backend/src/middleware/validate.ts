// src/middleware/validate.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from './errorHandler';

export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const messages = errors.array().map(error => error.msg);
    throw new AppError(messages.join(', '), 400);
  }
  
  next();
};

// File upload validation
export const validateFile = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.file && !req.files) {
    throw new AppError('No file uploaded', 400);
  }

  const file = req.file as Express.Multer.File;
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxSize = 10 * 1024 * 1024; // 10MB

  if (!allowedTypes.includes(file.mimetype)) {
    throw new AppError('Invalid file type. Only JPEG, PNG, and PDF are allowed.', 400);
  }

  if (file.size > maxSize) {
    throw new AppError('File too large. Maximum size is 10MB.', 400);
  }

  next();
};
