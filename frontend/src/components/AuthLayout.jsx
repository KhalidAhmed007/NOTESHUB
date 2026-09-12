import React from 'react';

/**
 * AuthLayout — clean + subtly polished.
 * Light gradient background, soft blur decorations, semi-transparent card.
 */
const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center px-4 py-10 relative overflow-hidden">

      {/* Decorative blobs — very subtle, won't distract */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-200 opacity-20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 opacity-20 rounded-full blur-3xl pointer-events-none" />

      {/* Form card */}
      <div className="relative z-10 w-full max-w-md bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-8 animate-fadeIn">
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
