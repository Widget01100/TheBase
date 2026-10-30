import React from 'react';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon,
  User,
  Bell,
  Shield,
  Moon,
  Sun,
  Globe,
  Smartphone,
  CreditCard,
  LogOut,
  ChevronRight,
  Save
} from 'lucide-react';
import Card from '@/components/ui/Card';
import CurrencySwitcher from '@/components/shared/CurrencySwitcher';
import Button from '@/components/ui/Button';
import { useApp } from '@/contexts/AppContext';

const Settings: React.FC = () => {
  const { darkMode, toggleDarkMode } = useApp();

  // toggleDarkMode comes from useApp() — AppContext handles <html> class

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900 dark:text-ink-50">
          Settings
        </h1>
        <Button variant="primary" icon={<Save size={18} />}>
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Settings */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <User className="text-brand-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Profile</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ink-600 dark:text-ink-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Francis Kamau"
                className="w-full p-2 border border-ink-200 dark:border-ink-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-600 dark:text-ink-400 mb-1">
                Email
              </label>
              <input
                type="email"
                defaultValue="francis@example.com"
                className="w-full p-2 border border-ink-200 dark:border-ink-800 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-ink-600 dark:text-ink-400 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                defaultValue="+254 712 345 678"
                className="w-full p-2 border border-ink-200 dark:border-ink-800 rounded-lg"
              />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Bell className="text-yellow-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Notifications</h2>
          </div>
          <div className="space-y-3">
            {[
              'Email Notifications',
              'SMS Alerts',
              'Push Notifications',
              'Weekly Reports',
              'Budget Alerts'
            ].map((item) => (
              <div key={item} className="flex items-center justify-between">
                <span className="text-sm text-ink-700 dark:text-ink-300">{item}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-ink-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ink-50 after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                </label>
              </div>
            ))}
          </div>
        </Card>

        {/* Security Settings */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <Shield className="text-red-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Security</h2>
          </div>
          <div className="space-y-4">
            <button className="w-full text-left p-3 hover:bg-ink-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Change Password</span>
                <ChevronRight size={16} className="text-ink-400" />
              </div>
            </button>
            <button className="w-full text-left p-3 hover:bg-ink-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Two-Factor Authentication</span>
                <ChevronRight size={16} className="text-ink-400" />
              </div>
            </button>
            <button className="w-full text-left p-3 hover:bg-ink-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Connected Devices</span>
                <ChevronRight size={16} className="text-ink-400" />
              </div>
            </button>
          </div>
        </Card>

        {/* Appearance */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Moon className="text-purple-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Appearance</h2>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-ink-700 dark:text-ink-300">Dark Mode</span>
            <button
              onClick={toggleDarkMode}
              className="p-2 hover:bg-ink-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </Card>

        {/* Currency & Language */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Globe className="text-green-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-ink-600 dark:text-ink-400 mb-1">
                Currency
              </label>
              <CurrencySwitcher variant="full" />
            </div>
            <div>
              <label className="block text-sm text-ink-600 dark:text-ink-400 mb-1">
                Language
              </label>
              <select className="w-full p-2 border border-ink-200 dark:border-ink-800 rounded-lg">
                <option>English</option>
                <option>Kiswahili</option>
                <option>Sheng</option>
              </select>
            </div>
          </div>
        </Card>

        {/* M-PESA Settings */}
        <Card variant="glass" className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <Smartphone className="text-green-600" size={20} />
            </div>
            <h2 className="font-semibold text-ink-900 dark:text-ink-50">M-PESA</h2>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-700 dark:text-ink-300">Auto-Sync</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-ink-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ink-50 after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-700 dark:text-ink-300">Round-Up Savings</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-ink-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-ink-950 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-ink-50 after:border-ink-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>
        </Card>

        {/* Logout */}
        <Card variant="glass" className="p-6">
          <button className="w-full flex items-center justify-between text-red-600 hover:text-red-700">
            <div className="flex items-center space-x-2">
              <LogOut size={20} />
              <span className="font-medium">Logout</span>
            </div>
            <ChevronRight size={16} />
          </button>
        </Card>
      </div>
    </motion.div>
  );
};

export default Settings;
