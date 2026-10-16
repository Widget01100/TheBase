// src/data/generateTransactions.ts
// Deterministic generator for realistic Kenyan transactions
// Spans Jan 2024 → Oct 2026 (or current month)
// Uses a seeded PRNG so data is stable across reloads

import {
  Briefcase,
  PiggyBank,
  Film,
  ShoppingBag,
  TrendingUp,
  Smartphone,
  Car,
  Coffee,
  Home,
  Heart,
  BookOpen,
  Music,
  Wallet,
  Zap,
  Utensils,
  Plane,
  Gift,
  Award,
} from 'lucide-react';

import type { AppTransaction } from './transactions';

// ─── Seeded PRNG (mulberry32) so data is deterministic ───
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260116);

function pick<T>(arr: T[]): T {
  return arr[Math.floor(rand() * arr.length)];
}
function between(min: number, max: number): number {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function chance(p: number): boolean {
  return rand() < p;
}

// ─── Templates ───
const INCOME_TEMPLATES = [
  { description: 'Salary - KPLC',        category: 'Salary',             amountMin: 82000, amountMax: 88000, icon: Briefcase, merchant: 'KPLC' },
  { description: 'Freelance - Web Dev',  category: 'Business',           amountMin: 15000, amountMax: 45000, icon: Briefcase, merchant: 'Upwork' },
  { description: 'M-Pesa Agent Income',  category: 'Business',           amountMin: 3000,  amountMax: 12000, icon: Wallet,    merchant: 'Safaricom' },
  { description: 'MMF Interest',         category: 'Investment Returns', amountMin: 800,   amountMax: 3500,  icon: TrendingUp, merchant: 'CIC' },
  { description: 'Sacco Dividend',       category: 'Investment Returns', amountMin: 5000,  amountMax: 15000, icon: TrendingUp, merchant: 'Stima Sacco' },
  { description: 'Gift from Family',     category: 'Gift',               amountMin: 2000,  amountMax: 8000,  icon: Gift,      merchant: 'Family' },
];

const EXPENSE_TEMPLATES = [
  { description: 'Rent - Kilimani',      category: 'Housing',       amountMin: 24000, amountMax: 26000, icon: Home,         merchant: 'Landlord' },
  { description: 'KPLC Electricity',     category: 'Utilities',     amountMin: 2200,  amountMax: 4800,  icon: Zap,          merchant: 'KPLC' },
  { description: 'Water Bill',           category: 'Utilities',     amountMin: 600,   amountMax: 1200,  icon: Home,         merchant: 'Nairobi Water' },
  { description: 'Naivas Supermarket',   category: 'Groceries',     amountMin: 1800,  amountMax: 5500,  icon: ShoppingBag,  merchant: 'Naivas' },
  { description: 'Carrefour Shopping',   category: 'Groceries',     amountMin: 1500,  amountMax: 4800,  icon: ShoppingBag,  merchant: 'Carrefour' },
  { description: 'Java House',           category: 'Food',          amountMin: 700,   amountMax: 2200,  icon: Coffee,       merchant: 'Java' },
  { description: 'KFC Lunch',            category: 'Food',          amountMin: 600,   amountMax: 1800,  icon: Utensils,     merchant: 'KFC' },
  { description: 'Uber Ride',            category: 'Transport',     amountMin: 300,   amountMax: 1500,  icon: Car,          merchant: 'Uber' },
  { description: 'Matatu Fare',          category: 'Transport',     amountMin: 50,    amountMax: 200,   icon: Car,          merchant: 'Matatu' },
  { description: 'Netflix',              category: 'Entertainment', amountMin: 1450,  amountMax: 1450,  icon: Film,         merchant: 'Netflix' },
  { description: 'Spotify Premium',      category: 'Entertainment', amountMin: 599,   amountMax: 599,   icon: Music,        merchant: 'Spotify' },
  { description: 'Showmax',              category: 'Entertainment', amountMin: 700,   amountMax: 700,   icon: Film,         merchant: 'Showmax' },
  { description: 'Safaricom Airtime',    category: 'Airtime',       amountMin: 100,   amountMax: 1000,  icon: Smartphone,   merchant: 'Safaricom' },
  { description: 'Safaricom Data',       category: 'Airtime',       amountMin: 500,   amountMax: 2000,  icon: Smartphone,   merchant: 'Safaricom' },
  { description: 'AAR Health',           category: 'Healthcare',    amountMin: 2500,  amountMax: 4500,  icon: Heart,        merchant: 'AAR' },
  { description: 'Amazon Books',         category: 'Education',     amountMin: 800,   amountMax: 3000,  icon: BookOpen,     merchant: 'Amazon' },
  { description: 'Udemy Course',         category: 'Education',     amountMin: 1500,  amountMax: 5500,  icon: BookOpen,     merchant: 'Udemy' },
  { description: 'Flight - Safari',      category: 'Travel',        amountMin: 8000,  amountMax: 22000, icon: Plane,        merchant: 'Kenya Airways' },
];

const INVESTMENT_TEMPLATES = [
  { description: 'CIC MMF Investment',      category: 'Investment', amountMin: 5000,  amountMax: 15000, icon: TrendingUp, merchant: 'CIC' },
  { description: 'Stima Sacco Deposit',     category: 'Savings',    amountMin: 3000,  amountMax: 8000,  icon: PiggyBank,  merchant: 'Stima Sacco' },
  { description: 'Mwalimu Sacco Deposit',   category: 'Savings',    amountMin: 2000,  amountMax: 6000,  icon: PiggyBank,  merchant: 'Mwalimu' },
  { description: 'NSE Stock Purchase',      category: 'Investment', amountMin: 3000,  amountMax: 12000, icon: TrendingUp, merchant: 'NSE' },
  { description: 'Emergency Fund',          category: 'Savings',    amountMin: 1000,  amountMax: 5000,  icon: PiggyBank,  merchant: 'KCB' },
  { description: 'M-PESA to KCB Savings',   category: 'Savings',    amountMin: 1000,  amountMax: 4000,  icon: PiggyBank,  merchant: 'KCB' },
];

// ─── Realistic date-time helpers ───
const HOURS = ['06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22'];
function formatTime(): string {
  const h = pick(HOURS);
  const m = String(between(0, 59)).padStart(2, '0');
  const ampm = parseInt(h) < 12 ? 'AM' : 'PM';
  const displayHour = parseInt(h) % 12 || 12;
  return `${String(displayHour).padStart(2, '0')}:${m} ${ampm}`;
}


// ─── Main generator ───
export function generateTransactions(startYear = 2024, endDate = new Date()): AppTransaction[] {
  const transactions: AppTransaction[] = [];
  let id = 1;

  const add = (
    date: Date,
    template: (typeof INCOME_TEMPLATES)[number] | (typeof EXPENSE_TEMPLATES)[number] | (typeof INVESTMENT_TEMPLATES)[number],
    type: 'income' | 'expense' | 'investment' | 'saving'
  ) => {
    const amount = between(template.amountMin, template.amountMax);
    transactions.push({
      id: String(id++),
      userId: 'demo-user-1',
      description: template.description,
      amount: type === 'income' ? amount : -Math.abs(amount),
      type,
      category: template.category,
      date: new Date(date),
      time: formatTime(),
      icon: template.icon,
      merchant: template.merchant,
      status: 'completed',
      tags: [template.category.toLowerCase()],
    });
  };

  const lastYear = endDate.getFullYear();
  const lastMonth = endDate.getMonth();

  for (let year = startYear; year <= lastYear; year++) {
    for (let month = 0; month < 12; month++) {
      if (year === lastYear && month > lastMonth) break;

      // ─── MONTHLY ───
      add(new Date(year, month, 25), INCOME_TEMPLATES[0], 'income');  // Salary
      add(new Date(year, month, 5), EXPENSE_TEMPLATES[0], 'expense'); // Rent
      add(new Date(year, month, 8), EXPENSE_TEMPLATES[1], 'expense'); // KPLC
      add(new Date(year, month, 10), EXPENSE_TEMPLATES[2], 'expense'); // Water
      add(new Date(year, month, 3), EXPENSE_TEMPLATES[9], 'expense'); // Netflix
      add(new Date(year, month, 12), EXPENSE_TEMPLATES[10], 'expense'); // Spotify
      add(new Date(year, month, 15), EXPENSE_TEMPLATES[11], 'expense'); // Showmax
      add(new Date(year, month, 15), EXPENSE_TEMPLATES[14], 'expense'); // AAR
      add(new Date(year, month, 20), INVESTMENT_TEMPLATES[0], 'investment'); // CIC MMF
      add(new Date(year, month, 25), INVESTMENT_TEMPLATES[1], 'investment'); // Stima Sacco
      add(new Date(year, month, 27), INVESTMENT_TEMPLATES[4], 'investment'); // Emergency

      // ─── IRREGULAR INCOME ───
      if (chance(0.7)) add(new Date(year, month, between(5, 25)), INCOME_TEMPLATES[1], 'income'); // Freelance
      if (chance(0.9)) add(new Date(year, month, between(1, 28)), INCOME_TEMPLATES[2], 'income'); // M-Pesa Agent
      add(new Date(year, month, 28), INCOME_TEMPLATES[3], 'income'); // MMF Interest
      if (month === 11 || month === 5) add(new Date(year, month, 15), INCOME_TEMPLATES[4], 'income'); // Sacco Dividend (Jun & Dec)
      if (chance(0.15)) add(new Date(year, month, between(1, 28)), INCOME_TEMPLATES[5], 'income'); // Family gift

      // ─── WEEKLY GROCERIES & COFFEE ───
      const groceryWeeks = [4, 11, 18, 25];
      groceryWeeks.forEach((day) => {
        const d = Math.min(day, new Date(year, month + 1, 0).getDate());
        if (chance(0.8)) add(new Date(year, month, d), pick([EXPENSE_TEMPLATES[3], EXPENSE_TEMPLATES[4]]), 'expense');
      });

      // ─── FREQUENT SMALL EXPENSES ───
      const numSmall = between(6, 12);
      for (let i = 0; i < numSmall; i++) {
        const day = between(1, new Date(year, month + 1, 0).getDate());
        const template = pick([
          EXPENSE_TEMPLATES[5],  // Java
          EXPENSE_TEMPLATES[6],  // KFC
          EXPENSE_TEMPLATES[7],  // Uber
          EXPENSE_TEMPLATES[8],  // Matatu
          EXPENSE_TEMPLATES[12], // Airtime
          EXPENSE_TEMPLATES[13], // Data
        ]);
        add(new Date(year, month, day), template, 'expense');
      }

      // ─── OCCASIONAL LARGER EXPENSES ───
      if (chance(0.15)) add(new Date(year, month, between(1, 28)), EXPENSE_TEMPLATES[15], 'expense'); // Amazon
      if (chance(0.1))  add(new Date(year, month, between(1, 28)), EXPENSE_TEMPLATES[16], 'expense'); // Udemy
      if (chance(0.05)) add(new Date(year, month, between(1, 28)), EXPENSE_TEMPLATES[17], 'expense'); // Flight

      // ─── MONTHLY M-PESA TRANSFER TO SAVINGS ───
      add(new Date(year, month, 18), INVESTMENT_TEMPLATES[5], 'saving');
      if (chance(0.6)) add(new Date(year, month, between(1, 28)), INVESTMENT_TEMPLATES[3], 'investment'); // NSE stocks
    }
  }

  // Sort descending by date
  const sorted = transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return sorted;
}
