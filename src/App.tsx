import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense } from 'react';

import Layout from './components/layout/Layout';
import LoadingScreen from './components/ui/LoadingScreen';
import { useAuth } from './contexts/AuthContext';
import ScrollToTop from './components/ScrollToTop';

const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const CustomerList = lazy(() => import('./pages/CustomerList'));
const CustomerDetail = lazy(() => import('./pages/CustomerDetail'));
const AppointmentCalendar = lazy(() => import('./pages/AppointmentCalendar'));
const AppointmentNew = lazy(() => import('./pages/AppointmentNew'));
const AppointmentEdit = lazy(() => import('./pages/AppointmentEdit'));
const Analysis = lazy(() => import('./pages/Analysis'));
const Profile = lazy(() => import('./pages/Profile'));

// プロテクテッドルートコンポーネント
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AnimatePresence mode="wait">
      <ScrollToTop />
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomerList />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="appointments" element={<AppointmentCalendar />} />
            <Route path="appointments/new" element={<AppointmentNew />} />
            <Route path="appointments/edit/:id" element={<AppointmentEdit />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

export default App;