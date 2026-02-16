import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';

// Placeholder pages
const Savings = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Savings Page - Coming Soon</div>;
const Investments = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Investments Page - Coming Soon</div>;
const Education = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Financial Education Page - Coming Soon</div>;
const Calculators = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Calculators Page - Coming Soon</div>;
const Challenges = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Challenges Page - Coming Soon</div>;
const Goals = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Goals Page - Coming Soon</div>;
const Budget = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Budget Page - Coming Soon</div>;
const AICoach = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">AI Coach Malkia Page - Coming Soon</div>;
const Community = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Community Page - Coming Soon</div>;
const Resources = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Resources Page - Coming Soon</div>;
const Profile = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Profile Page - Coming Soon</div>;
const Settings = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Settings Page - Coming Soon</div>;
const Help = () => <div className="p-8 text-center text-gray-600 dark:text-gray-400">Help Page - Coming Soon</div>;

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="savings" element={<Savings />} />
          <Route path="investments" element={<Investments />} />
          <Route path="education" element={<Education />} />
          <Route path="calculators" element={<Calculators />} />
          <Route path="challenges" element={<Challenges />} />
          <Route path="goals" element={<Goals />} />
          <Route path="budget" element={<Budget />} />
          <Route path="ai-coach" element={<AICoach />} />
          <Route path="community" element={<Community />} />
          <Route path="resources" element={<Resources />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<Help />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
