import { Investment } from '@/models/Investment.model';
import { Transaction } from '@/models/Transaction.model';
import { User } from '@/models/User.model';
import { NotificationService } from './notification.service';
import { AppError } from '@/middleware/errorHandler';
import axios from 'axios';

export class InvestmentService {
  private static instance: InvestmentService;
  private notificationService: NotificationService;

  private constructor() {
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): InvestmentService {
    if (!InvestmentService.instance) {
      InvestmentService.instance = new InvestmentService();
    }
    return InvestmentService.instance;
  }

  // Create investment
  public async createInvestment(userId: string, investmentData: any): Promise<any> {
    const investment = await Investment.create({
      userId,
      ...investmentData,
      returns: 0,
      returnsPercentage: 0,
      status: 'active'
    });

    // Create initial transaction if amount > 0
    if (investmentData.amount > 0) {
      await Transaction.create({
        userId,
        amount: investmentData.amount,
        type: 'investment',
        category: investmentData.type,
        description: `Initial investment in ${investmentData.name}`,
        date: new Date(),
        investmentId: investment._id,
        status: 'completed',
        paymentMethod: 'bank'
      });
    }

    return investment;
  }

  // Get investments
  public async getInvestments(
    userId: string,
    type?: string,
    status?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query: any = { userId };
    
    if (type) query.type = type;
    if (status) query.status = status;

    const investments = await Investment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Investment.countDocuments(query);

    // Calculate total value for each investment
    for (const inv of investments) {
      inv.totalValue = inv.amount + inv.returns;
      inv.roi = inv.amount > 0 ? (inv.returns / inv.amount) * 100 : 0;
    }

    return {
      investments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  // Get investment by ID
  public async getInvestmentById(investmentId: string, userId: string): Promise<any> {
    const investment = await Investment.findOne({ _id: investmentId, userId })
      .populate('transactions')
      .lean();

    if (!investment) {
      throw new AppError('Investment not found', 404);
    }

    investment.totalValue = investment.amount + investment.returns;
    investment.roi = investment.amount > 0 ? (investment.returns / investment.amount) * 100 : 0;

    // Calculate projections
    investment.projections = await this.calculateProjections(investment);

    return investment;
  }

  // Update investment
  public async updateInvestment(investmentId: string, userId: string, updates: any): Promise<any> {
    const investment = await Investment.findOne({ _id: investmentId, userId });

    if (!investment) {
      throw new AppError('Investment not found', 404);
    }

    Object.assign(investment, updates);
    await investment.save();

    return investment;
  }

  // Delete investment
  public async deleteInvestment(investmentId: string, userId: string): Promise<void> {
    const investment = await Investment.findOne({ _id: investmentId, userId });

    if (!investment) {
      throw new AppError('Investment not found', 404);
    }

    // Liquidate if there's value
    if (investment.amount + investment.returns > 0) {
      await Transaction.create({
        userId,
        amount: investment.amount + investment.returns,
        type: 'income',
        category: 'investment_income',
        description: `Liquidation of ${investment.name}`,
        date: new Date(),
        status: 'completed',
        paymentMethod: 'bank',
        metadata: {
          liquidatedInvestment: investmentId
        }
      });
    }

    await investment.deleteOne();
  }

  // Add transaction
  public async addTransaction(
    investmentId: string,
    userId: string,
    transactionData: any
  ): Promise<any> {
    const investment = await Investment.findOne({ _id: investmentId, userId });

    if (!investment) {
      throw new AppError('Investment not found', 404);
    }

    await investment.addTransaction(
      transactionData.type,
      transactionData.amount,
      transactionData.units,
      transactionData.price,
      transactionData.fees,
      transactionData.notes
    );

    // Create corresponding transaction record
    if (transactionData.type === 'buy' || transactionData.type === 'sell') {
      await Transaction.create({
        userId,
        amount: transactionData.type === 'buy' ? -transactionData.amount : transactionData.amount,
        type: transactionData.type === 'buy' ? 'investment' : 'income',
        category: investment.type,
        description: `${transactionData.type === 'buy' ? 'Bought' : 'Sold'} ${investment.name}`,
        date: new Date(),
        investmentId: investment._id,
        status: 'completed',
        paymentMethod: 'bank',
        metadata: transactionData
      });
    }

    // Send notification for significant changes
    if (Math.abs(transactionData.amount) > 10000) {
      await this.notificationService.createInvestmentUpdate(
        userId,
        investment,
        transactionData.type === 'buy' ? 5 : -5 // Simplified change indicator
      );
    }

    return investment;
  }

  // Calculate projections
  private async calculateProjections(investment: any): Promise<any> {
    const projections = [];
    const currentValue = investment.amount + investment.returns;
    const rate = investment.returnsPercentage / 100;

    for (let year = 1; year <= 10; year++) {
      const projectedValue = currentValue * Math.pow(1 + rate, year);
      const projectedReturns = projectedValue - currentValue;

      projections.push({
        year,
        value: projectedValue,
        returns: projectedReturns,
        returnsPercentage: (projectedReturns / currentValue) * 100
      });
    }

    return projections;
  }

  // Get investment insights
  public async getInvestmentInsights(userId: string): Promise<any> {
    const investments = await Investment.find({ userId, status: 'active' });

    const insights = {
      totalInvestments: investments.length,
      totalValue: 0,
      totalInvested: 0,
      totalReturns: 0,
      averageReturn: 0,
      byType: {} as any,
      byRisk: {} as any,
      performance: [] as any[],
      topPerformers: [] as any[],
      diversification: {} as any,
      recommendations: [] as any[]
    };

    for (const inv of investments) {
      const value = inv.amount + inv.returns;
      
      insights.totalValue += value;
      insights.totalInvested += inv.amount;
      insights.totalReturns += inv.returns;

      // By type
      if (!insights.byType[inv.type]) {
        insights.byType[inv.type] = { count: 0, value: 0, returns: 0 };
      }
      insights.byType[inv.type].count++;
      insights.byType[inv.type].value += value;
      insights.byType[inv.type].returns += inv.returns;

      // By risk
      if (!insights.byRisk[inv.risk]) {
        insights.byRisk[inv.risk] = { count: 0, value: 0 };
      }
      insights.byRisk[inv.risk].count++;
      insights.byRisk[inv.risk].value += value;

      // Performance
      insights.performance.push({
        name: inv.name,
        type: inv.type,
        returns: inv.returnsPercentage,
        value
      });

      // Diversification
      insights.diversification[inv.type] = (insights.diversification[inv.type] || 0) + value;
    }

    // Calculate percentages
    for (const type in insights.diversification) {
      insights.diversification[type] = {
        value: insights.diversification[type],
        percentage: (insights.diversification[type] / insights.totalValue) * 100
      };
    }

    insights.averageReturn = insights.totalInvested > 0
      ? (insights.totalReturns / insights.totalInvested) * 100
      : 0;

    insights.topPerformers = insights.performance
      .sort((a, b) => b.returns - a.returns)
      .slice(0, 3);

    // Generate recommendations
    if (insights.byRisk.high && insights.byRisk.high.value > insights.totalValue * 0.3) {
      insights.recommendations.push({
        type: 'warning',
        message: 'High exposure to high-risk investments. Consider diversifying.',
        action: 'Review risk profile'
      });
    }

    if (!insights.byType.mmf && !insights.byType.sacco) {
      insights.recommendations.push({
        type: 'info',
        message: 'Consider adding low-risk investments like MMFs or Saccos.',
        action: 'Explore options'
      });
    }

    return insights;
  }

  // Get market data
  public async getMarketData(): Promise<any> {
    try {
      // In production, fetch from real APIs
      const mmfRates = Investment.getKenyanMMFProviders();
      const saccoRates = Investment.getKenyanSaccos();
      const nseData = Investment.getNSEStocks();

      return {
        mmf: mmfRates,
        sacco: saccoRates,
        nse: nseData,
        lastUpdated: new Date()
      };
    } catch (error) {
      console.error('Failed to fetch market data:', error);
      throw new AppError('Failed to fetch market data', 500);
    }
  }

  // Calculate compound interest
  public calculateCompoundInterest(
    principal: number,
    rate: number,
    years: number,
    contributions: number = 0,
    contributionFrequency: 'monthly' | 'yearly' = 'monthly'
  ): any {
    const periodsPerYear = contributionFrequency === 'monthly' ? 12 : 1;
    const ratePerPeriod = rate / 100 / periodsPerYear;
    const totalPeriods = years * periodsPerYear;

    let futureValue = principal * Math.pow(1 + ratePerPeriod, totalPeriods);
    let totalContributions = 0;

    if (contributions > 0) {
      const contributionFactor = (Math.pow(1 + ratePerPeriod, totalPeriods) - 1) / ratePerPeriod;
      futureValue += contributions * contributionFactor;
      totalContributions = contributions * totalPeriods;
    }

    const totalReturns = futureValue - principal - totalContributions;

    return {
      principal,
      contributions: totalContributions,
      returns: totalReturns,
      futureValue,
      totalReturnPercentage: (totalReturns / (principal + totalContributions)) * 100
    };
  }

  // Compare investment options
  public compareInvestments(
    options: Array<{
      name: string;
      type: string;
      amount: number;
      rate: number;
      years: number;
      contributions?: number;
    }>
  ): any {
    const comparison = [];

    for (const opt of options) {
      const result = this.calculateCompoundInterest(
        opt.amount,
        opt.rate,
        opt.years,
        opt.contributions || 0
      );

      comparison.push({
        ...opt,
        ...result,
        annualizedReturn: Math.pow(result.futureValue / opt.amount, 1 / opt.years) - 1
      });
    }

    // Find best option
    const best = comparison.reduce((prev, curr) => 
      prev.futureValue > curr.futureValue ? prev : curr
    );

    return {
      options: comparison,
      bestOption: best.name,
      bestValue: best.futureValue,
      summary: `After ${options[0].years} years, ${best.name} would yield the highest returns.`
    };
  }

  // Get dividend schedule
  public async getDividendSchedule(userId: string): Promise<any> {
    const investments = await Investment.find({
      userId,
      status: 'active',
      dividends: { $exists: true, $not: { $size: 0 } }
    });

    const schedule = [];

    for (const inv of investments) {
      for (const div of inv.dividends) {
        if (div.status === 'pending' || div.date > new Date()) {
          schedule.push({
            investmentId: inv._id,
            investmentName: inv.name,
            amount: div.amount,
            date: div.date,
            status: div.status
          });
        }
      }
    }

    return schedule.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  // Get performance chart data
  public async getPerformanceChart(
    userId: string,
    period: '1M' | '3M' | '6M' | '1Y' | 'ALL' = '1Y'
  ): Promise<any> {
    const investments = await Investment.find({ userId, status: 'active' });

    let startDate = new Date();
    switch (period) {
      case '1M':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case '3M':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case '6M':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '1Y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'ALL':
        startDate = new Date(0);
        break;
    }

    // Aggregate performance data
    const chartData: any[] = [];
    const currentDate = new Date(startDate);

    while (currentDate <= new Date()) {
      const totalValue = investments.reduce((sum, inv) => {
        // Find performance entry closest to this date
        const perf = inv.performance
          .filter(p => p.date <= currentDate)
          .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
        
        return sum + (perf?.value || inv.amount + inv.returns);
      }, 0);

      chartData.push({
        date: currentDate.toISOString(),
        value: totalValue
      });

      // Increment by month
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return chartData;
  }

  // Get portfolio allocation
  public async getAllocation(userId: string): Promise<any> {
    const investments = await Investment.find({ userId, status: 'active' });

    const allocation = {
      byType: {} as any,
      byRisk: {} as any,
      byProvider: {} as any,
      total: 0
    };

    for (const inv of investments) {
      const value = inv.amount + inv.returns;
      allocation.total += value;

      if (!allocation.byType[inv.type]) {
        allocation.byType[inv.type] = 0;
      }
      allocation.byType[inv.type] += value;

      if (!allocation.byRisk[inv.risk]) {
        allocation.byRisk[inv.risk] = 0;
      }
      allocation.byRisk[inv.risk] += value;

      if (!allocation.byProvider[inv.provider]) {
        allocation.byProvider[inv.provider] = 0;
      }
      allocation.byProvider[inv.provider] += value;
    }

    // Calculate percentages
    for (const type in allocation.byType) {
      allocation.byType[type] = {
        value: allocation.byType[type],
        percentage: (allocation.byType[type] / allocation.total) * 100
      };
    }

    for (const risk in allocation.byRisk) {
      allocation.byRisk[risk] = {
        value: allocation.byRisk[risk],
        percentage: (allocation.byRisk[risk] / allocation.total) * 100
      };
    }

    return allocation;
  }

  // Rebalance portfolio
  public async rebalancePortfolio(
    userId: string,
    targetAllocation: Record<string, number>
  ): Promise<any> {
    const investments = await Investment.find({ userId, status: 'active' });
    const currentAllocation = await this.getAllocation(userId);

    const recommendations = [];

    for (const [type, target] of Object.entries(targetAllocation)) {
      const current = currentAllocation.byType[type]?.percentage || 0;
      const difference = target - current;
      const adjustment = (difference / 100) * currentAllocation.total;

      if (Math.abs(difference) > 5) {
        recommendations.push({
          type,
          current: current.toFixed(1),
          target: target.toFixed(1),
          difference: difference.toFixed(1),
          adjustment: Math.abs(adjustment),
          action: adjustment > 0 ? 'buy' : 'sell',
          message: adjustment > 0
            ? `Increase ${type} allocation by KES ${adjustment.toLocaleString()}`
            : `Decrease ${type} allocation by KES ${Math.abs(adjustment).toLocaleString()}`
        });
      }
    }

    return recommendations;
  }

  // Get tax implications
  public async getTaxImplications(userId: string, year: number): Promise<any> {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    const transactions = await Transaction.find({
      userId,
      type: 'investment',
      date: { $gte: startDate, $lte: endDate }
    });

    const dividends = await Investment.aggregate([
      { $match: { userId: mongoose.Types.ObjectId(userId) } },
      { $unwind: '$dividends' },
      { $match: { 'dividends.date': { $gte: startDate, $lte: endDate } } },
      { $group: { _id: null, total: { $sum: '$dividends.amount' } } }
    ]);

    const capitalGains = 0; // Calculate based on buy/sell transactions

    return {
      year,
      dividends: dividends[0]?.total || 0,
      capitalGains,
      totalTaxable: (dividends[0]?.total || 0) + capitalGains,
      estimatedTax: ((dividends[0]?.total || 0) + capitalGains) * 0.15 // 15% withholding tax
    };
  }
}
