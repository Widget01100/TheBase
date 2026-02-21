import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Brain,
  Sparkles,
  Zap,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Lightbulb,
  Award,
  Calendar,
  Clock,
  DollarSign,
  Percent,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  CreditCard,
  Smartphone,
  Home,
  Car,
  ShoppingBag,
  Coffee,
  Film,
  BookOpen,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  Copy,
  Share2,
  Download,
  Trash2,
  Edit3,
  MoreVertical,
  ChevronRight,
  ChevronLeft,
  X,
  Menu,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Globe,
  Phone,
  Mail,
  MessageCircle,
  Video,
  Camera,
  Image,
  Paperclip,
  Smile,
  Frown,
  Meh,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Landmark,
  Building,
  Bank,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { VictoryPie, VictoryLine, VictoryChart, VictoryTheme } from 'victory';

// Mock conversation history
const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    content: "Habari Francis! 👋 I'm Malkia, your personal financial strategist. I'm here to help you make smart money decisions. What would you like to chat about today?",
    timestamp: new Date(Date.now() - 3600000),
    suggestions: [
      'How can I save more money?',
      'Analyze my spending',
      'Investment advice',
      'Budget help',
    ],
  },
  {
    id: 2,
    role: 'user',
    content: 'How can I save more money each month?',
    timestamp: new Date(Date.now() - 1800000),
  },
  {
    id: 3,
    role: 'assistant',
    content: "Great question! Based on your recent transactions, I've noticed you spend about KSh 8,500 on eating out and KSh 3,200 on coffee shops. Here are some personalized tips:\n\n" +
      "1️⃣ **The 50/30/20 Rule**: Allocate 50% for needs, 30% for wants, and 20% for savings. Currently, you're saving 15% - we can improve this!\n\n" +
      "2️⃣ **Round-Up Savings**: I see you haven't enabled this yet. Round up your M-PESA transactions to the nearest 100 - you could save an extra KSh 3,500/month!\n\n" +
      "3️⃣ **Subscription Audit**: You have 4 active subscriptions (Netflix, Spotify, DStv, Cloud Storage) totaling KSh 5,200/month. Are you using all of them?\n\n" +
      "Would you like me to help you set up automatic savings or review any specific area? 📊",
    timestamp: new Date(Date.now() - 1200000),
    insights: {
      potentialSavings: 12500,
      topCategory: 'Food & Dining',
      suggestions: 3,
    },
  },
];

// Spending insights data
const spendingData = [
  { category: 'Food & Dining', amount: 24500, percentage: 35, color: '#0ea5e9' },
  { category: 'Transport', amount: 12500, percentage: 18, color: '#10b981' },
  { category: 'Shopping', amount: 9800, percentage: 14, color: '#f59e0b' },
  { category: 'Entertainment', amount: 7200, percentage: 10, color: '#8b5cf6' },
  { category: 'Utilities', amount: 8500, percentage: 12, color: '#ec4899' },
  { category: 'Other', amount: 7500, percentage: 11, color: '#6b7280' },
];

// Financial tips based on Kenyan context
const financialTips = [
  {
    id: 1,
    title: 'M-PESA Round-Up',
    description: 'Round up transactions to save automatically',
    impact: 'high',
    savings: 3500,
    icon: Smartphone,
  },
  {
    id: 2,
    title: 'Sacco Dividends',
    description: 'Compare Sacco dividend rates - some offer up to 12%',
    impact: 'high',
    savings: 15000,
    icon: Landmark,
  },
  {
    id: 3,
    title: 'MMF vs Savings Account',
    description: 'MMFs earn 8-10% vs savings at 2-3%',
    impact: 'medium',
    savings: 8000,
    icon: TrendingUp,
  },
  {
    id: 4,
    title: 'Fuliza Management',
    description: 'Clear Fuliza within 3 days to avoid high fees',
    impact: 'medium',
    savings: 2000,
    icon: AlertCircle,
  },
  {
    id: 5,
    title: 'Budget Categories',
    description: 'Track spending by category to identify leaks',
    impact: 'high',
    savings: 5000,
    icon: PieChart,
  },
  {
    id: 6,
    title: 'Investment Diversification',
    description: 'Spread risk across MMFs, Saccos, and Stocks',
    impact: 'high',
    savings: 25000,
    icon: BarChart3,
  },
];

// Quick questions
const quickQuestions = [
  'How am I doing financially?',
  'Can I afford a new phone?',
  'When can I retire?',
  'How to reduce debt?',
  'Best investment for me?',
  'Analyze my spending',
  'Set savings goal',
  'Emergency fund advice',
];

const AICoach: React.FC = () => {
  const [messages, setMessages] = useState(initialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedTip, setSelectedTip] = useState<number | null>(null);
  const [showInsights, setShowInsights] = useState(true);
  const [voiceMode, setVoiceMode] = useState(false);
  const [mood, setMood] = useState<'happy' | 'neutral' | 'concerned'>('happy');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate typing indicator
  const simulateTyping = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      // Add mock response
      const newMessage = {
        id: messages.length + 1,
        role: 'assistant',
        content: "Based on your spending patterns, I recommend focusing on reducing your dining out expenses. You spent KSh 12,500 on restaurants last month - that's 40% more than the previous month! Would you like me to create a dining budget for you? 🍽️",
        timestamp: new Date(),
        insights: {
          category: 'Food & Dining',
          previousMonth: 8900,
          currentMonth: 12500,
          increase: 40,
        },
      };
      setMessages([...messages, newMessage]);
    }, 2000);
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };
    setMessages([...messages, userMessage]);
    setInputMessage('');

    // Simulate AI response
    simulateTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    if (!isRecording) {
      // Simulate voice recognition
      setTimeout(() => {
        setInputMessage('How can I save for a house deposit?');
        setIsRecording(false);
      }, 3000);
    }
  };

  // Calculate financial health score
  const calculateHealthScore = () => {
    const savingsRate = 15;
    const debtToIncome = 25;
    const emergencyFund = 45;
    const investmentScore = 60;
    return Math.round((savingsRate + (100 - debtToIncome) + emergencyFund + investmentScore) / 4);
  };

  const healthScore = calculateHealthScore();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-[calc(100vh-8rem)] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl flex items-center justify-center">
              <Brain className="text-white" size={24} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Malkia - Your Financial Coach
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              AI-powered insights • Available 24/7 • Speaks English & Swahili
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setVoiceMode(!voiceMode)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              voiceMode 
                ? 'bg-primary-600 text-white' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            )}
          >
            {voiceMode ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Left Sidebar - Insights & Tips */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pr-2">
          {/* Financial Health Score */}
          <Card variant="gradient" className="p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Financial Health</span>
              <Heart className={cn(
                'w-4 h-4',
                healthScore >= 70 ? 'text-green-300' : 
                healthScore >= 50 ? 'text-yellow-300' : 'text-red-300'
              )} />
            </div>
            <div className="text-3xl font-bold mb-2">{healthScore}%</div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              />
            </div>
            <p className="text-xs mt-2 opacity-80">
              {healthScore >= 70 ? 'Doing great! Keep it up!' :
               healthScore >= 50 ? 'On the right track' :
               'Needs attention'}
            </p>
          </Card>

          {/* Spending Insights */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Spending Insights</h3>
              <PieChart size={16} className="text-gray-500" />
            </div>
            <div className="space-y-2">
              {spendingData.slice(0, 4).map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {item.percentage}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium">
              View Detailed Analysis →
            </button>
          </Card>

          {/* Quick Tips */}
          <Card variant="glass" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">Personalized Tips</h3>
              <Lightbulb size={16} className="text-yellow-500" />
            </div>
            <div className="space-y-2">
              {financialTips.slice(0, 3).map((tip) => (
                <motion.button
                  key={tip.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTip(tip.id)}
                  className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded-lg text-left"
                >
                  <div className="flex items-center space-x-2">
                    <tip.icon size={14} className="text-primary-600" />
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {tip.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Save up to {formatCurrency(tip.savings)}/month
                  </p>
                </motion.button>
              ))}
            </div>
          </Card>

          {/* Mood Tracker */}
          <Card variant="glass" className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              How are you feeling?
            </h3>
            <div className="flex space-x-2">
              {[
                { mood: 'happy', icon: Smile, color: 'text-green-500' },
                { mood: 'neutral', icon: Meh, color: 'text-yellow-500' },
                { mood: 'concerned', icon: Frown, color: 'text-red-500' },
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.mood}
                    onClick={() => setMood(m.mood as any)}
                    className={cn(
                      'flex-1 p-2 rounded-lg transition-colors',
                      mood === m.mood
                        ? 'bg-primary-600 text-white'
                        : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <Icon size={20} className="mx-auto" />
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Main Chat Area */}
        <div className="lg:col-span-2 flex flex-col h-full">
          <Card variant="glass" className="flex-1 flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      'flex',
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    )}
                  >
                    <div className={cn(
                      'max-w-[80%] rounded-2xl p-4',
                      message.role === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    )}>
                      {message.role === 'assistant' && (
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
                            <Brain size={14} className="text-white" />
                          </div>
                          <span className="text-xs font-medium opacity-75">Malkia</span>
                        </div>
                      )}
                      
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <ReactMarkdown>
                          {message.content}
                        </ReactMarkdown>
                      </div>

                      {message.insights && (
                        <div className="mt-3 pt-3 border-t border-white/20 dark:border-gray-700">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-1">
                              <TrendingUp size={12} />
                              <span className="text-xs">
                                Potential savings: {formatCurrency(message.insights.potentialSavings)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {message.suggestions && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {message.suggestions.map((suggestion, i) => (
                            <button
                              key={i}
                              onClick={() => setInputMessage(suggestion)}
                              className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-xs transition-colors"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 text-right">
                        <span className="text-xs opacity-50">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-primary-600 rounded-lg flex items-center justify-center">
                          <Brain size={14} className="text-white" />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions */}
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800">
              <div className="flex overflow-x-auto space-x-2 pb-2">
                {quickQuestions.slice(0, 5).map((question, i) => (
                  <button
                    key={i}
                    onClick={() => setInputMessage(question)}
                    className="flex-shrink-0 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-xs whitespace-nowrap transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleRecording}
                  className={cn(
                    'p-3 rounded-lg transition-colors',
                    isRecording 
                      ? 'bg-red-600 text-white animate-pulse' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
                
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isRecording ? "Listening..." : "Ask Malkia anything about your finances..."}
                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl focus:ring-2 focus:ring-primary-500 focus:bg-white dark:focus:bg-gray-700 transition-all"
                    disabled={isRecording}
                  />
                  {isRecording && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex space-x-1">
                        <div className="w-1 h-4 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                        <div className="w-1 h-6 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                        <div className="w-1 h-3 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  className="p-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>

              {/* Voice Mode Indicator */}
              {voiceMode && (
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Voice mode active • Try saying "Malkia, how can I save more?"
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Right Sidebar - Analytics & Recommendations */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto pl-2">
          {/* Monthly Savings Goal */}
          <Card variant="mpesa" className="p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm opacity-90">Monthly Savings Goal</span>
              <Target size={16} className="opacity-90" />
            </div>
            <div className="text-2xl font-bold mb-1">{formatCurrency(25000)}</div>
            <div className="text-xs opacity-80 mb-2">of {formatCurrency(40000)} target</div>
            <div className="w-full bg-white/20 rounded-full h-1.5">
              <div className="bg-white rounded-full h-1.5" style={{ width: '62.5%' }} />
            </div>
          </Card>

          {/* Top Recommendations */}
          <Card variant="glass" className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Top Recommendations
            </h3>
            <div className="space-y-3">
              {[
                { title: 'Reduce Dining Out', impact: 'high', savings: 4500, icon: Coffee },
                { title: 'Enable Round-Up', impact: 'high', savings: 3500, icon: Smartphone },
                { title: 'Cancel Unused Subs', impact: 'medium', savings: 2200, icon: Film },
              ].map((rec, i) => {
                const Icon = rec.icon;
                return (
                  <div key={i} className="flex items-start space-x-2">
                    <div className={cn(
                      'p-1.5 rounded-lg',
                      rec.impact === 'high' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                    )}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {rec.title}
                      </p>
                      <p className="text-xs text-green-600">
                        Save {formatCurrency(rec.savings)}/month
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Upcoming Bills */}
          <Card variant="glass" className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Upcoming Bills
            </h3>
            <div className="space-y-2">
              {[
                { name: 'Rent', amount: 25000, due: '3 days', status: 'upcoming' },
                { name: 'KPLC Bill', amount: 3500, due: 'Today', status: 'urgent' },
                { name: 'Safaricom', amount: 2000, due: '5 days', status: 'upcoming' },
              ].map((bill, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {bill.name}
                    </p>
                    <p className="text-xs text-gray-500">{bill.due}</p>
                  </div>
                  <span className={cn(
                    'text-sm font-medium',
                    bill.status === 'urgent' ? 'text-red-600' : 'text-gray-900 dark:text-white'
                  )}>
                    {formatCurrency(bill.amount)}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Learning Path */}
          <Card variant="glass" className="p-4">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Learning Path
            </h3>
            <div className="space-y-2">
              {[
                { step: 'Budgeting Basics', progress: 100, completed: true },
                { step: 'Investment 101', progress: 60, completed: false },
                { step: 'Retirement Planning', progress: 25, completed: false },
              ].map((lesson, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-700 dark:text-gray-300">{lesson.step}</span>
                    <span className="text-gray-500">{lesson.progress}%</span>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className={cn(
                        'progress-bar-fill',
                        lesson.completed ? 'bg-green-600' : ''
                      )}
                      style={{ width: `${lesson.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-3 text-xs text-primary-600 hover:text-primary-700 font-medium">
              Continue Learning →
            </button>
          </Card>
        </div>
      </div>

      {/* Tip Detail Modal */}
      <AnimatePresence>
        {selectedTip && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTip(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {financialTips.find(t => t.id === selectedTip) && (
                <>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-3 bg-primary-100 dark:bg-primary-900/20 rounded-xl">
                      {(() => {
                        const TipIcon = financialTips.find(t => t.id === selectedTip)!.icon;
                        return <TipIcon size={24} className="text-primary-600" />;
                      })()}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        {financialTips.find(t => t.id === selectedTip)!.title}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {financialTips.find(t => t.id === selectedTip)!.description}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Potential monthly savings: {formatCurrency(financialTips.find(t => t.id === selectedTip)!.savings)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        How to implement:
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex items-start space-x-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5" />
                          <span>Enable automatic savings in your M-PESA settings</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5" />
                          <span>Set a monthly budget for this category</span>
                        </li>
                        <li className="flex items-start space-x-2">
                          <CheckCircle size={16} className="text-green-600 mt-0.5" />
                          <span>Track progress weekly with Malkia</span>
                        </li>
                      </ul>
                    </div>

                    <div className="flex space-x-3 pt-4">
                      <Button variant="primary" fullWidth onClick={() => setSelectedTip(null)}>
                        Start Saving
                      </Button>
                      <Button variant="outline" fullWidth onClick={() => setSelectedTip(null)}>
                        Later
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AICoach;
