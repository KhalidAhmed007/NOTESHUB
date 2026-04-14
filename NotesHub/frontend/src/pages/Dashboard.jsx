import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Search, Filter, Clock, Menu, X, BookOpen, Shield } from 'lucide-react';
import Logo from '../components/Logo';
import NoteCard from '../components/NoteCard';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [branch,   setBranch]   = useState('All');
  const [semester, setSemester] = useState('All');
  const [menuOpen, setMenuOpen] = useState(false);

  // ── Fetch notes with debounce ──────────────────────────────────────────────
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (branch   !== 'All') params.branch   = branch;
      if (semester !== 'All') params.semester  = semester;
      const res = await axios.get('/api/notes', { params });
      setNotes(res.data);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchNotes, 350);
    return () => clearTimeout(delay);
  }, [search, branch, semester]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleView = (noteId, fileUrl) => {
    if (!fileUrl) return alert('File URL missing.');
    axios.post('/api/history/view', { noteId }).catch(console.error);
    window.open(fileUrl, '_blank');
  };

  const handleDownload = (noteId, fileUrl) => {
    if (!fileUrl) return alert('File URL missing.');
    axios.post('/api/history/download', { noteId }).catch(console.error);
    const downloadUrl = fileUrl.replace('/upload/', '/upload/fl_attachment/');
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setNotes(prev => prev.map(n => n._id === noteId ? { ...n, downloadsCount: n.downloadsCount + 1 } : n));
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note?')) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  const clearFilters = () => { setSearch(''); setBranch('All'); setSemester('All'); };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Logo size="md" />

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-5">
              <Link
                to="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all duration-200"
              >
                + Upload PDF
              </Link>
              <Link to="/history" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition">
                <Clock className="h-4 w-4" /> Activity
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" className="flex items-center gap-1.5 text-xs font-bold bg-red-100 text-red-700 px-3 py-1.5 rounded-full hover:bg-red-200 transition">
                  <Shield className="h-3.5 w-3.5" /> Admin
                </Link>
              )}
              <div className="border-l border-gray-200 h-5" />
              <span className="text-sm font-semibold text-gray-700">{user?.name}</span>
              <button
                onClick={logout}
                className="text-sm font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition"
              >
                Logout
              </button>
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          {menuOpen && (
            <div className="md:hidden pb-4 pt-2 border-t border-gray-100 flex flex-col gap-3 animate-fadeIn">
              <span className="text-sm font-semibold text-gray-700 px-1">Hi, {user?.name}</span>
              <Link to="/upload" onClick={() => setMenuOpen(false)} className="w-full text-center bg-blue-600 text-white py-2.5 rounded-xl text-sm font-bold">+ Upload PDF</Link>
              <Link to="/history" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 px-1">
                <Clock className="h-4 w-4" /> Activity
              </Link>
              {user?.role === 'admin' && (
                <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-xs font-bold text-red-700 px-1">
                  <Shield className="h-3.5 w-3.5" /> Admin Panel
                </Link>
              )}
              <button onClick={logout} className="text-sm font-bold text-red-500 text-left px-1">Logout</button>
            </div>
          )}
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">

        {/* Controls: Search + Filters */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 py-3 md:px-5 md:py-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
          
          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="Search by title or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm">
              <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0" />
              <select
                className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="All">All Branches</option>
                {['CSE','ECE','EEE','MECH','CIVIL','IT'].map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            <div className="flex items-center border border-gray-200 rounded-xl px-3 py-1.5 bg-white shadow-sm">
              <select
                className="text-sm text-gray-700 bg-transparent focus:outline-none cursor-pointer"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
              >
                <option value="All">All Sems</option>
                {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>

            {(search || branch !== 'All' || semester !== 'All') && (
              <button onClick={clearFilters} className="text-xs font-semibold text-gray-500 hover:text-red-500 transition px-2 py-1">
                Clear ×
              </button>
            )}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <BookOpen className="h-14 w-14 text-gray-300 mb-4" />
            <h3 className="text-lg font-bold text-gray-700">No notes found</h3>
            <p className="text-sm text-gray-400 mt-1 text-center px-6">
              Try adjusting your filters or upload the first note!
            </p>
            <button
              onClick={clearFilters}
              className="mt-4 px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {notes.map(note => (
              <NoteCard
                key={note._id}
                note={note}
                currentUser={user}
                onView={handleView}
                onDownload={handleDownload}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
