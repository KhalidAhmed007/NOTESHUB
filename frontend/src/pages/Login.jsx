import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, LogIn } from 'lucide-react';
import Logo from '../components/Logo';
import AuthLayout from '../components/AuthLayout';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {/* Logo */}
      <div className="mb-7 flex flex-col items-center text-center">
        <Logo size="lg" centered />
        <p className="text-sm text-gray-500 mt-2">Upload, find, and download study notes.</p>
      </div>

      {/* Section heading */}
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-gray-800">Sign in to your account</h2>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent hover:border-gray-400 transition-all duration-200"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="password"
              required
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-95 disabled:opacity-60 text-white font-bold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-2"
        >
          {loading
            ? <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <LogIn className="h-4 w-4" />}
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 transition">
          Create one free →
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
