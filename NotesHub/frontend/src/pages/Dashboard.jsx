import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  BookOpen, Download, Clock, Upload, TrendingUp,
  ArrowRight, Eye, Sparkles, Search, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';
import Footer from '../components/Footer';

// ── Branch definitions — single source of truth ─────────────────────────────
const CATEGORIES = [
  { label: 'Computer Science',  short: 'CSE',   emoji: '💻', color: 'from-blue-500 to-indigo-600'    },
  { label: 'Information Tech',  short: 'IT',    emoji: '🌐', color: 'from-cyan-500 to-blue-600'      },
  { label: 'Electronics',       short: 'ECE',   emoji: '⚡', color: 'from-yellow-500 to-orange-500' },
  { label: 'Electrical Eng.',   short: 'EEE',   emoji: '🔌', color: 'from-amber-500 to-yellow-600'  },
  { label: 'AI & ML',           short: 'AI/ML', emoji: '🤖', color: 'from-purple-500 to-pink-600'   },
  { label: 'Mechanical Eng.',   short: 'MECH',  emoji: '⚙️', color: 'from-slate-500 to-gray-700'    },
  { label: 'Civil Eng.',        short: 'CIVIL', emoji: '🏗️', color: 'from-green-500 to-teal-600'    },
];

// ── Skeleton loader for stat cards ──────────────────────────────────────────
const StatSkeleton = () => (
  <div className="rounded-2xl p-5 bg-slate-200 animate-pulse h-28" />
);

// ── Skeleton loader for note cards ──────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse space-y-3">
    <div className="h-2 w-16 bg-slate-200 rounded-full" />
    <div className="h-4 bg-slate-200 rounded-full w-3/4" />
    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
    <div className="mt-auto h-8 bg-slate-100 rounded-xl" />
  </div>
);

// ── Reusable Stat Card ──────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, sub, gradient }) => (
  <div
    className={`relative overflow-hidden rounded-2xl p-5 text-white shadow-md bg-gradient-to-br ${gradient}
      group hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 cursor-default`}
  >
    <div className="absolute -top-4 -right-4 h-20 w-20 rounded-full bg-white/10 group-hover:bg-white/15 transition" />
    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-white/70 mb-1">{label}</p>
        <p className="text-4xl font-black tabular-nums">{value !== null && value !== undefined ? value : '0'}</p>
        {sub && <p className="text-xs text-white/60 mt-1.5 font-medium">{sub}</p>}
      </div>
      <div className="bg-white/20 rounded-xl p-2.5 shrink-0">
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

// ── Main Dashboard ──────────────────────────────────────────────────────────
const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [stats,         setStats]         = useState(null);
  const [recentNotes,   setRecentNotes]   = useState([]);
  const [trending,      setTrending]      = useState([]);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [trendLoading,  setTrendLoading]  = useState(true);
  const [quickSearch,   setQuickSearch]   = useState('');

  // ── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    axios.get('/api/user/stats')
      .then(r => setStats(r.data))
      .catch(err => {
        console.error('[Stats]', err);
        setStats({ totalNotes: 0, myUploads: 0, downloads: 0, recentViews: 0 });
      })
      .finally(() => setStatsLoading(false));
  }, []);

  useEffect(() => {
    axios.get('/api/user/recent-notes')
      .then(r => setRecentNotes(Array.isArray(r.data) ? r.data : []))
      .catch(err => { console.error('[Recent]', err); setRecentNotes([]); })
      .finally(() => setRecentLoading(false));
  }, []);

  useEffect(() => {
    axios.get('/api/notes/trending?limit=6')
      .then(r => setTrending(Array.isArray(r.data) ? r.data : []))
      .catch(err => { console.error('[Trending]', err); setTrending([]); })
      .finally(() => setTrendLoading(false));
  }, []);

  // ── Note action handlers ──────────────────────────────────────────────────
  const handleView = (noteId, fileUrl) => {
    if (!fileUrl) return alert('File URL missing.');
    axios.post('/api/history/view', { noteId }).catch(console.error);
    window.open(fileUrl, '_blank');
    // Optimistic update local stats
    setStats(prev => prev ? { ...prev, recentViews: (prev.recentViews || 0) + 1 } : prev);
  };

  const handleDownload = (noteId, fileUrl) => {
    if (!fileUrl) return alert('File URL missing.');
    axios.post('/api/history/download', { noteId }).catch(console.error);
    const link = document.createElement('a');
    link.href = fileUrl.replace('/upload/', '/upload/fl_attachment/');
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // Optimistic update
    setStats(prev => prev ? { ...prev, downloads: (prev.downloads || 0) + 1 } : prev);
    setTrending(prev => prev.map(n => n._id === noteId ? { ...n, downloadsCount: (n.downloadsCount || 0) + 1 } : n));
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note?')) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setTrending(prev => prev.filter(n => n._id !== noteId));
      setRecentNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  const handleQuickSearch = (e) => {
    e.preventDefault();
    if (quickSearch.trim()) navigate(`/notes?search=${encodeURIComponent(quickSearch.trim())}`);
  };

  const firstName = user?.name?.split(' ')[0] || 'there';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

        {/* ───────────────── HERO ───────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-700 rounded-3xl p-8 md:p-12 text-white shadow-2xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-600/30 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-5 w-5 text-yellow-300" />
              <span className="text-sm font-semibold text-indigo-200">Welcome back!</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2 leading-tight">
              Hey, {firstName} 👋
            </h1>
            <p className="text-indigo-200 text-base mb-8">
              Find, save, and master your notes — all in one place.
            </p>

            <form onSubmit={handleQuickSearch} className="flex gap-2">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search notes by title or subject…"
                  value={quickSearch}
                  onChange={e => setQuickSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white text-slate-900 placeholder-slate-400 text-sm font-medium shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                />
              </div>
              <button
                type="submit"
                className="bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30 text-white font-bold px-5 py-3 rounded-2xl text-sm transition-all hover:shadow-lg flex items-center gap-1.5"
              >
                Search <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </section>

        {/* ──────────────── YOUR OVERVIEW ────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            {stats?.isAdmin ? "Platform Overview" : "Your Overview"}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {statsLoading ? (
              Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
            ) : (
              <>
                <StatCard
                  icon={BookOpen} label="Notes Available"
                  value={stats?.totalNotes ?? 0} sub="Total on platform"
                  gradient="from-blue-500 to-indigo-600"
                />
                
                {stats?.isAdmin ? (
                  <>
                    <StatCard
                      icon={Upload} label="Total Users"
                      value={stats?.totalUsers ?? 0} sub="Registered students"
                      gradient="from-emerald-500 to-teal-600"
                    />
                    <StatCard
                      icon={Download} label="Global Downloads"
                      value={stats?.totalDownloads ?? 0} sub="Platform-wide"
                      gradient="from-orange-500 to-pink-600"
                    />
                    <StatCard
                      icon={Clock} label="Total Views"
                      value={stats?.totalViews ?? 0} sub="Lifetime engagement"
                      gradient="from-purple-500 to-violet-700"
                    />
                  </>
                ) : (
                  <>
                    <StatCard
                      icon={Upload} label="My Uploads"
                      value={stats?.myUploads ?? 0} sub="Notes you shared"
                      gradient="from-emerald-500 to-teal-600"
                    />
                    <StatCard
                      icon={Download} label="My Downloads"
                      value={stats?.downloads ?? 0} sub="PDFs you saved"
                      gradient="from-orange-500 to-pink-600"
                    />
                    <StatCard
                      icon={Clock} label="Recent Views"
                      value={stats?.recentViews ?? 0} sub="Last 7 days"
                      gradient="from-purple-500 to-violet-700"
                    />
                  </>
                )}
              </>
            )}
          </div>
        </section>

        {/* ──────────────── BROWSE BY CATEGORY ──────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-800">Browse by Category</h2>
            <Link to="/notes" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
            {CATEGORIES.map(({ label, short, emoji, color }) => (
              <button
                key={short}
                onClick={() => navigate(`/notes?branch=${encodeURIComponent(short)}`)}
                className={`group relative overflow-hidden bg-gradient-to-br ${color} rounded-2xl p-4 text-white text-left hover:shadow-xl hover:-translate-y-1 transition-all duration-300`}
              >
                <span className="text-2xl block mb-2">{emoji}</span>
                <p className="text-xs font-bold uppercase tracking-wide text-white/80">{short}</p>
                <p className="text-[10px] text-white/60 leading-snug mt-0.5 hidden sm:block">{label}</p>
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition">
                  <ArrowRight className="h-3.5 w-3.5 text-white/70" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* ──────────────── RECENTLY VIEWED ─────────────────────────────── */}
        <section className="bg-transparent py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-slate-800">Recently Viewed</h2>
            </div>
            <Link to="/history" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
              Full history <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {recentLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {Array(5).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : recentNotes.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No recent activity yet.</p>
              <p className="text-slate-400 text-sm mt-1">Start browsing notes to see them here.</p>
              <Link to="/notes" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition">
                Browse Notes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {recentNotes.map(note => (
                <div key={note._id} className="relative group">
                  <NoteCard note={note} currentUser={user} onView={handleView} onDownload={handleDownload} onDelete={handleDelete} />
                  <div className="absolute top-3 left-3 z-20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <span className="flex items-center gap-1 bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow">
                      <Eye className="h-3 w-3" /> View again
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ──────────────── TRENDING NOTES ──────────────────────────────── */}
        <section className="bg-transparent py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <h2 className="text-lg font-bold text-slate-800">Trending Notes</h2>
              <span className="text-xs bg-orange-100 text-orange-600 font-bold px-2 py-0.5 rounded-full">
                Top {trending.length}
              </span>
            </div>
            <Link to="/notes?sortBy=downloads" className="flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {trendLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {Array(6).fill(0).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          ) : trending.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center">
              <TrendingUp className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 font-semibold">No trending notes yet.</p>
              <p className="text-slate-400 text-sm mt-1">Notes will appear here as people view and download them.</p>
              <Link to="/notes" className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 bg-orange-500 text-white text-sm font-bold rounded-xl hover:bg-orange-600 transition">
                Browse Notes <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {trending.map((note, idx) => (
                <div key={note._id} className="relative">
                  <div className="absolute -top-2.5 -left-2.5 z-10 h-7 w-7 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 text-white text-xs font-extrabold flex items-center justify-center shadow-lg ring-2 ring-white">
                    #{idx + 1}
                  </div>
                  <NoteCard note={note} currentUser={user} onView={handleView} onDownload={handleDownload} onDelete={handleDelete} />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ──────────────── QUICK ACTIONS ───────────────────────────────── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
          <Link to="/notes" className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center group-hover:bg-indigo-600 transition-all duration-200 shrink-0">
              <BookOpen className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors duration-200" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Browse All Notes</p>
              <p className="text-sm text-slate-500">Search, filter, and explore the full library</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 ml-auto transition" />
          </Link>

          <Link to="/upload" className="group flex items-center gap-4 bg-white border border-slate-200 rounded-2xl p-5 hover:border-emerald-300 hover:shadow-md transition-all duration-200">
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center group-hover:bg-emerald-600 transition-all duration-200 shrink-0">
              <Upload className="h-6 w-6 text-emerald-600 group-hover:text-white transition-colors duration-200" />
            </div>
            <div>
              <p className="font-bold text-slate-800">Upload a Note</p>
              <p className="text-sm text-slate-500">Share your PDFs with the community</p>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 ml-auto transition" />
          </Link>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
