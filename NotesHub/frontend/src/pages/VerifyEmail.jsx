import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, RefreshCw } from 'lucide-react';
import Navbar from '../components/Navbar';

const VerifyEmail = () => {
  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    // If they are already verified, redirect to dashboard
    if (user && user.isVerified) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await axios.post('/api/auth/verify-otp', { otp });
      // Update the user context with the new token and verified user
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setSuccess('');
    setResending(true);
    try {
      const { data } = await axios.post('/api/auth/resend-otp');
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-purple-50/10 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-3xl shadow-xl shadow-indigo-100/50 p-8 border border-slate-100 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
            <Mail className="h-8 w-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h2>
          <p className="text-gray-500 text-sm mb-8">
            We sent a 6-digit verification code to <span className="font-semibold text-gray-800">{user?.email}</span>. Please enter it below.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                className="w-full text-center text-4xl font-bold tracking-[0.5em] text-gray-900 border-2 border-slate-200 rounded-2xl py-4 focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none placeholder:text-gray-200"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm font-medium bg-red-50 py-2 px-3 rounded-lg">{error}</div>}
            {success && <div className="text-green-600 text-sm font-medium bg-green-50 py-2 px-3 rounded-lg">{success}</div>}

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl py-3 px-4 flex items-center justify-center transition-all shadow-md shadow-indigo-200"
            >
              {loading ? 'Verifying...' : 'Verify Email'} <ArrowRight className="ml-2 h-5 w-5" />
            </button>
          </form>

          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-sm text-gray-500">
              Didn't receive the code?{' '}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-600 font-bold hover:text-indigo-700 disabled:opacity-50 flex items-center justify-center w-full mt-2"
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${resending ? 'animate-spin' : ''}`} />
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
