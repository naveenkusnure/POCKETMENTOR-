import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Materials from './pages/Materials';
import SummaryView from './pages/SummaryView';
import Quizzes from './pages/Quizzes';
import Mentor from './pages/Mentor';
import Prediction from './pages/Prediction';
import ProgressView from './pages/ProgressView';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Application routes */}
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
            <Route path="materials" element={<Materials />} />
            <Route path="materials/:id/summary" element={<SummaryView />} />
            <Route path="mentor" element={<Mentor />} />
            <Route path="quizzes" element={<Quizzes />} />
            <Route path="progress" element={<ProgressView />} />
            <Route path="prediction" element={<Prediction />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
