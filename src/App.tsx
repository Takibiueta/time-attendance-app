import React, { useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Layouts
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import EmployeeFormPage from './pages/employees/EmployeeFormPage';
import AttendancePage from './pages/attendance/AttendancePage';
import MonthlyPayrollPage from './pages/payroll/MonthlyPayrollPage';
import IndividualPayrollPage from './pages/payroll/IndividualPayrollPage';
import PaySlipPage from './pages/payroll/PaySlipPage';
import SettingsPage from './pages/settings/SettingsPage';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

function App() {
  const checkAuth = useAuthStore(state => state.checkAuth);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected routes */}
      <Route element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Navigate to="/dashboard\" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        {/* Employee routes */}
        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/new" element={<EmployeeFormPage />} />
        <Route path="/employees/:id" element={<EmployeeFormPage />} />
        
        {/* Attendance routes */}
        <Route path="/attendance" element={<AttendancePage />} />
        
        {/* Payroll routes */}
        <Route path="/payroll/monthly" element={<MonthlyPayrollPage />} />
        <Route path="/payroll/individual" element={<IndividualPayrollPage />} />
        <Route path="/payroll/payslip/:id/:month" element={<PaySlipPage />} />
        
        {/* Settings route */}
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/\" replace />} />
    </Routes>
  );
}

export default App;