import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import Celebrations from './pages/Celebrations'
import Gifts from './pages/Gifts'
import './style.css'
import Messages from './pages/Messages'
import Store from './pages/Store'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F7F4EF', fontFamily: "'DM Sans', sans-serif", color: '#4A7C3F', fontSize: 14 }}>
      Loading Guldasta...
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/people" element={<ProtectedRoute><People /></ProtectedRoute>} />
        <Route path="/celebrations" element={<ProtectedRoute><Celebrations /></ProtectedRoute>} />
        <Route path="/gifts" element={<ProtectedRoute><Gifts /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
        <Route path="/store" element={<ProtectedRoute><Store /></ProtectedRoute>} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

createRoot(document.getElementById('app')!).render(
  <StrictMode><App /></StrictMode>
)