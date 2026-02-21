// src/pages/calculators/Calculators.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Target,
  Home,
  Car,
  GraduationCap,
  Briefcase,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw,
  Download,
  Share2,
  BookOpen,
  Award,
  Shield,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronLeft,
  Save,
  Copy,
  Printer,
  Mail,
  Phone,
  MessageCircle,
  Users,
  Heart,
  Star,
  Sparkles,
  Zap,
  Flame,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Thermometer,
  Landmark,
  Building,
  Bank,
  Wallet,
  CreditCard,
  Smartphone,
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AnimatedCounter from '@/components/ui/AnimatedCounter';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { cn } from '@/lib/utils';
import {
  LineChart as ReLineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RePieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';

// Calculator types
type CalculatorType = 
  | 'fire' 
  | 'sacco-vs-mmf' 
  | 'education' 
  | 'mortgage' 
  | 'savings' 
  | 'debt' 
  | 'tax' 
  | 'retirement'
  | 'land'
  | 'car';

interface Calculator {
  id: CalculatorType;
  name: string;
  description: string;
  icon: any;
  color: string;
  gradient: string;
  popular: boolean;
}

const calculators: Calculator[] = [
  {
    id: 'fire',
    name: 'FIRE Calculator',
    description: 'Financial Independence, Retire Early - Calculate your FIRE number',
    icon: Target,
    color: 'text-blue-600',
    gradient: 'from-blue-600 to-blue-400',
    popular: true,
  },
  {
    id: 'sacco-vs-mmf',
    name: 'Sacco vs MMF',
    description: 'Compare returns between Saccos and Money Market Funds',
    icon: Landmark,
    color: 'text-purple-600',
    gradient: 'from-purple-600 to-purple-400',
    popular: true,
  },
  {
    id: 'education',
    name: 'Education Fund',
    description: 'Plan for university fees in Kenya (public/private)',
    icon: GraduationCap,
    color: 'text-green-600',
    gradient: 'from-green-600 to-green-400',
    popular: true,
  },
  {
    id: 'mortgage',
    name: 'Mortgage Calculator',
    description: 'Calculate monthly payments for home loans',
    icon: Home,
    color: 'text-red-600',
    gradient: 'from-red-600 to-red-400',
    popular: false,
  },
  {
    id: 'savings',
    name: 'Savings Goal',
    description: 'Plan your savings with monthly contributions',
    icon: PiggyBank,
    color: 'text-yellow-600',
    gradient: 'from-yellow-600 to-yellow-400',
    popular: true,
  },
  {
    id: 'debt',
    name: 'Debt Repayment',
    description: 'Avalanche vs Snowball - Find the fastest way to clear debt',
    icon: TrendingDown,
    color: 'text-orange-600',
    gradient: 'from-orange-600 to-orange-400',
    popular: false,
  },
  {
    id: 'tax',
    name: 'PAYE Calculator',
    description: 'Calculate your monthly tax and net pay',
    icon: Percent,
    color: 'text-indigo-600',
    gradient: 'from-indigo-600 to-indigo-400',
    popular: true,
  },
  {
    id: 'retirement',
    name: 'Retirement Planner',
    description: 'Plan your pension and retirement savings',
    icon: Briefcase,
    color: 'text-pink-600',
    gradient: 'from-pink-600 to-pink-400',
    popular: false,
  },
  {
    id: 'land',
    name: 'Land Purchase',
    description: 'Calculate costs for buying land in Kenya',
    icon: Building,
    color: 'text-emerald-600',
    gradient: 'from-emerald-600 to-emerald-400',
    popular: false,
  },
  {
    id: 'car',
    name: 'Car Loan',
    description: 'Calculate monthly payments for car financing',
    icon: Car,
    color: 'text-cyan-600',
    gradient: 'from-cyan-600 to-cyan-400',
    popular: false,
  },
];

// Kenyan tax brackets (PAYE 2024)
const taxBrackets = [
  { min: 0, max: 24000, rate: 10, name: 'First KSh 24,000' },
  { min: 24001, max: 32333, rate: 25, name: 'Next KSh 8,333' },
  { min: 32334, max: 500000, rate: 30, name: 'Next KSh 467,667' },
  { min: 500001, max: 800000, rate: 32.5, name: 'Next KSh 300,000' },
  { min: 800001, max: Infinity, rate: 35, name: 'Above KSh 800,000' },
];

// Kenyan university fees (approximate per year)
const universityFees = {
  public: 160000,
  private: 400000,
  international: 2000000,
};

const Calculators: React.FC = () => {
  const [selectedCalculator, setSelectedCalculator] = useState<CalculatorType>('fire');
  const [showResults, setShowResults] = useState(false);
  const [savedCalculations, setSavedCalculations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'calculators' | 'saved' | 'compare'>('calculators');
  
  // FIRE Calculator State
  const [fireInputs, setFireInputs] = useState({
    currentAge: 30,
    retirementAge: 50,
    currentSavings: 500000,
    monthlySavings: 20000,
    expectedReturn: 8,
    inflationRate: 5,
    desiredMonthlyIncome: 100000,
    safeWithdrawalRate: 4,
  });

  // Sacco vs MMF State
  const [saccoMMFInputs, setSaccoMMFInputs] = useState({
    initialAmount: 100000,
    monthlyContribution: 5000,
    years: 10,
    saccoRate: 12,
    mmfRate: 8.5,
  });

  // Education Fund State
  const [educationInputs, setEducationInputs] = useState({
    childAge: 5,
    universityAge: 18,
    universityType: 'public' as 'public' | 'private' | 'international',
    course: 'Engineering',
    currentSavings: 100000,
    monthlyContribution: 5000,
    expectedReturn: 8,
  });

  // Calculate FIRE Number
  const calculateFIRE = () => {
    const { 
      currentAge, retirementAge, currentSavings, monthlySavings, 
      expectedReturn, inflationRate, desiredMonthlyIncome, safeWithdrawalRate 
    } = fireInputs;

    const yearsToRetirement = retirementAge - currentAge;
    const realReturn = (1 + expectedReturn / 100) / (1 + inflationRate / 100) - 1;
    
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + realReturn, yearsToRetirement);
    
    // Future value of monthly savings
    const monthlyRate = realReturn / 12;
    const months = yearsToRetirement * 12;
    const futureValueMonthly = monthlySavings * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalAtRetirement = futureValueCurrent + futureValueMonthly;
    
    // FIRE Number (25x annual expenses for 4% rule)
    const annualExpenses = desiredMonthlyIncome * 12;
    const fireNumber = annualExpenses * (100 / safeWithdrawalRate);
    
    const monthlyIncomeAtRetirement = (totalAtRetirement * safeWithdrawalRate / 100) / 12;
    const successRate = (totalAtRetirement / fireNumber) * 100;
    
    return {
      fireNumber,
      totalAtRetirement,
      monthlyIncome: monthlyIncomeAtRetirement,
      yearsToRetirement,
      successRate: Math.min(successRate, 100),
      isOnTrack: totalAtRetirement >= fireNumber,
    };
  };

  // Calculate Sacco vs MMF
  const calculateSaccoMMF = () => {
    const { initialAmount, monthlyContribution, years, saccoRate, mmfRate } = saccoMMFInputs;
    
    // Sacco future value (with dividends)
    const saccoFuture = initialAmount * Math.pow(1 + saccoRate / 100, years) +
      monthlyContribution * 12 * ((Math.pow(1 + saccoRate / 100, years) - 1) / (saccoRate / 100));
    
    // MMF future value (with compound interest)
    const monthlyRate = mmfRate / 100 / 12;
    const months = years * 12;
    const mmfFuture = initialAmount * Math.pow(1 + monthlyRate, months) +
      monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
    
    const difference = saccoFuture - mmfFuture;
    const better = difference > 0 ? 'Sacco' : 'MMF';
    
    return {
      saccoFuture,
      mmfFuture,
      difference: Math.abs(difference),
      better,
      saccoReturns: ((saccoFuture / (initialAmount + monthlyContribution * 12 * years)) - 1) * 100,
      mmfReturns: ((mmfFuture / (initialAmount + monthlyContribution * 12 * years)) - 1) * 100,
    };
  };

  // Calculate Education Fund
  const calculateEducation = () => {
    const { childAge, universityAge, universityType, currentSavings, monthlyContribution, expectedReturn } = educationInputs;
    
    const yearsToUniversity = universityAge - childAge;
    const monthlyRate = expectedReturn / 100 / 12;
    const months = yearsToUniversity * 12;
    
    // Future value of current savings
    const futureValueCurrent = currentSavings * Math.pow(1 + monthlyRate, months);
    
    // Future value of monthly contributions
    const futureValueMonthly = monthlyContribution * 
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
      (1 + monthlyRate);
    
    const totalSaved = futureValueCurrent + futureValueMonthly;
    
    // University costs
    const annualFees = universityFees[universityType];
    const totalUniversityCost = annualFees * 4; // 4 years
    const inflationAdjustedCost = totalUniversityCost * Math.pow(1.05, yearsToUniversity); // 5% inflation
    
    const shortfall = Math.max(0, inflationAdjustedCost - totalSaved);
    const monthlyNeeded = shortfall > 0 ? 
      shortfall / ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) / (1 + monthlyRate) : 0;
    
    return {
      totalNeeded: inflationAdjustedCost,
      totalSaved,
      shortfall,
      monthlyNeeded,
      isOnTrack: totalSaved >= inflationAdjustedCost,
      progress: (totalSaved / inflationAdjustedCost) * 100,
    };
  };

  const fireResults = calculateFIRE();
  const saccoMMFResults = calculateSaccoMMF();
  const educationResults = calculateEducation();

  // Chart data for projections
  const projectionData = Array.from({ length: 11 }, (_, i) => ({
    year: fireInputs.currentAge + i,
    savings: fireInputs.currentSavings * Math.pow(1.08, i) + 
      fireInputs.monthlySavings * 12 * ((Math.pow(1.08, i) - 1) / 0.08),
    target: fireInputs.desiredMonthlyIncome * 12 * 25 * (i / 10),
  }));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
            Financial Calculators
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Plan your financial future with Kenyan-specific calculators
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            icon={<BookOpen size={18} />}
            onClick={() => window.open('/education', '_blank')}
          >
            Learn More
          </Button>
          <Button
            variant="primary"
            icon={<Download size={18} />}
            onClick={() => {
              // Save calculation
              const newCalc = {
                id: Date.now(),
                type: selectedCalculator,
                date: new Date(),
                inputs: selectedCalculator === 'fire' ? fireInputs :
                       selectedCalculator === 'sacco-vs-mmf' ? saccoMMFInputs :
                       educationInputs,
                results: selectedCalculator === 'fire' ? fireResults :
                        selectedCalculator === 'sacco-vs-mmf' ? saccoMMFResults :
                        educationResults,
              };
              setSavedCalculations([...savedCalculations, newCalc]);
            }}
          >
            Save Calculation
          </Button>
        </div>
      </div>

      {/* Calculator Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        <button
          onClick={() => setActiveTab('calculators')}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === 'calculators'
              ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          All Calculators
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === 'saved'
              ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          Saved ({savedCalculations.length})
        </button>
        <button
          onClick={() => setActiveTab('compare')}
          className={cn(
            'flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all',
            activeTab === 'compare'
              ? 'bg-white dark:bg-gray-900 text-primary-600 shadow-lg'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
          )}
        >
          Compare
        </button>
      </div>

      <AnimatePresence mode="wait">
        {/* Calculators Grid */}
        {activeTab === 'calculators' && (
          <motion.div
            key="calculators"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {calculators.map((calc, index) => {
              const Icon = calc.icon;
              return (
                <motion.div
                  key={calc.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedCalculator(calc.id)}
                >
                  <Card
                    variant={selectedCalculator === calc.id ? 'gradient' : 'glass'}
                    className={cn(
                      'p-6 cursor-pointer transition-all',
                      selectedCalculator === calc.id && 'text-white'
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        'p-3 rounded-xl',
                        selectedCalculator === calc.id 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800'
                      )}>
                        <Icon className={selectedCalculator === calc.id ? 'text-white' : calc.color} size={24} />
                      </div>
                      {calc.popular && (
                        <span className={cn(
                          'px-2 py-1 text-xs rounded-full',
                          selectedCalculator === calc.id
                            ? 'bg-white/20 text-white'
                            : 'bg-primary-100 text-primary-600'
                        )}>
                          Popular
                        </span>
                      )}
                    </div>
                    <h3 className={cn(
                      'font-semibold mt-4 mb-1',
                      selectedCalculator === calc.id ? 'text-white' : 'text-gray-900 dark:text-white'
                    )}>
                      {calc.name}
                    </h3>
                    <p className={cn(
                      'text-sm',
                      selectedCalculator === calc.id ? 'text-white/80' : 'text-gray-500'
                    )}>
                      {calc.description}
                    </p>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Saved Calculations */}
        {activeTab === 'saved' && (
          <motion.div
            key="saved"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {savedCalculations.length === 0 ? (
              <Card variant="glass" className="p-12 text-center">
                <Calculator size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No saved calculations yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  Save your calculations to compare them later
                </p>
                <Button variant="primary" onClick={() => setActiveTab('calculators')}>
                  Try a Calculator
                </Button>
              </Card>
            ) : (
              savedCalculations.map((calc) => (
                <Card key={calc.id} variant="glass" className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {calculators.find(c => c.id === calc.type)?.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {calc.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" icon={<Trash2 size={14} />}>
                      Delete
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </motion.div>
        )}

        {/* Compare View */}
        {activeTab === 'compare' && (
          <motion.div
            key="compare"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Compare Investment Options
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Investment 1
                  </label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <option>Sacco (12%)</option>
                    <option>MMF (8.5%)</option>
                    <option>T-Bills (10%)</option>
                    <option>Stocks (15%)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Investment 2
                  </label>
                  <select className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <option>MMF (8.5%)</option>
                    <option>Sacco (12%)</option>
                    <option>T-Bills (10%)</option>
                    <option>Stocks (15%)</option>
                  </select>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Calculator */}
      <AnimatePresence mode="wait">
        {selectedCalculator === 'fire' && (
          <motion.div
            key="fire"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card variant="gradient" className="p-8 text-white">
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Target size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">FIRE Calculator</h2>
                  <p className="text-white/80">
                    Financial Independence, Retire Early - Calculate your path to financial freedom
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Form */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current Age
                    </label>
                    <input
                      type="number"
                      value={fireInputs.currentAge}
                      onChange={(e) => setFireInputs({ ...fireInputs, currentAge: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Desired Retirement Age
                    </label>
                    <input
                      type="number"
                      value={fireInputs.retirementAge}
                      onChange={(e) => setFireInputs({ ...fireInputs, retirementAge: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current Savings (KES)
                    </label>
                    <input
                      type="number"
                      value={fireInputs.currentSavings}
                      onChange={(e) => setFireInputs({ ...fireInputs, currentSavings: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Savings (KES)
                    </label>
                    <input
                      type="number"
                      value={fireInputs.monthlySavings}
                      onChange={(e) => setFireInputs({ ...fireInputs, monthlySavings: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Expected Return (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={fireInputs.expectedReturn}
                      onChange={(e) => setFireInputs({ ...fireInputs, expectedReturn: parseFloat(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Desired Monthly Income (KES)
                    </label>
                    <input
                      type="number"
                      value={fireInputs.desiredMonthlyIncome}
                      onChange={(e) => setFireInputs({ ...fireInputs, desiredMonthlyIncome: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                </div>
              </Card>

              {/* Results */}
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your FIRE Number
                </h3>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-1">You need</p>
                    <p className="text-4xl font-bold text-primary-600">
                      {formatCurrency(fireResults.fireNumber)}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      to retire at age {fireInputs.retirementAge}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Projected Savings</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(fireResults.totalAtRetirement)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Monthly Income</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(fireResults.monthlyIncome)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Success Rate</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {fireResults.successRate.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${fireResults.successRate}%` }}
                      />
                    </div>
                  </div>

                  {fireResults.isOnTrack ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center space-x-3">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        You're on track! You'll reach your FIRE number by age {fireInputs.retirementAge}.
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center space-x-3">
                      <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                      <p className="text-sm text-yellow-700 dark:text-yellow-300">
                        You need to save an additional {formatCurrency(fireResults.fireNumber - fireResults.totalAtRetirement)} 
                        to reach your FIRE number.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Projection Chart */}
            <Card variant="glass" className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Wealth Projection
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projectionData}>
                    <defs>
                      <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="targetGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="year" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      formatter={(value: any) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        borderRadius: '8px',
                        border: 'none',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="savings"
                      stroke="#0ea5e9"
                      fillOpacity={1}
                      fill="url(#savingsGradient)"
                      name="Your Savings"
                    />
                    <Area
                      type="monotone"
                      dataKey="target"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#targetGradient)"
                      name="FIRE Target"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {selectedCalculator === 'sacco-vs-mmf' && (
          <motion.div
            key="sacco-vs-mmf"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card variant="gradient" className="p-8 text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #ec4899)' }}>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <Landmark size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Sacco vs MMF Comparison</h2>
                  <p className="text-white/80">
                    Compare returns between Saccos and Money Market Funds
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Investment Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Initial Amount (KES)
                    </label>
                    <input
                      type="number"
                      value={saccoMMFInputs.initialAmount}
                      onChange={(e) => setSaccoMMFInputs({ ...saccoMMFInputs, initialAmount: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Contribution (KES)
                    </label>
                    <input
                      type="number"
                      value={saccoMMFInputs.monthlyContribution}
                      onChange={(e) => setSaccoMMFInputs({ ...saccoMMFInputs, monthlyContribution: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Investment Period (Years)
                    </label>
                    <input
                      type="number"
                      value={saccoMMFInputs.years}
                      onChange={(e) => setSaccoMMFInputs({ ...saccoMMFInputs, years: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Sacco Dividend Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={saccoMMFInputs.saccoRate}
                      onChange={(e) => setSaccoMMFInputs({ ...saccoMMFInputs, saccoRate: parseFloat(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      MMF Interest Rate (%)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={saccoMMFInputs.mmfRate}
                      onChange={(e) => setSaccoMMFInputs({ ...saccoMMFInputs, mmfRate: parseFloat(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Comparison Results
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                      <Landmark size={24} className="mx-auto text-purple-600 mb-2" />
                      <p className="text-xs text-gray-500">Sacco Future Value</p>
                      <p className="text-xl font-bold text-purple-600">
                        {formatCurrency(saccoMMFResults.saccoFuture)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        +{saccoMMFResults.saccoReturns.toFixed(1)}%
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                      <TrendingUp size={24} className="mx-auto text-blue-600 mb-2" />
                      <p className="text-xs text-gray-500">MMF Future Value</p>
                      <p className="text-xl font-bold text-blue-600">
                        {formatCurrency(saccoMMFResults.mmfFuture)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        +{saccoMMFResults.mmfReturns.toFixed(1)}%
                      </p>
                    </div>
                  </div>

                  <div className={cn(
                    'p-4 rounded-lg',
                    saccoMMFResults.better === 'Sacco' 
                      ? 'bg-purple-50 dark:bg-purple-900/20' 
                      : 'bg-blue-50 dark:bg-blue-900/20'
                  )}>
                    <p className="text-sm text-center font-medium">
                      {saccoMMFResults.better === 'Sacco' ? (
                        <span className="text-purple-700 dark:text-purple-300">
                          🏦 Sacco is better by {formatCurrency(saccoMMFResults.difference)}
                        </span>
                      ) : (
                        <span className="text-blue-700 dark:text-blue-300">
                          📈 MMF is better by {formatCurrency(saccoMMFResults.difference)}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Key Insights</h4>
                    <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Saccos offer loans against your savings</li>
                      <li>• MMFs provide daily liquidity</li>
                      <li>• Consider diversifying between both</li>
                      <li>• Sacco dividends are not guaranteed</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {selectedCalculator === 'education' && (
          <motion.div
            key="education"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card variant="gradient" className="p-8 text-white" style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
              <div className="flex items-center space-x-4">
                <div className="p-4 bg-white/20 rounded-2xl">
                  <GraduationCap size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-2">Education Fund Planner</h2>
                  <p className="text-white/80">
                    Plan for your child's university education in Kenya
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Child's Details
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Child's Current Age
                    </label>
                    <input
                      type="number"
                      value={educationInputs.childAge}
                      onChange={(e) => setEducationInputs({ ...educationInputs, childAge: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      University Type
                    </label>
                    <select
                      value={educationInputs.universityType}
                      onChange={(e) => setEducationInputs({ ...educationInputs, universityType: e.target.value as any })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    >
                      <option value="public">Public University (KSh 160k/year)</option>
                      <option value="private">Private University (KSh 400k/year)</option>
                      <option value="international">International (KSh 2M/year)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Current Savings (KES)
                    </label>
                    <input
                      type="number"
                      value={educationInputs.currentSavings}
                      onChange={(e) => setEducationInputs({ ...educationInputs, currentSavings: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Monthly Contribution (KES)
                    </label>
                    <input
                      type="number"
                      value={educationInputs.monthlyContribution}
                      onChange={(e) => setEducationInputs({ ...educationInputs, monthlyContribution: parseInt(e.target.value) })}
                      className="w-full p-2 border border-gray-200 dark:border-gray-800 rounded-lg"
                    />
                  </div>
                </div>
              </Card>

              <Card variant="glass" className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Education Fund Results
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Total Needed</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(educationResults.totalNeeded)}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
                      <p className="text-xs text-gray-500">Projected Savings</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(educationResults.totalSaved)}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-700 dark:text-blue-300">Progress</span>
                      <span className="text-lg font-bold text-blue-700 dark:text-blue-300">
                        {educationResults.progress.toFixed(1)}%
                      </span>
                    </div>
                    <div className="progress-bar">
                      <div 
                        className="progress-bar-fill"
                        style={{ width: `${educationResults.progress}%` }}
                      />
                    </div>
                  </div>

                  {educationResults.isOnTrack ? (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center space-x-3">
                      <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                      <p className="text-sm text-green-700 dark:text-green-300">
                        Great! You're on track to fully fund your child's education.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg flex items-center space-x-3">
                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          You need to save an additional {formatCurrency(educationResults.shortfall)}
                        </p>
                      </div>
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-sm text-purple-700 dark:text-purple-300">
                          Increase monthly savings to {formatCurrency(educationResults.monthlyNeeded)} to reach your goal
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Calculators;
