import React from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  Trophy,
  Target,
  TrendingUp,
  Edit2,
  Camera
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const Profile: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Profile Header */}
      <div className="relative">
        <div className="h-48 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl"></div>
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-600 to-primary-400 rounded-2xl border-4 border-white dark:border-gray-900 flex items-center justify-center">
              <span className="text-white text-4xl font-bold">FK</span>
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <Camera size={16} className="text-gray-700 dark:text-gray-300" />
            </button>
          </div>
        </div>
        <div className="absolute bottom-4 right-8">
          <Button variant="primary" icon={<Edit2 size={16} />}>
            Edit Profile
          </Button>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              About Francis
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <User size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Full Name</p>
                  <p className="font-medium">Francis Kamau</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Mail size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="font-medium">francis@example.com</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Phone size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="font-medium">+254 712 345 678</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <MapPin size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-medium">Nairobi, Kenya</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Calendar size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Member Since</p>
                  <p className="font-medium">January 2024</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Trophy size={18} className="text-primary-600" />
                <div>
                  <p className="text-xs text-gray-500">Member Tier</p>
                  <p className="font-medium">Premium</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card variant="glass" className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {[
                { action: 'Created new goal: Emergency Fund', time: '2 hours ago' },
                { action: 'Added investment: CIC Money Market Fund', time: '1 day ago' },
                { action: 'Completed 52-week challenge week 12', time: '3 days ago' },
                { action: 'Earned badge: Saving Shark', time: '1 week ago' }
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          <Card variant="gradient" className="p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Stats Overview</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Level 12</span>
                  <span>1,250 / 2,000 XP</span>
                </div>
                <div className="h-2 bg-white/20 rounded-full">
                  <div className="h-2 bg-white rounded-full" style={{ width: '62.5%' }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <Target size={20} className="mx-auto mb-1" />
                  <p className="text-2xl font-bold">8</p>
                  <p className="text-xs opacity-80">Goals</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <Award size={20} className="mx-auto mb-1" />
                  <p className="text-2xl font-bold">12</p>
                  <p className="text-xs opacity-80">Badges</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <TrendingUp size={20} className="mx-auto mb-1" />
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs opacity-80">Investments</p>
                </div>
                <div className="text-center p-3 bg-white/10 rounded-lg">
                  <Calendar size={20} className="mx-auto mb-1" />
                  <p className="text-2xl font-bold">30</p>
                  <p className="text-xs opacity-80">Day Streak</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Achievements */}
          <Card variant="glass" className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Achievements
            </h3>
            <div className="space-y-3">
              {[
                { name: 'Saving Shark', icon: '🦈', date: '2 days ago' },
                { name: 'M-Pesa Master', icon: '📱', date: '1 week ago' },
                { name: 'Budget King', icon: '👑', date: '2 weeks ago' }
              ].map((achievement, i) => (
                <div key={i} className="flex items-center space-x-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{achievement.name}</p>
                    <p className="text-xs text-gray-500">Earned {achievement.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
