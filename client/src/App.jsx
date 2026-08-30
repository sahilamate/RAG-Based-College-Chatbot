import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AdminRoute } from './components/auth/AdminRoute';

// Layouts
import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';

// Student Pages
import StudentChat from './pages/student/Chat';
import StudentHistory from './pages/student/History';
import StudentProfile from './pages/student/Profile';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDocuments from './pages/admin/Documents';
import AdminUploadDocument from './pages/admin/UploadDocument';
import AdminKnowledgeBase from './pages/admin/KnowledgeBase';
import AdminAnalytics from './pages/admin/Analytics';
import AdminProfile from './pages/admin/Profile';

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<StudentLayout />}>
                <Route path="/chat" element={<StudentChat />} />
                <Route path="/history" element={<StudentHistory />} />
                <Route path="/profile" element={<StudentProfile />} />
              </Route>
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/documents" element={<AdminDocuments />} />
                <Route path="/admin/documents/upload" element={<AdminUploadDocument />} />
                <Route path="/admin/knowledge-base" element={<AdminKnowledgeBase />} />
                <Route path="/admin/analytics" element={<AdminAnalytics />} />
                <Route path="/admin/profile" element={<AdminProfile />} />
              </Route>
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
