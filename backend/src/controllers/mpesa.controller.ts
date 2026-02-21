import { Request, Response, NextFunction } from 'express';
import { MpesaService } from '@/services/mpesa.service';
import { Transaction } from '@/models/Transaction.model';
import { AppError } from '@/middleware/errorHandler';
import { body } from 'express-validator';

export class MpesaController {
  private mpesaService: MpesaService;

  constructor() {
    this.mpesaService = MpesaService.getInstance();
  }

  // Validation rules
  public static stkPushValidation = [
    body('phoneNumber').matches(/^(254|0)?[17]\d{8}$/),
    body('amount').isNumeric().isFloat({ min: 1 }),
    body('accountReference').notEmpty().isLength({ max: 12 }),
    body('transactionDesc').notEmpty().isLength({ max: 13 }),
    body('goalId').optional().isMongoId(),
    body('investmentId').optional().isMongoId()
  ];

  public static b2cValidation = [
    body('phoneNumber').matches(/^(254|0)?[17]\d{8}$/),
    body('amount').isNumeric().isFloat({ min: 10 }),
    body('commandId').isIn(['SalaryPayment', 'BusinessPayment', 'PromotionPayment']),
    body('remarks').notEmpty().isLength({ max: 100 })
  ];

  public static syncSMSValidation = [
    body('smsText').notEmpty()
  ];

  // STK Push
  public stkPush = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, amount, accountReference, transactionDesc, goalId, investmentId } = req.body;
      const userId = req.user?.id;

      const result = await this.mpesaService.stkPush(
        phoneNumber,
        amount,
        accountReference,
        transactionDesc,
        userId,
        goalId,
        investmentId
      );

      res.json({
        success: true,
        message: 'STK Push initiated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Query STK Push status
  public queryStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { checkoutRequestId } = req.params;

      const result = await this.mpesaService.queryStatus(checkoutRequestId);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // STK Push Callback
  public callback = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.mpesaService.processCallback(req.body);

      // Always respond with success to M-PESA
      res.json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    } catch (error) {
      console.error('Callback processing failed:', error);
      // Still return success to M-PESA
      res.json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });
    }
  };

  // B2C Payment
  public b2c = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { phoneNumber, amount, commandId, remarks, occasion } = req.body;

      const result = await this.mpesaService.b2c(phoneNumber, amount, commandId, remarks, occasion);

      res.json({
        success: true,
        message: 'B2C payment initiated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Register C2B URLs
  public registerUrls = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.mpesaService.registerC2BUrls();

      res.json({
        success: true,
        message: 'C2B URLs registered successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Transaction Status
  public transactionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId, partyA } = req.params;

      const result = await this.mpesaService.transactionStatus(transactionId, partyA);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Account Balance
  public accountBalance = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.mpesaService.accountBalance();

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Reversal
  public reversal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { transactionId, amount, receiverParty, remarks } = req.body;

      const result = await this.mpesaService.reversal(
        transactionId,
        amount,
        receiverParty,
        '4',
        remarks
      );

      res.json({
        success: true,
        message: 'Reversal initiated successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Sync from SMS
  public syncFromSMS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { smsText } = req.body;

      const result = await this.mpesaService.syncFromSMS(userId, smsText);

      res.json({
        success: true,
        message: 'Transaction synced successfully',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  // Get transactions
  public getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { page = 1, limit = 20, startDate, endDate } = req.query;

      const query: any = { userId, paymentMethod: 'mpesa' };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate as string);
        if (endDate) query.date.$lte = new Date(endDate as string);
      }

      const transactions = await Transaction.find(query)
        .sort({ date: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const total = await Transaction.countDocuments(query);

      res.json({
        success: true,
        data: {
          transactions,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total,
            pages: Math.ceil(total / Number(limit))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get transaction by M-PESA code
  public getTransactionByCode = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { code } = req.params;

      const transaction = await Transaction.findOne({ mpesaCode: code });

      if (!transaction) {
        throw new AppError('Transaction not found', 404);
      }

      res.json({
        success: true,
        data: { transaction }
      });
    } catch (error) {
      next(error);
    }
  };

  // Get summary
  public getSummary = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user!.id;
      const { period = 'month' } = req.query;

      let startDate = new Date();
      
      switch (period) {
        case 'week':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
      }

      const transactions = await Transaction.find({
        userId,
        paymentMethod: 'mpesa',
        date: { $gte: startDate }
      });

      const summary = {
        total: transactions.reduce((sum, t) => sum + t.amount, 0),
        count: transactions.length,
        byType: {
          income: transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
          expense: transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0)
        }
      };

      res.json({
        success: true,
        data: summary
      });
    } catch (error) {
      next(error);
    }
  };
}
