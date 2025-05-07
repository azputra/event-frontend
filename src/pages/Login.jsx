import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Lottie from 'lottie-react';
import loginAnimation from '../assets/login.json';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      setShake(true);
      const timer = setTimeout(() => setShake(false), 500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        navigate('/');
      } else {
        setError('Email atau password salah');
      }
    } catch (err) {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-3 sm:p-6">
      <div className="w-full max-w-md sm:max-w-4xl bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Left side with animation - hidden on very small screens */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-6 sm:p-8 flex flex-col justify-center items-center md:w-5/12 sm:block hidden">
            <div className="w-32 h-32 md:w-64 md:h-64 mb-4">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
            <h2 className="text-xl md:text-3xl font-bold text-center">Verifikasi Peserta</h2>
            <p className="text-sm md:text-base text-blue-100 text-center mt-2 max-w-xs">
              Sistem manajemen dan verifikasi peserta event
            </p>
          </div>
          
          {/* Top banner for mobile only */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white p-4 flex flex-col justify-center items-center sm:hidden">
            <div className="w-20 h-20 mb-2">
              <Lottie animationData={loginAnimation} loop={true} />
            </div>
            <h2 className="text-xl font-bold text-center">Verifikasi Peserta</h2>
            <p className="text-xs text-blue-100 text-center mt-1">
              Sistem manajemen dan verifikasi peserta event
            </p>
          </div>
          
          {/* Right side with form */}
          <div className="p-6 sm:p-8 md:p-12 md:w-7/12 flex flex-col justify-center">
            <div className="mb-4 sm:mb-6">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800">Login</h3>
              <p className="text-sm md:text-base text-gray-500 mt-1 sm:mt-2">Masuk ke dashboard admin</p>
            </div>
            
            {error && (
              <div className={`bg-red-50 border-l-4 border-red-500 text-red-700 p-3 rounded mb-4 sm:mb-6 text-sm ${shake ? 'animate-shake' : ''}`}>
                <div className="flex items-center">
                  <svg className="h-4 w-4 text-red-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <form className="space-y-4 sm:space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="pl-10 appearance-none block w-full px-3 py-2 sm:py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-2 sm:py-3 px-4 border border-transparent text-sm sm:text-base font-medium rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md shadow-blue-500/20 transition-all duration-150"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Masuk...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span>Masuk</span>
                      <svg className="ml-2 -mr-1 w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  )}
                </button>
              </div>
              
              <div className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
                Aplikasi Verifikasi Event &copy; 2025
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;