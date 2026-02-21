import React from 'react';
import { motion } from 'framer-motion';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  BookOpen,
  Video,
  FileText,
  ChevronRight,
  Search,
  ThumbsUp,
  Star
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

const Help: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl"></div>
        <div className="relative p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">How can we help you?</h1>
          <p className="text-white/80 mb-6">Search our help center or browse topics below</p>
          <div className="relative max-w-2xl">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60" size={20} />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>
        </div>
      </div>

      {/* Quick Help */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" className="p-6 text-center">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="text-blue-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Chat with Malkia</h3>
          <p className="text-sm text-gray-500 mb-4">Get instant answers from our AI assistant</p>
          <Button variant="primary" fullWidth>Start Chat</Button>
        </Card>

        <Card variant="glass" className="p-6 text-center">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="text-green-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Email Support</h3>
          <p className="text-sm text-gray-500 mb-4">Get help within 24 hours</p>
          <Button variant="primary" fullWidth>Send Email</Button>
        </Card>

        <Card variant="glass" className="p-6 text-center">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Phone className="text-purple-600" size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Phone Support</h3>
          <p className="text-sm text-gray-500 mb-4">Call us at +254 712 345 678</p>
          <Button variant="primary" fullWidth>Call Now</Button>
        </Card>
      </div>

      {/* FAQ Section */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        Frequently Asked Questions
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            q: 'How do I connect my M-PESA account?',
            a: 'Go to Settings > M-PESA and click "Connect Account". You\'ll receive an STK push to verify.'
          },
          {
            q: 'What is the 52-week challenge?',
            a: 'Save increasing amounts each week for a year. Start with KES 100 in week 1, end with KES 5,200 in week 52.'
          },
          {
            q: 'How does round-up savings work?',
            a: 'Each M-PESA transaction is rounded up to the nearest 100, and the difference is saved automatically.'
          },
          {
            q: 'Can I invest in multiple Saccos?',
            a: 'Yes! You can track multiple Sacco investments and compare their dividend rates.'
          },
          {
            q: 'Is my data secure?',
            a: 'We use bank-level encryption and never store your M-PESA PIN. All data is encrypted at rest.'
          },
          {
            q: 'How do I contact Malkia?',
            a: 'Click on the AI Coach tab and start chatting. She\'s available 24/7 to help with financial advice.'
          }
        ].map((faq, i) => (
          <Card key={i} variant="glass" className="p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{faq.q}</h3>
            <p className="text-sm text-gray-500">{faq.a}</p>
          </Card>
        ))}
      </div>

      {/* Guides & Tutorials */}
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
        Guides & Tutorials
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Getting Started Guide', icon: BookOpen, reads: 1234 },
          { title: 'Video Tutorials', icon: Video, reads: 2345 },
          { title: 'Financial Glossary', icon: FileText, reads: 3456 }
        ].map((guide, i) => {
          const Icon = guide.icon;
          return (
            <Card key={i} variant="glass" className="p-6">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-primary-100 dark:bg-primary-900/20 rounded-lg">
                  <Icon className="text-primary-600" size={20} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">{guide.title}</h3>
              </div>
              <p className="text-sm text-gray-500 mb-4">{guide.reads.toLocaleString()} reads</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">Updated recently</span>
                <ChevronRight size={16} className="text-gray-400" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Feedback */}
      <Card variant="glass" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              Was this help page useful?
            </h3>
            <p className="text-sm text-gray-500">Your feedback helps us improve</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ThumbsUp size={20} className="text-gray-500" />
            </button>
            <button className="p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
              <ThumbsUp size={20} className="text-gray-500 rotate-180" />
            </button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default Help;
