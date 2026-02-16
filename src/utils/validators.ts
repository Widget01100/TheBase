import { z } from 'zod';

export const phoneSchema = z.string().regex(/^(254|0)?[17]\d{8}$/, {
  message: 'Please enter a valid Kenyan phone number',
});

export const emailSchema = z.string().email({ message: 'Please enter a valid email address' });

export const amountSchema = z.number().positive({ message: 'Amount must be positive' });

export const mpesaCodeSchema = z.string().regex(/^[A-Z0-9]{10,12}$/, {
  message: 'Please enter a valid M-Pesa transaction code',
});

export const passwordSchema = z
  .string()
  .min(8, { message: 'Password must be at least 8 characters' })
  .regex(/[A-Z]/, { message: 'Password must contain at least one uppercase letter' })
  .regex(/[a-z]/, { message: 'Password must contain at least one lowercase letter' })
  .regex(/[0-9]/, { message: 'Password must contain at least one number' });

export const validatePhoneNumber = (phone: string): boolean => {
  return phoneSchema.safeParse(phone).success;
};

export const validateEmail = (email: string): boolean => {
  return emailSchema.safeParse(email).success;
};

export const validateMpesaCode = (code: string): boolean => {
  return mpesaCodeSchema.safeParse(code).success;
};

export const validateAmount = (amount: number): boolean => {
  return amountSchema.safeParse(amount).success;
};

export const calculateRiskLevel = (
  age: number,
  income: number,
  savings: number,
  goals: string[]
): 'low' | 'medium' | 'high' => {
  let score = 0;
  
  if (age < 30) score += 3;
  else if (age < 50) score += 2;
  else score += 1;
  
  if (income > 100000) score += 2;
  else if (income > 50000) score += 1;
  
  if (savings > 500000) score += 2;
  else if (savings > 100000) score += 1;
  
  if (goals.includes('retirement')) score += 1;
  if (goals.includes('education')) score += 1;
  
  if (score >= 7) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
};
