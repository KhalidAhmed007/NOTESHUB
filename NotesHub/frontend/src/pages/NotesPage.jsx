import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import {
  Search, Filter, BookOpen, SlidersHorizontal,
  ArrowUpDown, Star, Eye, Download, Clock, X,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import NoteCard from '../components/NoteCard';

// ── Constants ─────────────────────────────────────────────────────────────────
const BRANCHES  = ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'AI/ML'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const SORT_OPTIONS = [
  { value: 'latest',    label: 'Latest',        icon: Clock    },
  { value: 'downloads', label: 'Most Downloaded', icon: Download },
  { value: 'views',     label: 'Most Viewed',   icon: Eye      },
  { value: 'rating',    label: 'Highest Rated', icon: Star     },
];

// ── Skeleton card ─────────────────────────────────────────────────────────────
const CardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-slate-100 p-4 animate-pulse space-y-3 h-52">
    <div className="flex justify-between">
      <div className="h-5 w-14 bg-slate-200 rounded-full" />
      <div className="h-5 w-10 bg-slate-100 rounded-full" />
    </div>
    <div className="h-4 bg-slate-200 rounded-full w-3/4" />
    <div className="h-3 bg-slate-100 rounded-full w-1/2" />
    <div className="flex-1" />
    <div className="h-8 bg-slate-100 rounded-xl" />
  </div>
);

// ── Main Notes Page ───────────────────────────────────────────────────────────
const NotesPage = () => {
  const { user } = useContext(AuthContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State initialised from URL params (deep-link friendly)
  const [search,   setSearch]   = useState(searchParams.get('search')  || '');
  const [branch,   setBranch]   = useState(searchParams.get('branch')  || 'All');
  const [semester, setSemester] = useState(searchParams.get('semester')|| 'All');
  const [sortBy,   setSortBy]   = useState(searchParams.get('sortBy')  || 'latest');
  const [notes,    setNotes]    = useState([]);
  const [loading,  setLoading]  = useState(true);

  // ── Pagination ────────────────────────────────────────────────────────────
  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);
  const totalPages  = Math.ceil(notes.length / PAGE_SIZE);
  const pagedNotes  = notes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // ── Sync URL params when filter state changes ─────────────────────────────
  useEffect(() => {
    const params = {};
    if (search)           params.search   = search;
    if (branch !== 'All') params.branch   = branch;
    if (semester !== 'All') params.semester = semester;
    if (sortBy !== 'latest') params.sortBy = sortBy;
    setSearchParams(params, { replace: true });
    setPage(1); // reset to first page on any filter change
  }, [search, branch, semester, sortBy]);

  // ── Fetch with debounce ───────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      const params = { sortBy };
      if (search)             params.search   = search;
      if (branch !== 'All')   params.branch   = branch;
      if (semester !== 'All') params.semester = semester;
      const res = await axios.get('/api/notes', { params });
      setNotes(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('[Notes Fetch]', err);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  }, [search, branch, semester, sortBy]);

  useEffect(() => {
    const timer = setTimeout(fetchNotes, 300);
    return () => clearTimeout(timer);
  }, [fetchNotes]);

  // ── Note action handlers ──────────────────────────────────────────────────
  const handleView = (noteId, fileUrl) => {
    if (!fileUrl) return alert('File URL missing.');
    axios.post('/api/history/view', { noteId }).catch(console.error);
    window.open(fileUrl, '_blank');
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
    setNotes(prev => prev.map(n =>
      n._id === noteId ? { ...n, downloadsCount: (n.downloadsCount || 0) + 1 } : n
    ));
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

  const clearFilters = () => {
    setSearch(''); setBranch('All'); setSemester('All'); setSortBy('latest');
    setPage(1);
  };

  const hasFilters = search || branch !== 'All' || semester !== 'All' || sortBy !== 'latest';
  const activeSortLabel = SORT_OPTIONS.find(o => o.value === sortBy)?.label || 'Latest';

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <h1 className="text-2xl font-extrabold text-slate-900">Browse Notes</h1>
            {!loading && (
              <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full ml-1">
                {notes.length}
              </span>
            )}
          </div>
          <p className="text-slate-500 text-sm">
            {loading
              ? 'Searching…'
              : `${notes.length} note${notes.length !== 1 ? 's' : ''} found`
                + (totalPages > 1 ? ` • Page ${page} of ${totalPages}` : '')}
            {hasFilters && !loading && ' · Filters active'}
          </p>
        </div>

        {/* ── Controls Bar ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-4 mb-8 space-y-3">

          {/* Row 1: Search */}
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
              <input
                id="notes-search"
                type="text"
                className="w-full pl-11 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-slate-50 hover:bg-white transition-all"
                placeholder="Search by title or course name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Row 2: Filters + Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
              <SlidersHorizontal className="h-3.5 w-3.5" /> Filters:
            </div>

            {/* Branch */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 hover:bg-white transition">
              <Filter className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <select
                id="branch-filter"
                className="text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer font-medium"
                value={branch}
                onChange={e => setBranch(e.target.value)}
              >
                <option value="All">All Branches</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>

            {/* Semester */}
            <div className="flex items-center gap-1.5 border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 hover:bg-white transition">
              <select
                id="semester-filter"
                className="text-sm text-slate-700 bg-transparent focus:outline-none cursor-pointer font-medium"
                value={semester}
                onChange={e => setSemester(e.target.value)}
              >
                <option value="All">All Sems</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
              </select>
            </div>

            {/* Divider */}
            <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Sort */}
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wide shrink-0">
              <ArrowUpDown className="h-3.5 w-3.5" /> Sort:
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSortBy(value)}
                  className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all duration-150
                    ${sortBy === value
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                >
                  <Icon className="h-3 w-3" /> {label}
                </button>
              ))}
            </div>

            {/* Clear all */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs font-bold text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 rounded-xl px-3 py-1.5 transition-all ml-auto"
              >
                <X className="h-3 w-3" /> Clear all
              </button>
            )}
          </div>
        </div>

        {/* ── Notes Grid ──────────────────────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
            {Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-72 bg-white rounded-2xl border-2 border-dashed border-slate-200">
            <BookOpen className="h-14 w-14 text-slate-200 mb-4" />
            <h3 className="text-lg font-bold text-slate-600">No notes found</h3>
            <p className="text-sm text-slate-400 mt-1 text-center px-6 max-w-xs">
              {hasFilters
                ? `No notes match "${search || activeSortLabel}" with these filters. Try adjusting them.`
                : 'Be the first to upload a note!'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 px-4 py-2 border border-slate-300 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
              {pagedNotes.map(note => (
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

            {/* ── Pagination controls ──────────────────────────────────── */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8 pb-4">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`h-9 w-9 rounded-xl text-sm font-bold transition-all ${
                        p === page
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default NotesPage;
