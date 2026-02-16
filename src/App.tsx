import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Layout from './components/layout/Layout';
import Dashboard from './pages/dashboard/Dashboard';

// Placeholder pages (we'll create these later)
const Savings = () => <div>Savings Page</div>;
const Investments = () => <div>Investments Page</div>;
const Education = () => <div>Financial Education Page</div>;
const Calculators = () => <div>Calculators Page</div>;
const Challenges = () => <div>Challenges Page</div>;
const Goals = () => <div>Goals Page</div>;
const Budget = () => <div>Budget Page</div>;
const AICoach = () => <div>AI Coach Malkia Page</div>;
const Community = () => <div>Community Page</div>;
const Resources = () => <div>Resources Page</div>;
const Profile = () => <div>Profile Page</div>;
const Settings = () => <div>Settings Page</div>;
const Help = () => <div>Help Page</div>;

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
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
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
