import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import { v4 as uuidv4 } from 'uuid';
import api from '../../services/api';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [deviceId, setDeviceId] = useState('');
  const [showFullText, setShowFullText] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let storedDeviceId = localStorage.getItem('deviceId');
    if (!storedDeviceId) {
      storedDeviceId = uuidv4();
      localStorage.setItem('deviceId', storedDeviceId);
    }
    setDeviceId(storedDeviceId);

    const timer = setTimeout(() => {
      setShowFullText(true);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post('/api/auth/register', { email, password, deviceId });
      setError('Registered successfully');
      setEmail('');
      setPassword('');
      
      // Show success message briefly before redirecting
      setTimeout(() => {
        navigate('/login', { state: { message: 'Registration successful. Please log in.' } });
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <style jsx>{`
        @keyframes slideInColor {
          0% { color: transparent; }
          100% { color: #f97316; }
        }
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-slide-in-color {
          animation: slideInColor 2s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        @keyframes plate-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes food-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
      `}</style>
      <div className="w-full md:w-1/2 bg-white flex flex-col justify-center items-center p-8 md:p-12">
        <div className="max-w-md w-full">
          {!showFullText ? (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-1 text-6xl md:text-8xl font-bold animate-slide-in-color">A</div>
              <div className="col-span-2 flex flex-col justify-center">
                <div className="text-4xl md:text-6xl font-bold animate-slide-in-color" style={{animationDelay: '0.2s'}}>ka</div>
                <div className="text-4xl md:text-6xl font-bold animate-slide-in-color" style={{animationDelay: '0.4s'}}>bite</div>
              </div>
            </div>
          ) : (
            <div className="mb-6 animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-bold text-orange-500">Akabite</h1>
            </div>
          )}
          <p className="text-lg md:text-xl text-left animate-slide-in-color leading-relaxed ml-2" style={{animationDelay: '0.6s'}}>
            Where travelers<br></br> <span className="text-6xl font-bold">O</span><span className="text-5xl font-bold">rder</span> their <span className='text-5xl font-bold'>f</span>oo<span className='text-5xl font-bold'>d</span> <br />
             <span className='text-6xl font-bold'>E</span>ase...
          </p>
        </div>
      </div>
      <div className="w-full md:w-1/2 flex items-center justify-center bg-gray-50 p-8">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-orange-500">Register</h2>
          {error && <p className={`mb-4 text-center ${error.includes('successful') ? 'text-green-500' : 'text-red-500'}`}>{error}</p>}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <svg width="100" height="100" viewBox="0 0 100 100" className="animate-[plate-spin_3s_linear_infinite]">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#f97316" strokeWidth="5" />
                <circle cx="50" cy="25" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite]" />
                <circle cx="25" cy="50" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite_0.3s]" />
                <circle cx="75" cy="50" r="10" fill="#f97316" className="animate-[food-bounce_1s_ease-in-out_infinite_0.6s]" />
              </svg>
              <p className="mt-4 text-lg font-medium text-orange-500">Moving to Login...</p>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                    Email:
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      validateEmail(e.target.value);
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                </div>
                <div className="mb-6">
                  <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                    Password:
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      validatePassword(e.target.value);
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>
                <button
                  type="submit"
                  className="w-full bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 mb-4"
                >
                  Register
                </button>
              </form>
              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-orange-500 hover:text-orange-600 font-medium">
                  Login here
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}