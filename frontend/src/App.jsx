
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CropDetails from './pages/CropDetails';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import MobileNav from './components/MobileNav';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './i18n.jsx';

const App = () => {
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('agri_auth');
    return saved ? JSON.parse(saved) : { user: null, token: null, isAuthenticated: false };
  });
  const [showAddCropModal, setShowAddCropModal] = useState(false);

  useEffect(() => {
    localStorage.setItem('agri_auth', JSON.stringify(auth));
  }, [auth]);

  const login = (user, token) => {
    setAuth({ user, token, isAuthenticated: true });
  };

  const logout = () => {
    setAuth({ user: null, token: null, isAuthenticated: false });
    localStorage.removeItem('agri_auth');
  };

  const updateUser = (updatedUser) => {
    setAuth(prev => ({
      ...prev,
      user: { ...prev.user, ...updatedUser }
    }));
  };

  return (
    <LanguageProvider>
      <HashRouter>
        <div className="min-h-screen flex flex-col">
          {auth.isAuthenticated && <Navbar user={auth.user} onLogout={logout} />}
          <main className="flex-grow pb-20 md:pb-0">
            <Routes>
              <Route 
                path="/login" 
                element={!auth.isAuthenticated ? <Login onLogin={login} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/register" 
                element={!auth.isAuthenticated ? <Register onLogin={login} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/" 
                element={
                  <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                    <Dashboard user={auth.user} showAddCropModal={showAddCropModal} setShowAddCropModal={setShowAddCropModal} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/crop/:id" 
                element={
                  <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                    <CropDetails />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute isAuthenticated={auth.isAuthenticated}>
                    <Profile user={auth.user} onUpdateUser={updateUser} />
                  </ProtectedRoute>
                } 
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          {auth.isAuthenticated && <MobileNav onAddCrop={() => setShowAddCropModal(true)} />}
        </div>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
