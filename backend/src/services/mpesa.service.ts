import axios from 'axios';
import crypto from 'crypto';
import { RedisService } from './redis.service';
import { NotificationService } from './notification.service';
import { AppError } from '@/middleware/errorHandler';
import { Transaction } from '@/models/Transaction.model';
import { User } from '@/models/User.model';

export class MpesaService {
  private static instance: MpesaService;
  private redisService: RedisService;
  private notificationService: NotificationService;
  private baseURL: string;
  private consumerKey: string;
  private consumerSecret: string;
  private passkey: string;
  private shortCode: string;
  private environment: string;

  private constructor() {
    this.redisService = RedisService.getInstance();
    this.notificationService = NotificationService.getInstance();
    
    this.environment = process.env.MPESA_ENVIRONMENT || 'sandbox';
    this.baseURL = this.environment === 'production'
      ? 'https://api.safaricom.co.ke'
      : 'https://sandbox.safaricom.co.ke';
    
    this.consumerKey = process.env.MPESA_CONSUMER_KEY!;
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
    this.passkey = process.env.MPESA_PASSKEY!;
    this.shortCode = process.env.MPESA_SHORTCODE!;
  }

  public static getInstance(): MpesaService {
    if (!MpesaService.instance) {
      MpesaService.instance = new MpesaService();
    }
    return MpesaService.instance;
  }

  // Get OAuth Token
  private async getAccessToken(): Promise<string> {
    const cacheKey = 'mpesa:access_token';
    let token = await this.redisService.get(cacheKey);

    if (!token) {
      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      try {
        const response = await axios.get(
          `${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`,
          {
            headers: {
              Authorization: `Basic ${auth}`
            }
          }
        );

        token = response.data.access_token;
        const expiresIn = response.data.expires_in || 3599;
        
        // Store token in Redis (expires in 1 hour)
        await this.redisService.set(cacheKey, token, expiresIn - 60);
      } catch (error) {
        console.error('Failed to get M-Pesa access token:', error);
        throw new AppError('Failed to initialize M-Pesa service', 500);
      }
    }

    return token;
  }

  // Generate password for STK Push
  private generatePassword(timestamp: string): string {
    const data = this.shortCode + this.passkey + timestamp;
    return Buffer.from(data).toString('base64');
  }

  // Generate timestamp in required format
  private getTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  // Format phone number to international format
  private formatPhoneNumber(phoneNumber: string): string {
    // Remove any non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, '');
    
    // Convert to international format
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7')) {
      cleaned = '254' + cleaned;
    } else if (cleaned.startsWith('2547')) {
      // Already in correct format
    } else {
      throw new AppError('Invalid phone number format', 400);
    }
    
    return cleaned;
  }

  // STK Push (Lipa Na M-PESA Online)
  public async stkPush(
    phoneNumber: string,
    amount: number,
    accountReference: string,
    transactionDesc: string,
    userId?: string,
    goalId?: string,
    investmentId?: string
  ): Promise<any> {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(timestamp);
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const payload = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: this.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: process.env.MPESA_CALLBACK_URL,
      AccountReference: accountReference.substring(0, 12),
      TransactionDesc: transactionDesc.substring(0, 13)
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Store transaction details in Redis for callback processing
      if (response.data.ResponseCode === '0') {
        const checkoutRequestId = response.data.CheckoutRequestID;
        
        await this.redisService.set(
          `mpesa:stk:${checkoutRequestId}`,
          JSON.stringify({
            userId,
            amount,
            phoneNumber: formattedPhone,
            accountReference,
            transactionDesc,
            goalId,
            investmentId,
            timestamp: new Date().toISOString()
          }),
          300 // 5 minutes
        );
      }

      return response.data;
    } catch (error) {
      console.error('STK Push failed:', error);
      throw new AppError('Failed to initiate M-PESA payment', 500);
    }
  }

  // Query STK Push status
  public async queryStatus(checkoutRequestId: string): Promise<any> {
    const token = await this.getAccessToken();
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(timestamp);

    const payload = {
      BusinessShortCode: this.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Status query failed:', error);
      throw new AppError('Failed to query transaction status', 500);
    }
  }

  // Process STK Push Callback
  public async processCallback(callbackData: any): Promise<void> {
    const { Body } = callbackData;
    
    if (!Body || !Body.stkCallback) {
      throw new AppError('Invalid callback data', 400);
    }

    const { CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;

    // Retrieve stored transaction data
    const storedData = await this.redisService.get(`mpesa:stk:${CheckoutRequestID}`);
    
    if (!storedData) {
      console.error('No stored data found for CheckoutRequestID:', CheckoutRequestID);
      return;
    }

    const transactionData = JSON.parse(storedData);

    if (ResultCode === 0) {
      // Successful transaction
      const metadata = CallbackMetadata.Item.reduce((acc: any, item: any) => {
        acc[item.Name] = item.Value;
        return acc;
      }, {});

      // Create transaction record
      const transaction = await Transaction.create({
        userId: transactionData.userId,
        amount: transactionData.amount,
        type: 'expense',
        category: 'savings',
        description: transactionData.transactionDesc || 'M-PESA Transaction',
        date: new Date(),
        mpesaCode: metadata.MpesaReceiptNumber,
        mpesaData: {
          transactionId: CheckoutRequestID,
          transactionDate: new Date(),
          amount: transactionData.amount,
          phoneNumber: transactionData.phoneNumber,
          receiptNumber: metadata.MpesaReceiptNumber,
          commandId: 'CustomerPayBillOnline',
          rawMessage: JSON.stringify(callbackData)
        },
        status: 'completed',
        paymentMethod: 'mpesa',
        goalId: transactionData.goalId,
        investmentId: transactionData.investmentId
      });

      // Update goal if linked
      if (transactionData.goalId) {
        const Goal = require('@/models/Goal.model').Goal;
        await Goal.findByIdAndUpdate(transactionData.goalId, {
          $inc: { currentAmount: transactionData.amount },
          $push: {
            contributions: {
              amount: transactionData.amount,
              date: new Date(),
              transactionId: transaction._id,
              type: 'auto'
            }
          }
        });
      }

      // Update investment if linked
      if (transactionData.investmentId) {
        const Investment = require('@/models/Investment.model').Investment;
        await Investment.findByIdAndUpdate(transactionData.investmentId, {
          $inc: { amount: transactionData.amount }
        });
      }

      // Send success notification
      if (transactionData.userId) {
        await this.notificationService.createNotification(
          transactionData.userId,
          'transaction_alert',
          '✅ M-PESA Transaction Successful',
          `Payment of KES ${transactionData.amount.toLocaleString()} completed successfully. Receipt: ${metadata.MpesaReceiptNumber}`,
          { transactionId: transaction._id, receiptNumber: metadata.MpesaReceiptNumber },
          'low'
        );
      }
    } else {
      // Failed transaction
      console.error('STK Push failed:', ResultDesc);

      // Send failure notification
      if (transactionData.userId) {
        await this.notificationService.createNotification(
          transactionData.userId,
          'transaction_alert',
          '❌ M-PESA Transaction Failed',
          `Payment of KES ${transactionData.amount.toLocaleString()} failed. Reason: ${ResultDesc}`,
          { checkoutRequestId: CheckoutRequestID },
          'high'
        );
      }
    }

    // Clean up Redis
    await this.redisService.del(`mpesa:stk:${CheckoutRequestID}`);
  }

  // B2C Payment (Send money to customer)
  public async b2c(
    phoneNumber: string,
    amount: number,
    commandId: 'SalaryPayment' | 'BusinessPayment' | 'PromotionPayment',
    remarks: string,
    occasion?: string
  ): Promise<any> {
    const token = await this.getAccessToken();
    const formattedPhone = this.formatPhoneNumber(phoneNumber);

    const payload = {
      InitiatorName: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: commandId,
      Amount: Math.round(amount),
      PartyA: this.shortCode,
      PartyB: formattedPhone,
      Remarks: remarks,
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      ResultURL: process.env.MPESA_RESULT_URL,
      Occasion: occasion || remarks
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/b2c/v1/paymentrequest`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('B2C payment failed:', error);
      throw new AppError('Failed to process B2C payment', 500);
    }
  }

  // C2B Register URL (Register confirmation and validation URLs)
  public async registerC2BUrls(): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      ShortCode: this.shortCode,
      ResponseType: 'Completed',
      ConfirmationURL: process.env.MPESA_CONFIRMATION_URL,
      ValidationURL: process.env.MPESA_VALIDATION_URL
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/c2b/v1/registerurl`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('C2B URL registration failed:', error);
      throw new AppError('Failed to register C2B URLs', 500);
    }
  }

  // Transaction Status Query
  public async transactionStatus(
    transactionId: string,
    partyA: string,
    identifierType: '1' | '2' | '4' = '4' // 1: MSISDN, 2: Till Number, 4: Shortcode
  ): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      Initiator: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'TransactionStatusQuery',
      TransactionID: transactionId,
      PartyA: partyA,
      IdentifierType: identifierType,
      ResultURL: process.env.MPESA_RESULT_URL,
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      Remarks: 'Transaction status query',
      Occasion: 'Status check'
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/transactionstatus/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Transaction status query failed:', error);
      throw new AppError('Failed to query transaction status', 500);
    }
  }

  // Account Balance Query
  public async accountBalance(): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      Initiator: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'AccountBalance',
      PartyA: this.shortCode,
      IdentifierType: '4',
      Remarks: 'Balance enquiry',
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      ResultURL: process.env.MPESA_RESULT_URL
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/accountbalance/v1/query`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Account balance query failed:', error);
      throw new AppError('Failed to query account balance', 500);
    }
  }

  // Reversal
  public async reversal(
    transactionId: string,
    amount: number,
    receiverParty: string,
    receiverIdType: '1' | '2' | '4' = '4',
    remarks: string
  ): Promise<any> {
    const token = await this.getAccessToken();

    const payload = {
      Initiator: process.env.MPESA_INITIATOR_NAME,
      SecurityCredential: process.env.MPESA_SECURITY_CREDENTIAL,
      CommandID: 'TransactionReversal',
      TransactionID: transactionId,
      Amount: Math.round(amount),
      ReceiverParty: receiverParty,
      RecieverIdentifierType: receiverIdType,
      ResultURL: process.env.MPESA_RESULT_URL,
      QueueTimeOutURL: process.env.MPESA_TIMEOUT_URL,
      Remarks: remarks,
      Occasion: 'Reversal'
    };

    try {
      const response = await axios.post(
        `${this.baseURL}/mpesa/reversal/v1/request`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error) {
      console.error('Reversal failed:', error);
      throw new AppError('Failed to process reversal', 500);
    }
  }

  // Parse M-PESA SMS
  public parseSMS(smsText: string): any {
    const patterns = {
      received: /([A-Z0-9]+) Confirmed\. you have received Ksh([\d,]+\.?\d*) from (.+?) (\d+) on (\d+\/\d+\/\d+) at (.+?) New M-PESA balance is Ksh([\d,]+\.?\d*)/,
      sent: /([A-Z0-9]+) Confirmed\. Ksh([\d,]+\.?\d*) sent to (.+?) (\d+) on (\d+\/\d+\/\d+) at (.+?) New M-PESA balance is Ksh([\d,]+\.?\d*)/,
      paid: /([A-Z0-9]+) Confirmed\. You have paid Ksh([\d,]+\.?\d*) to (.+?) for account (.+?) on (\d+\/\d+\/\d+) at (.+?) New M-PESA balance is Ksh([\d,]+\.?\d*)/,
      withdrawn: /([A-Z0-9]+) Confirmed\. You have withdrawn Ksh([\d,]+\.?\d*) from your (.+?) account\. New M-PESA balance is Ksh([\d,]+\.?\d*)/,
      deposited: /([A-Z0-9]+) Confirmed\. You have deposited Ksh([\d,]+\.?\d*) to your (.+?) account\. New M-PESA balance is Ksh([\d,]+\.?\d*)/
    };

    for (const [type, pattern] of Object.entries(patterns)) {
      const match = smsText.match(pattern);
      if (match) {
        return {
          type,
          transactionId: match[1],
          amount: parseFloat(match[2].replace(/,/g, '')),
          ...match.slice(3)
        };
      }
    }

    return null;
  }

  // Auto-sync M-PESA transactions from SMS
  public async syncFromSMS(userId: string, smsText: string): Promise<any> {
    const parsed = this.parseSMS(smsText);
    
    if (!parsed) {
      throw new AppError('Could not parse M-PESA SMS', 400);
    }

    // Check if transaction already exists
    const existing = await Transaction.findOne({ mpesaCode: parsed.transactionId });
    if (existing) {
      return { message: 'Transaction already synced', transaction: existing };
    }

    // Create transaction
    const transaction = await Transaction.create({
      userId,
      amount: parsed.amount,
      type: ['received', 'deposited'].includes(parsed.type) ? 'income' : 'expense',
      category: 'mpesa',
      description: `M-PESA ${parsed.type}`,
      date: new Date(),
      mpesaCode: parsed.transactionId,
      mpesaData: {
        transactionId: parsed.transactionId,
        amount: parsed.amount,
        rawMessage: smsText
      },
      status: 'completed',
      paymentMethod: 'mpesa'
    });

    // Check for round-up savings
    const user = await User.findById(userId);
    if (user?.preferences.mpesaIntegration.roundUpEnabled && parsed.type === 'sent') {
      const roundUpAmount = Math.ceil(parsed.amount / user.preferences.mpesaIntegration.roundUpToNearest) * 
        user.preferences.mpesaIntegration.roundUpToNearest - parsed.amount;
      
      if (roundUpAmount > 0) {
        // Create round-up savings transaction
        await Transaction.create({
          userId,
          amount: roundUpAmount,
          type: 'saving',
          category: 'savings',
          description: 'M-PESA Round-up savings',
          date: new Date(),
          status: 'completed',
          paymentMethod: 'mpesa'
        });
      }
    }

    return { transaction };
  }
}
