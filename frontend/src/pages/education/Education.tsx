import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  GraduationCap,
  Award,
  Star,
  Trophy,
  Medal,
  Crown,
  Sparkles,
  Zap,
  Brain,
  Lightbulb,
  Target,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  CreditCard,
  Smartphone,
  Home,
  Car,
  ShoppingBag,
  Coffee,
  Film,
  Heart,
  Users,
  MessageCircle,
  Globe,
  Book,
  Video,
  FileText,
  Mic,
  Headphones,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Download,
  Share2,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  HelpCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Settings,
  User,
  LogOut,
  Sun,
  Moon,
  Globe2,
  Flag,
  Map,
  Compass,
  Navigation,
  Mountain,
  TreePine,
  Flower2,
  Leaf,
  Sprout,
  Seed,
  TreeDeciduous,
  Shield,
  Flame
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import { VictoryPie, VictoryLine, VictoryChart, VictoryTheme } from 'victory';

// Kenyan financial education categories
const categories = [
  { id: 'basics', name: 'Money Basics', icon: Wallet, color: 'from-blue-600 to-blue-400', lessons: 8 },
  { id: 'saving', name: 'Saving Strategies', icon: PiggyBank, color: 'from-green-600 to-green-400', lessons: 12 },
  { id: 'investing', name: 'Investing 101', icon: TrendingUp, color: 'from-purple-600 to-purple-400', lessons: 15 },
  { id: 'debt', name: 'Debt Management', icon: CreditCard, color: 'from-red-600 to-red-400', lessons: 6 },
  { id: 'budgeting', name: 'Budgeting', icon: Wallet, color: 'from-yellow-600 to-yellow-400', lessons: 10 },
  { id: 'retirement', name: 'Retirement Planning', icon: Target, color: 'from-pink-600 to-pink-400', lessons: 8 },
  { id: 'taxes', name: 'Taxes (PAYE)', icon: FileText, color: 'from-indigo-600 to-indigo-400', lessons: 5 },
  { id: 'insurance', name: 'Insurance', icon: Shield, color: 'from-orange-600 to-orange-400', lessons: 7 },
];

// Kenyan financial proverbs and wisdom
const proverbs = [
  {
    swahili: 'Pesa ni mizizi, usiipoteze bure.',
    english: 'Money is roots, don\'t waste it foolishly.',
    meaning: 'Money should be nurtured like a plant - it can grow if well taken care of.',
    author: 'Kenyan Proverb',
  },
  {
    swahili: 'Akili nyingi huleta pesa nyingi.',
    english: 'Much wisdom brings much money.',
    meaning: 'Financial education leads to wealth.',
    author: 'Swahili Wisdom',
  },
  {
    swahili: 'Usinyanyue mkono ushike wembe.',
    english: 'Don\'t stretch your hand beyond where you can reach.',
    meaning: 'Live within your means - don\'t spend beyond your budget.',
    author: 'Kenyan Proverb',
  },
  {
    swahili: 'Haraka haraka haina baraka.',
    english: 'Hurry hurry has no blessings.',
    meaning: 'Quick money schemes rarely lead to lasting wealth.',
    author: 'Swahili Proverb',
  },
  {
    swahili: 'Mwenye pupa hana mwisho.',
    english: 'A greedy person has no end.',
    meaning: 'Greed in investments can lead to losses.',
    author: 'Swahili Proverb',
  },
];

// Financial terms glossary (Kenyan context)
const glossary = [
  { term: 'M-PESA', definition: 'Mobile money service by Safaricom - Kenya\'s most popular payment method.' },
  { term: 'Fuliza', definition: 'Safaricom\'s overdraft facility on M-PESA - use wisely, interest is 1% per day.' },
  { term: 'Sacco', definition: 'Savings and Credit Cooperative Organization - members save and borrow together.' },
  { term: 'MMF', definition: 'Money Market Fund - low-risk investment in government securities and bank deposits.' },
  { term: 'PAYE', definition: 'Pay As You Earn - income tax deducted from salaries in Kenya.' },
  { term: 'KRA PIN', definition: 'Kenya Revenue Authority Personal Identification Number - required for tax purposes.' },
  { term: 'NHIF', definition: 'National Hospital Insurance Fund - mandatory health insurance contribution.' },
  { term: 'NSSF', definition: 'National Social Security Fund - pension scheme for Kenyan workers.' },
  { term: 'Hustler Fund', definition: 'Government loan product for small businesses and individuals.' },
  { term: 'Chama', definition: 'Informal investment group where members pool money (like merry-go-round).' },
];

// Video lessons
const videoLessons = [
  {
    id: 1,
    title: 'Understanding M-PESA and Fuliza',
    duration: '8:45',
    level: 'Beginner',
    views: 15234,
    category: 'basics',
    thumbnail: 'mpesa',
    description: 'Learn how to use M-PESA effectively and avoid Fuliza debt traps.',
  },
  {
    id: 2,
    title: 'Sacco vs MMF - Which is Better?',
    duration: '12:30',
    level: 'Intermediate',
    views: 8765,
    category: 'investing',
    thumbnail: 'investment',
    description: 'Deep dive into comparing Sacco dividends and MMF returns.',
  },
  {
    id: 3,
    title: 'Budgeting Like a Pro',
    duration: '15:20',
    level: 'Beginner',
    views: 21098,
    category: 'budgeting',
    thumbnail: 'budget',
    description: 'Create a realistic budget using the 50/30/20 rule.',
  },
  {
    id: 4,
    title: 'Understanding PAYE and Tax Reliefs',
    duration: '20:15',
    level: 'Advanced',
    views: 5432,
    category: 'taxes',
    thumbnail: 'tax',
    description: 'Learn how your salary is taxed and available reliefs.',
  },
  {
    id: 5,
    title: 'Building an Emergency Fund',
    duration: '10:30',
    level: 'Beginner',
    views: 18765,
    category: 'saving',
    thumbnail: 'emergency',
    description: 'Why you need an emergency fund and how to build one.',
  },
  {
    id: 6,
    title: 'NSE Investing for Beginners',
    duration: '25:45',
    level: 'Intermediate',
    views: 6543,
    category: 'investing',
    thumbnail: 'nse',
    description: 'How to buy shares on the Nairobi Securities Exchange.',
  },
];

// Quizzes
const quizzes = [
  {
    id: 1,
    title: 'M-PESA Basics Quiz',
    questions: 10,
    completed: 12543,
    rating: 4.8,
    category: 'basics',
    difficulty: 'Easy',
  },
  {
    id: 2,
    title: 'Investment Knowledge Test',
    questions: 15,
    completed: 8765,
    rating: 4.6,
    category: 'investing',
    difficulty: 'Medium',
  },
  {
    id: 3,
    title: 'Tax Calculator Challenge',
    questions: 8,
    completed: 4321,
    rating: 4.9,
    category: 'taxes',
    difficulty: 'Hard',
  },
];

// Articles
const articles = [
  {
    id: 1,
    title: '10 Common Financial Mistakes Kenyans Make',
    author: 'Malkia AI',
    readTime: 5,
    category: 'basics',
    likes: 2345,
    featured: true,
  },
  {
    id: 2,
    title: 'How to Choose the Best Sacco in Kenya',
    author: 'Financial Expert',
    readTime: 8,
    category: 'investing',
    likes: 1876,
    featured: true,
  },
  {
    id: 3,
    title: 'Fuliza: Friend or Foe?',
    author: 'Malkia AI',
    readTime: 4,
    category: 'debt',
    likes: 3456,
    featured: true,
  },
  {
    id: 4,
    title: 'Understanding Your Payslip',
    author: 'Tax Specialist',
    readTime: 6,
    category: 'taxes',
    likes: 987,
    featured: false,
  },
];

const Education: React.FC = () => {
  const [activeTab, setActiveTab] = useState('learn');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [bookmarked, setBookmarked] = useState<number[]>([]);
  const [showGlossary, setShowGlossary] = useState(false);
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [xp, setXp] = useState(1250);
  const [level, setLevel] = useState(5);
  const [streak, setStreak] = useState(7);
  const [showProverb, setShowProverb] = useState(0);

  // Calculate next level XP
  const nextLevelXp = level * 500;
  const xpProgress = (xp / nextLevelXp) * 100;

  // Rotate proverbs every 10 seconds
  React.useEffect(() => {
    const timer = setInterval(() => {
      setShowProverb((prev) => (prev + 1) % proverbs.length);
    }, 10000);
    return () => clearInterval(timer);
  }, []);

  const toggleBookmark = (id: number) => {
    if (bookmarked.includes(id)) {
      setBookmarked(bookmarked.filter(b => b !== id));
    } else {
      setBookmarked([...bookmarked, id]);
    }
  };

  const completeLesson = (id: number) => {
    if (!completedLessons.includes(id)) {
      setCompletedLessons([...completedLessons, id]);
      setXp(xp + 50);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Gamification */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-3xl"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
        
        <div className="relative p-8 text-white">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center space-x-4">
              <div className="p-4 bg-white/20 rounded-2xl">
                <GraduationCap size={48} />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Financial Education Hub</h1>
                <p className="text-white/80">Learn, earn XP, and become a financial master</p>
              </div>
            </div>

            {/* Gamification Stats */}
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Trophy size={20} className="text-yellow-300" />
                  <span className="text-2xl font-bold">Level {level}</span>
                </div>
                <div className="w-32 h-2 bg-white/20 rounded-full mt-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: `${xpProgress}%` }} />
                </div>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Zap size={20} className="text-yellow-300" />
                  <span className="text-2xl font-bold">{xp}</span>
                </div>
                <p className="text-xs text-white/60">XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center space-x-1">
                  <Flame size={20} className="text-orange-300" />
                  <span className="text-2xl font-bold">{streak}</span>
                </div>
                <p className="text-xs text-white/60">Day Streak</p>
              </div>
            </div>
          </div>

          {/* Daily Proverb */}
          <motion.div
            key={showProverb}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-white/10 rounded-xl"
          >
            <p className="text-lg italic">"{proverbs[showProverb].swahili}"</p>
            <p className="text-sm mt-1">{proverbs[showProverb].english}</p>
            <p className="text-xs mt-2 opacity-60">— {proverbs[showProverb].author}</p>
          </motion.div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {[
          { id: 'learn', label: 'Learn', icon: BookOpen },
          { id: 'videos', label: 'Videos', icon: Video },
          { id: 'quizzes', label: 'Quizzes', icon: Brain },
          { id: 'articles', label: 'Articles', icon: FileText },
          { id: 'glossary', label: 'Glossary', icon: Book },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg text-sm font-medium transition-all',
                activeTab === tab.id
                  ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search lessons, videos, articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800 rounded-lg focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <Button variant="outline" icon={<Filter size={18} />}>
          Filter
        </Button>
        <Button variant="outline" icon={<Bookmark size={18} />}>
          Saved ({bookmarked.length})
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {/* Learning Paths Tab */}
        {activeTab === 'learn' && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {categories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <motion.div
                    key={category.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <Card
                      variant="gradient"
                      className={cn(
                        'p-6 text-white cursor-pointer',
                        `bg-gradient-to-br ${category.color}`
                      )}
                    >
                      <Icon size={32} className="mb-4" />
                      <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                      <p className="text-white/80 text-sm">{category.lessons} lessons</p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Featured Articles */}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
              Featured Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {articles.filter(a => a.featured).map((article, index) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card variant="glass" className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="px-2 py-1 bg-primary-100 text-primary-600 text-xs rounded-full">
                        Featured
                      </span>
                      <button onClick={() => toggleBookmark(article.id)}>
                        {bookmarked.includes(article.id) ? (
                          <BookmarkCheck size={18} className="text-primary-600" />
                        ) : (
                          <Bookmark size={18} className="text-gray-400" />
                        )}
                      </button>
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4">By {article.author}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{article.readTime} min read</span>
                      <span>❤️ {article.likes}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Learning Path Progress */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Your Learning Path
              </h3>
              <div className="space-y-4">
                {[
                  { step: 'Money Basics', progress: 100, completed: true },
                  { step: 'Saving Strategies', progress: 75, completed: false },
                  { step: 'Investing 101', progress: 30, completed: false },
                  { step: 'Debt Management', progress: 0, completed: false },
                ].map((step, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-700 dark:text-gray-300">{step.step}</span>
                      <span className="text-gray-500">{step.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className={cn(
                          'progress-bar-fill',
                          step.completed && 'bg-green-600'
                        )}
                        style={{ width: `${step.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <motion.div
            key="videos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {videoLessons.map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="p-4">
                  <div className="relative aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg mb-3 overflow-hidden group">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Play size={48} className="text-white opacity-50 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {video.duration}
                    </div>
                  </div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                        {video.title}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">{video.description}</p>
                    </div>
                    <button onClick={() => toggleBookmark(video.id)}>
                      {bookmarked.includes(video.id) ? (
                        <BookmarkCheck size={16} className="text-primary-600" />
                      ) : (
                        <Bookmark size={16} className="text-gray-400" />
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                    <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">
                      {video.level}
                    </span>
                    <span>👁️ {video.views.toLocaleString()}</span>
                  </div>

                  {!completedLessons.includes(video.id) && (
                    <Button
                      variant="outline"
                      size="sm"
                      fullWidth
                      className="mt-3"
                      onClick={() => completeLesson(video.id)}
                    >
                      Mark as Watched (+50 XP)
                    </Button>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Quizzes Tab */}
        {activeTab === 'quizzes' && (
          <motion.div
            key="quizzes"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {quizzes.map((quiz, index) => (
              <motion.div
                key={quiz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card variant="glass" className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
                      <Brain className="text-purple-600" size={24} />
                    </div>
                    <span className={cn(
                      'px-2 py-1 text-xs rounded-full',
                      quiz.difficulty === 'Easy' ? 'bg-green-100 text-green-600' :
                      quiz.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    )}>
                      {quiz.difficulty}
                    </span>
                  </div>

                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {quiz.title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                    <span>{quiz.questions} questions</span>
                    <span>⭐ {quiz.rating}</span>
                    <span>{quiz.completed.toLocaleString()} taken</span>
                  </div>

                  <Button variant="primary" fullWidth>
                    Start Quiz
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <motion.div
            key="articles"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {articles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card variant="glass" className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        {article.featured && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded-full">
                            Featured
                          </span>
                        )}
                        <span className="text-xs text-gray-500">{article.readTime} min read</span>
                      </div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">By {article.author}</p>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="flex items-center space-x-1">
                          <ThumbsUp size={14} />
                          <span>{article.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageSquare size={14} />
                          <span>{Math.floor(article.likes / 10)}</span>
                        </span>
                      </div>
                    </div>
                    <button onClick={() => toggleBookmark(article.id)}>
                      {bookmarked.includes(article.id) ? (
                        <BookmarkCheck size={20} className="text-primary-600" />
                      ) : (
                        <Bookmark size={20} className="text-gray-400" />
                      )}
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Glossary Tab */}
        {activeTab === 'glossary' && (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {glossary.map((item, index) => (
              <motion.div
                key={item.term}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  variant="glass" 
                  className="p-6 cursor-pointer hover:shadow-lg transition-all"
                  onClick={() => setSelectedTerm(item.term)}
                >
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg mb-2">
                    {item.term}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.definition}
                  </p>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glossary Term Modal */}
      <AnimatePresence>
        {selectedTerm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedTerm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              {glossary.find(g => g.term === selectedTerm) && (
                <>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {selectedTerm}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    {glossary.find(g => g.term === selectedTerm)?.definition}
                  </p>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      💡 Tip: Understanding this term is key to financial literacy in Kenya.
                    </p>
                  </div>
                  <Button variant="primary" fullWidth className="mt-6" onClick={() => setSelectedTerm(null)}>
                    Got it
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Education;
