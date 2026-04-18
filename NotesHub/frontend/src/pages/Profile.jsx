import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  User, Mail, Shield, KeyRound, CheckCircle2,
  AlertCircle, Eye, EyeOff, Lock,
} from 'lucide-react';

const Profile = () => {
  const { user } = useContext(AuthContext);

  // ── Password-change state ─────────────────────────────────────────────────
  const [currentPassword,  setCurrentPassword]  = useState('');
  const [newPassword,      setNewPassword]       = useState('');
  const [confirmPassword,  setConfirmPassword]   = useState('');
  const [showCurrent,      setShowCurrent]       = useState(false);
  const [showNew,          setShowNew]           = useState(false);
  const [showConfirm,      setShowConfirm]       = useState(false);
  const [pwLoading,        setPwLoading]         = useState(false);
  const [pwSuccess,        setPwSuccess]         = useState('');
  const [pwError,          setPwError]           = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');

    if (newPassword.length < 6) {
      return setPwError('New password must be at least 6 characters.');
    }
    if (newPassword !== confirmPassword) {
      return setPwError('New passwords do not match.');
    }

    try {
      setPwLoading(true);
      await axios.put('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setPwSuccess('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPwError(err.response?.data?.error || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  const roleColor = user?.role === 'admin'
    ? 'bg-red-100 text-red-700 border border-red-200'
    : 'bg-indigo-100 text-indigo-700 border border-indigo-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">

        {/* ── Account Info Card ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 px-8 py-8 flex items-center gap-5">
            <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-white text-2xl font-extrabold shadow-inner ring-2 ring-white/30 shrink-0">
              {initials}
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white leading-tight">{user?.name}</h1>
              <p className="text-indigo-200 text-sm mt-0.5 font-medium">{user?.email}</p>
              <span className={`mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${roleColor}`}>
                <Shield className="h-3 w-3" />{user?.role}
              </span>
            </div>
          </div>

          {/* Info rows */}
          <div className="px-8 py-6 divide-y divide-gray-100">
            <InfoRow icon={User}   label="Full Name"     value={user?.name} />
            <InfoRow icon={Mail}   label="Email Address" value={user?.email} />
            <InfoRow
              icon={Shield}
              label="Account Role"
              value={
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${roleColor}`}>
                  {user?.role}
                </span>
              }
            />
          </div>
        </div>

        {/* ── Change Password Card ──────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <KeyRound className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900">Change Password</h2>
              <p className="text-xs text-gray-500 mt-0.5">Keep your account secure with a strong password.</p>
            </div>
          </div>

          <div className="px-8 py-7">
            {pwSuccess && (
              <div className="mb-5 flex items-center gap-2.5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                <CheckCircle2 className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">{pwSuccess}</span>
              </div>
            )}
            {pwError && (
              <div className="mb-5 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm font-semibold">{pwError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <PasswordField
                id="current-password"
                label="Current Password"
                value={currentPassword}
                onChange={setCurrentPassword}
                show={showCurrent}
                onToggle={() => setShowCurrent(v => !v)}
              />
              <PasswordField
                id="new-password"
                label="New Password"
                value={newPassword}
                onChange={setNewPassword}
                show={showNew}
                onToggle={() => setShowNew(v => !v)}
                hint="Must be at least 6 characters"
              />
              <PasswordField
                id="confirm-password"
                label="Confirm New Password"
                value={confirmPassword}
                onChange={setConfirmPassword}
                show={showConfirm}
                onToggle={() => setShowConfirm(v => !v)}
              />

              <button
                type="submit"
                disabled={pwLoading}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-white tracking-wide transition-all
                  ${pwLoading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-200'
                  }`}
              >
                {pwLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Updating…
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4" /> Update Password
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
};

// ── Sub-components ────────────────────────────────────────────────────────────

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="py-4 flex items-center gap-4">
    <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
      <Icon className="h-4 w-4 text-slate-500" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <div className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{value}</div>
    </div>
  </div>
);

const PasswordField = ({ id, label, value, onChange, show, onToggle, hint }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-bold text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <input
        id={id}
        type={show ? 'text' : 'password'}
        required
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-xl py-2.5 px-4 pr-11 text-sm text-gray-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
    {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
  </div>
);

export default Profile;
