import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Code, Mail, Shield, FileText } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="w-full bg-slate-50 border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 lg:gap-12">
          
          {/* Left Section - Brand */}
          <div className="flex flex-col space-y-4">
            <Link to="/" className="flex items-center gap-2 group w-fit">
              <div className="bg-indigo-600 p-2 rounded-xl group-hover:scale-105 transition-transform duration-200 shadow-sm">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">NotesHub</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed max-w-xs">
              Share and discover academic notes easily. The central hub for student resources and collaborative learning.
            </p>
          </div>

          {/* Center Section - Quick Links */}
          <div className="flex flex-col space-y-4 md:pl-10">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Navigation</h3>
            <nav className="flex flex-col space-y-3" aria-label="Footer Navigation">
              <Link to="/notes" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit">Browse Notes</Link>
              <Link to="/upload" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit">Upload Note</Link>
              <Link to="/dashboard" className="text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit">Dashboard</Link>
            </nav>
          </div>

          {/* Right Section - Contact & Credit */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest">Connect</h3>
            <ul className="flex flex-col space-y-3">
              <li>
                <a href="mailto:b24it131l@kitsw.ac.in" className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit">
                  <Mail className="h-4 w-4" /> b24it131l@kitsw.ac.in
                </a>
              </li>
              <li>
                <a 
                  href="https://github.com/KhalidAhmed007/NOTESHUB" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 font-medium transition-colors w-fit"
                >
                  <Code className="h-4 w-4" /> GitHub Repository
                </a>
              </li>
              <li className="pt-1 select-none">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100/50 text-xs font-semibold text-indigo-700">
                  <span className="text-indigo-400">{'</>'}</span> Made by MOHAMMED KHALEED AHMED
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Row - Legal */}
        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium text-slate-400">
            © {new Date().getFullYear()} NotesHub. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link to="#" className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
              <Shield className="h-3.5 w-3.5" /> Privacy Policy
            </Link>
            <Link to="#" className="flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
              <FileText className="h-3.5 w-3.5" /> Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
