import React from 'react';
import logo from '../assets/logo.png';

/**
 * Reusable Logo component for NotesHub.
 * 
 * Props:
 *  - size: "sm" | "md" | "lg" (default: "md")
 *  - showText: boolean (default: true) — show "NotesHub" text next to logo
 *  - centered: boolean (default: false) — center the logo (for auth pages)
 */
const sizeMap = {
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
};

const textSizeMap = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-3xl',
};

const Logo = ({ size = 'md', showText = true, centered = false }) => {
  return (
    <div className={`flex items-center gap-2.5 ${centered ? 'justify-center' : ''}`}>
      <img
        src={logo}
        alt="NotesHub Logo"
        className={`${sizeMap[size]} object-contain transition-transform duration-200 hover:scale-105 drop-shadow-sm`}
        onError={(e) => {
          // Fallback: hide broken image and show icon replacement
          e.target.style.display = 'none';
        }}
      />
      {showText && (
        <span className={`${textSizeMap[size]} font-extrabold text-blue-700 tracking-tight`}>
          Notes<span className="text-gray-900">Hub</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
