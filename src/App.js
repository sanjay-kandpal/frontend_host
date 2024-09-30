import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Assuming these components are defined elsewhere
import Login from './components/Login/Login';
import Register from './components/Register/Register';
import Home from './components/Home/Home';
import Cart from './components/Cart/Cart';
import Checkout from './components/Checkout/Checkout';
import OrderHistory from './components/OrderHistory/OrderHistory';
import ItemDetail from './components/ItemDetail/ItemDetail';

const NavLink = ({ to, children, onClick }) => (
  <li>
    <Link
      to={to}
      className="px-4 py-2 text-white hover:bg-orange-600 rounded-md text-sm font-medium transition-colors duration-200"
      onClick={onClick}
    >
      {children}
    </Link>
  </li>
);

function AppContent() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const PrivateRoute = ({ children }) => {
    return isAuthenticated ? children : <Navigate to="/login" />;
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 pt-20">
        <nav className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 rounded-full shadow-lg z-50">
          <div className="px-4 py-2">
            <ul className="flex items-center space-x-4">
              <NavLink to="/">Home</NavLink>
              <NavLink to="/cart">Basket</NavLink>
              <NavLink to="/order-history">History</NavLink>
              {!isAuthenticated ? (
                <>
                  <NavLink to="/login">Login</NavLink>
                  <NavLink to="/register">Register</NavLink>
                </>
              ) : (
                <NavLink
                  to="/login"
                  onClick={() => {
                    logout();
                    window.location.href = '/login';
                  }}
                >
                  Logout
                </NavLink>
              )}
            </ul>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <Routes>
              <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
              <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
              <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/order-history" element={<PrivateRoute><OrderHistory /></PrivateRoute>} />
              <Route path="/item/:id" element={<PrivateRoute><ItemDetail /></PrivateRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;