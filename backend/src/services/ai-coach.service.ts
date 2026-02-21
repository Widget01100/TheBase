import OpenAI from 'openai';
import { RedisService } from './redis.service';
import { User } from '@/models/User.model';
import { Transaction } from '@/models/Transaction.model';
import { Goal } from '@/models/Goal.model';
import { Budget } from '@/models/Budget.model';
import { Investment } from '@/models/Investment.model';
import { ChatSession, ChatMessage } from '@/models/Chat.model';
import { NotificationService } from './notification.service';
import { AppError } from '@/middleware/errorHandler';
import { Types } from 'mongoose';

export class AICoachService {
  private static instance: AICoachService;
  private openai: OpenAI;
  private redisService: RedisService;
  private notificationService: NotificationService;

  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    this.redisService = RedisService.getInstance();
    this.notificationService = NotificationService.getInstance();
  }

  public static getInstance(): AICoachService {
    if (!AICoachService.instance) {
      AICoachService.instance = new AICoachService();
    }
    return AICoachService.instance;
  }

  // Get user context for AI
  private async getUserContext(userId: string, timeRange: { start: Date; end: Date }) {
    const [transactions, goals, budgets, investments] = await Promise.all([
      Transaction.find({
        userId,
        date: { $gte: timeRange.start, $lte: timeRange.end }
      }).sort({ date: -1 }),
      Goal.find({ userId, status: 'active' }),
      Budget.find({ userId, status: 'active' }),
      Investment.find({ userId, status: 'active' })
    ]);

    // Calculate insights
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const savings = transactions
      .filter(t => t.type === 'saving')
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc: any, t) => {
        acc[t.category] = (acc[t.category] || 0) + Math.abs(t.amount);
        return acc;
      }, {});

    return {
      summary: {
        totalIncome,
        totalExpenses,
        savings,
        netCashflow: totalIncome - totalExpenses,
        savingsRate: totalIncome > 0 ? (savings / totalIncome) * 100 : 0
      },
      spendingByCategory,
      goals: goals.map(g => ({
        name: g.name,
        target: g.targetAmount,
        current: g.currentAmount,
        progress: (g.currentAmount / g.targetAmount) * 100,
        deadline: g.deadline,
        isOnTrack: g.isOnTrack
      })),
      budgets: budgets.map(b => ({
        category: b.category,
        budgeted: b.amount,
        spent: b.spent,
        remaining: b.remaining,
        percentageUsed: b.percentageUsed
      })),
      investments: investments.map(i => ({
        name: i.name,
        type: i.type,
        amount: i.amount,
        returns: i.returns,
        returnsPercentage: i.returnsPercentage,
        risk: i.risk
      })),
      transactionCount: transactions.length,
      topCategories: Object.entries(spendingByCategory)
        .sort(([, a]: any, [, b]: any) => b - a)
        .slice(0, 5)
        .map(([category, amount]) => ({ category, amount }))
    };
  }

  // Generate system prompt for AI
  private getSystemPrompt(userName: string, context: any): string {
    return `You are Malkia, a friendly and knowledgeable AI financial coach for The Base app in Kenya. 
    You're speaking with ${userName}, a user who needs financial advice.

    Key information about ${userName}:
    - Monthly Income: KES ${context.summary.totalIncome.toLocaleString()}
    - Monthly Expenses: KES ${context.summary.totalExpenses.toLocaleString()}
    - Savings: KES ${context.summary.savings.toLocaleString()}
    - Savings Rate: ${context.summary.savingsRate.toFixed(1)}%
    
    Top spending categories:
    ${context.topCategories.map((c: any) => `- ${c.category}: KES ${c.amount.toLocaleString()}`).join('\n')}
    
    Active goals: ${context.goals.length}
    Active budgets: ${context.budgets.length}
    Investments: ${context.investments.length}

    Guidelines:
    1. Be friendly and use Swahili phrases occasionally (like "Habari", "Asante", "Karibu")
    2. Give practical advice relevant to Kenya (M-PESA, Saccos, MMFs, etc.)
    3. Be encouraging and positive
    4. If you detect a problem (overspending, low savings), suggest actionable solutions
    5. Keep responses concise but informative
    6. Ask follow-up questions to engage the user
    7. Reference their specific financial data when relevant
    8. Suggest specific Kenyan financial products when appropriate
    9. Warn about scams and risky investments
    10. Encourage good financial habits

    Remember: You're not just giving advice - you're building a relationship to help them achieve financial freedom.`;
  }

  // Send message to OpenAI
  public async sendMessage(
    userId: string,
    sessionId: string | null,
    message: string,
    context?: any
  ): Promise<any> {
    // Get or create session
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
      if (!session || session.userId.toString() !== userId) {
        throw new AppError('Session not found', 404);
      }
    } else {
      session = await ChatSession.create({ userId });
    }

    // Save user message
    const userMessage = await ChatMessage.create({
      userId,
      sessionId: session._id,
      content: message,
      role: 'user',
      context
    });

    // Update session message count
    session.messageCount += 1;
    await session.save();

    // Check cache for similar conversation
    const cacheKey = `ai:response:${Buffer.from(message).toString('base64')}`;
    let cachedResponse = await this.redisService.get(cacheKey);

    if (!cachedResponse) {
      // Get user context for AI
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userContext = await this.getUserContext(userId, {
        start: thirtyDaysAgo,
        end: now
      });

      const user = await User.findById(userId);
      const systemPrompt = this.getSystemPrompt(user?.firstName || 'User', userContext);

      // Prepare conversation history
      const history = await ChatMessage.find({ sessionId: session._id })
        .sort({ timestamp: -1 })
        .limit(10)
        .lean();

      const messages = [
        { role: 'system', content: systemPrompt },
        ...history.reverse().map((msg: any) => ({
          role: msg.role,
          content: msg.content
        })),
        { role: 'user', content: message }
      ];

      // Call OpenAI
      const completion = await this.openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4',
        messages,
        max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '500'),
        temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
        presence_penalty: 0.6,
        frequency_penalty: 0.3
      });

      const response = completion.choices[0].message.content;
      
      // Cache response
      await this.redisService.set(cacheKey, response, 3600); // Cache for 1 hour

      cachedResponse = response;
    }

    // Save AI response
    const aiMessage = await ChatMessage.create({
      userId,
      sessionId: session._id,
      content: cachedResponse,
      role: 'assistant'
    });

    // Check if we need to generate insights
    await this.checkForInsights(userId, session._id);

    return {
      sessionId: session._id,
      message: aiMessage,
      history: await ChatMessage.find({ sessionId: session._id })
        .sort({ timestamp: -1 })
        .limit(20)
    };
  }

  // Generate financial insights
  public async generateInsights(userId: string): Promise<any> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const context = await this.getUserContext(userId, {
      start: thirtyDaysAgo,
      end: now
    });

    // Generate insights using AI
    const prompt = `Based on this financial data, provide 3-5 key insights and recommendations for the user:
    
    Summary: ${JSON.stringify(context.summary)}
    Spending by category: ${JSON.stringify(context.spendingByCategory)}
    Goals: ${JSON.stringify(context.goals)}
    Budgets: ${JSON.stringify(context.budgets)}
    Investments: ${JSON.stringify(context.investments)}

    For each insight:
    1. Title (short, catchy)
    2. Description (1-2 sentences)
    3. Action (what they can do)
    4. Impact (low/medium/high)
    5. Potential savings (if applicable)

    Format as JSON array.`;

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a financial analyst. Generate insights in JSON format.' },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' }
    });

    const insights = JSON.parse(completion.choices[0].message.content || '[]');

    // Store insights in Redis
    await this.redisService.set(
      `insights:${userId}`,
      JSON.stringify(insights),
      86400 // 24 hours
    );

    return insights;
  }

  // Check for money leaks
  public async detectMoneyLeaks(userId: string): Promise<any[]> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const transactions = await Transaction.find({
      userId,
      type: 'expense',
      date: { $gte: thirtyDaysAgo }
    });

    // Group by category and find patterns
    const byCategory = transactions.reduce((acc: any, t) => {
      const category = t.category;
      if (!acc[category]) {
        acc[category] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      acc[category].total += Math.abs(t.amount);
      acc[category].count += 1;
      acc[category].transactions.push({
        amount: Math.abs(t.amount),
        description: t.description,
        date: t.date
      });
      return acc;
    }, {});

    // Identify potential leaks (high spending categories, frequent small transactions, subscriptions)
    const leaks = [];

    for (const [category, data] of Object.entries(byCategory)) {
      const dataTyped = data as any;
      
      // High spending category
      if (dataTyped.total > 10000) {
        leaks.push({
          type: 'high_spending',
          category,
          amount: dataTyped.total,
          frequency: dataTyped.count,
          suggestion: `You spent KES ${dataTyped.total.toLocaleString()} on ${category}. Consider setting a budget.`,
          potentialSavings: dataTyped.total * 0.2 // Suggest 20% reduction
        });
      }

      // Frequent small transactions
      if (dataTyped.count > 20 && dataTyped.total < 5000) {
        leaks.push({
          type: 'frequent_small',
          category,
          amount: dataTyped.total,
          frequency: dataTyped.count,
          suggestion: `You made ${dataTyped.count} small transactions on ${category}. These add up!`,
          potentialSavings: dataTyped.total * 0.1 // Suggest 10% reduction
        });
      }
    }

    // Detect subscriptions
    const subscriptions = transactions.filter(t => 
      t.description.toLowerCase().includes('subscription') ||
      t.description.toLowerCase().includes('netflix') ||
      t.description.toLowerCase().includes('spotify') ||
      t.description.toLowerCase().includes('dstv') ||
      t.description.toLowerCase().includes('showmax')
    );

    if (subscriptions.length > 0) {
      const totalSubscriptions = subscriptions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
      leaks.push({
        type: 'subscriptions',
        category: 'subscriptions',
        amount: totalSubscriptions,
        count: subscriptions.length,
        suggestion: `You have ${subscriptions.length} subscriptions costing KES ${totalSubscriptions.toLocaleString()}/month. Are you using them all?`,
        potentialSavings: totalSubscriptions * 0.3 // Suggest canceling unused ones
      });
    }

    return leaks;
  }

  // Check for insights periodically
  private async checkForInsights(userId: string, sessionId: Types.ObjectId) {
    const lastCheck = await this.redisService.get(`insights:last:${userId}`);
    
    if (!lastCheck) {
      // Generate insights
      const insights = await this.generateInsights(userId);
      
      // Send insights as messages
      for (const insight of insights) {
        await ChatMessage.create({
          userId,
          sessionId,
          content: `💡 **${insight.title}**\n\n${insight.description}\n\n**Action:** ${insight.action}`,
          role: 'assistant'
        });
      }

      // Check for money leaks
      const leaks = await this.detectMoneyLeaks(userId);
      
      if (leaks.length > 0) {
        const leakMessages = leaks.map((leak, index) => 
          `${index + 1}. **${leak.category}**: ${leak.suggestion} (Potential savings: KES ${leak.potentialSavings.toLocaleString()})`
        ).join('\n\n');

        await ChatMessage.create({
          userId,
          sessionId,
          content: `🔍 **Money Leaks Detected**\n\nI've found some areas where you might be losing money:\n\n${leakMessages}\n\nWould you like me to help you create a plan to address these?`,
          role: 'assistant'
        });

        // Send notifications
        for (const leak of leaks) {
          await this.notificationService.createNotification(
            userId,
            'ai_insight',
            '💰 Money Leak Detected',
            leak.suggestion,
            { leak },
            'medium'
          );
        }
      }

      // Update last check
      await this.redisService.set(`insights:last:${userId}`, Date.now().toString(), 86400);
    }
  }

  // Get chat history
  public async getChatHistory(userId: string, limit: number = 50): Promise<any> {
    return ChatMessage.find({ userId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .populate('sessionId', 'title');
  }

  // Get sessions
  public async getSessions(userId: string): Promise<any> {
    return ChatSession.find({ userId })
      .sort({ startedAt: -1 })
      .select('title startedAt messageCount sentiment feedback');
  }

  // Get session messages
  public async getSessionMessages(sessionId: string, userId: string): Promise<any> {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    return ChatMessage.find({ sessionId })
      .sort({ timestamp: 1 });
  }

  // Delete session
  public async deleteSession(sessionId: string, userId: string): Promise<void> {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    await ChatMessage.deleteMany({ sessionId });
    await session.deleteOne();
  }

  // Add feedback
  public async addFeedback(
    sessionId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      throw new AppError('Session not found', 404);
    }

    session.feedback = { rating, comment, timestamp: new Date() };
    await session.save();
  }

  // Get spending advice
  public async getSpendingAdvice(userId: string): Promise<string> {
    const insights = await this.generateInsights(userId);
    
    const spendingInsights = insights.filter((i: any) => 
      i.type === 'spending' || i.category
    );

    if (spendingInsights.length === 0) {
      return "You're doing great with your spending! Keep up the good work! 🎉";
    }

    const advice = spendingInsights.map((i: any) => 
      `• ${i.title}: ${i.description}`
    ).join('\n');

    return `Here are some personalized spending tips:\n\n${advice}`;
  }

  // Get savings advice
  public async getSavingsAdvice(userId: string): Promise<string> {
    const user = await User.findById(userId);
    const goals = await Goal.find({ userId, status: 'active' });

    if (goals.length === 0) {
      return "You haven't set any savings goals yet. Would you like help creating one?";
    }

    const advice = goals.map(g => {
      const progress = (g.currentAmount / g.targetAmount) * 100;
      const remaining = g.targetAmount - g.currentAmount;
      const monthlyNeeded = g.requiredMonthly;

      return `• **${g.name}**: ${progress.toFixed(1)}% complete. Need KES ${remaining.toLocaleString()} more. Save KES ${monthlyNeeded.toLocaleString()}/month to reach your goal by ${g.deadline.toLocaleDateString()}.`;
    }).join('\n\n');

    return `Here's your savings progress:\n\n${advice}`;
  }

  // Get investment advice
  public async getInvestmentAdvice(userId: string): Promise<string> {
    const investments = await Investment.find({ userId, status: 'active' });

    if (investments.length === 0) {
      return "You don't have any investments yet. Would you like to learn about MMFs or Saccos?";
    }

    const totalValue = investments.reduce((sum, i) => sum + i.totalValue, 0);
    const totalReturns = investments.reduce((sum, i) => sum + i.returns, 0);
    const avgReturn = (totalReturns / totalValue) * 100;

    const advice = investments.map(i => {
      return `• **${i.name}**: KES ${i.amount.toLocaleString()} invested, returns ${i.returnsPercentage.toFixed(1)}%`;
    }).join('\n');

    return `Your investment portfolio is worth KES ${totalValue.toLocaleString()} with average returns of ${avgReturn.toFixed(1)}%.\n\n${advice}`;
  }
}
