import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/dashboard/Dashboard';
import Transactions from './pages/transactions/Transactions';
import Savings from './pages/savings/Savings';
import Investments from './pages/investments/Investments';
import Calculators from './pages/calculators/Calculators';
import Education from './pages/education/Education';
import AICoach from './pages/ai-coach/AICoach';
import LoadingSpinner from './components/shared/LoadingSpinner';
import { useApp } from './contexts/AppContext';

// Lazy load with Suspense
const Settings = React.lazy(() => import('./pages/settings/Settings'));
const Profile = React.lazy(() => import('./pages/profile/Profile'));
const Help = React.lazy(() => import('./pages/help/Help'));

function App() {
  const { loading } = useApp();

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading The Base..." />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="savings" element={<Savings />} />
        <Route path="investments" element={<Investments />} />
        <Route path="calculators" element={<Calculators />} />
        <Route path="education" element={<Education />} />
        <Route path="ai-coach" element={<AICoach />} />
        <Route
          path="settings"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Settings />
            </React.Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Profile />
            </React.Suspense>
          }
        />
        <Route
          path="help"
          element={
            <React.Suspense fallback={<LoadingSpinner />}>
              <Help />
            </React.Suspense>
          }
        />
      </Route>
    </Routes>
  );
}

export default App;
