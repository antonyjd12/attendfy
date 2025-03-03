import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { getTheme } from './theme';
import { ColorModeProvider, useColorMode } from './context/ColorModeContext';

// Layout components
import DashboardLayout from './components/layouts/DashboardLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth pages
import Login from './pages/Login';
import Register from './components/Register';

// Dashboard pages
import DashboardHome from './pages/dashboard/DashboardHome';
import AttendancePage from './pages/dashboard/AttendancePage';
import EmployeesPage from './pages/dashboard/EmployeesPage';
import ProfilePage from './pages/dashboard/ProfilePage';
import ReportsPage from './pages/dashboard/ReportsPage';
import DevicesPage from './pages/dashboard/DevicesPage';
import AdminRegistration from './components/admin/AdminRegistration';
import EmployeeRegistration from './components/admin/EmployeeRegistration';

// Protected Route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

// Role-based Route wrapper
const RoleRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login  />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected dashboard routes */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardHome />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route
          path="/employees"
          element={
            <RoleRoute allowedRoles={['super_admin', 'admin', 'hr_manager']}>
              <EmployeesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <RoleRoute allowedRoles={['super_admin', 'admin', 'hr_manager']}>
              <ReportsPage />
            </RoleRoute>
          }
        />
        <Route path="/profile" element={<ProfilePage />} />
        <Route
          path="/devices"
          element={
            <RoleRoute allowedRoles={['super_admin', 'admin']}>
              <DevicesPage />
            </RoleRoute>
          }
        />
      </Route>

      {/* Redirect root to dashboard or login */}
      <Route
        path="/"
        element={<Navigate to="/dashboard" replace />}
      />

      {/* Admin routes */}
      <Route 
        path="/admin/register" 
        element={
          <RoleRoute allowedRoles={['super_admin']}>
            <AdminRegistration />
          </RoleRoute>
        } 
      />
      <Route 
        path="/employee/register" 
        element={
          <RoleRoute allowedRoles={['super_admin', 'admin']}>
            <EmployeeRegistration />
          </RoleRoute>
        } 
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const ThemedApp = () => {
  const { mode } = useColorMode();
  const theme = React.useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
                borderRadius: '8px',
                fontSize: '0.875rem',
              },
            }}
          />
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <ColorModeProvider>
      <ThemedApp />
    </ColorModeProvider>
  );
};

export default App;
