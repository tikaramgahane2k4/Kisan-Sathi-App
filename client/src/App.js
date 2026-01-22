import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { OfflineProvider } from './context/OfflineContext';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Analytics from './pages/Analytics';
import CropDetails from './pages/CropDetails';
import AddMaterial from './pages/AddMaterial';
import EditMaterial from './pages/EditMaterial';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
};

// Public Route Component
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return !user ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <LanguageProvider>
      <OfflineProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/" element={<PublicRoute><Welcome /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />            <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />              <Route path="/crop/:id" element={<ProtectedRoute><CropDetails /></ProtectedRoute>} />
              <Route path="/crop/:id/add-material" element={<ProtectedRoute><AddMaterial /></ProtectedRoute>} />
              <Route path="/crop/:id/edit-material/:materialId" element={<ProtectedRoute><EditMaterial /></ProtectedRoute>} />
            </Routes>
          </Router>
        </AuthProvider>
      </OfflineProvider>
    </LanguageProvider>
  );
}

export default App;
