import React, { useContext, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Logo from '../components/Logo';
import {
  Database, Users, FileText, Download, AlertTriangle,
  RefreshCw, Trash2, LogOut, LayoutDashboard, CheckCircle
} from 'lucide-react';

const TOTAL_MB = 512;
const REFRESH_INTERVAL_MS = 3 * 60 * 1000; // auto-refresh every 3 minutes

// ─── Storage Progress Bar ────────────────────────────────────────────────────
const StorageBar = ({ usedMB, totalMB, percentage }) => {
  const color =
    percentage > 90 ? 'bg-red-500' :
    percentage > 70 ? 'bg-yellow-400' :
    'bg-emerald-500';

  const labelColor =
    percentage > 90 ? 'text-red-600' :
    percentage > 70 ? 'text-yellow-600' :
    'text-emerald-600';

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm font-semibold">
        <span className="text-gray-700">{usedMB} MB used</span>
        <span className={labelColor}>{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
        <div
          className={`${color} h-4 rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0 MB</span>
        <span>{totalMB} MB (Atlas Free Tier)</span>
      </div>
    </div>
  );
};

// ─── Stat Card ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center gap-4">
    <div className={`p-3 rounded-xl ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-gray-900">{value ?? '—'}</p>
    </div>
  </div>
);

// ─── Main Admin Dashboard ─────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);

  const [storage, setStorage] = useState(null);
  const [stats, setStats]     = useState(null);
  const [notes, setNotes]     = useState([]);
  const [loadingStorage, setLoadingStorage] = useState(true);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingNotes, setLoadingNotes]     = useState(true);
  const [storageError, setStorageError]     = useState('');
  const [warningDismissed, setWarningDismissed] = useState(false);
  const [lastRefresh, setLastRefresh]           = useState(new Date());

  // ── fetch storage stats ──────────────────────────────────────────────────
  const fetchStorage = useCallback(async () => {
    setLoadingStorage(true);
    setStorageError('');
    try {
      const { data } = await axios.get('/api/admin/storage');
      setStorage(data);
      setLastRefresh(new Date());
      // Trigger popup only once per session (unless dismissed already)
      if (data.warning) setWarningDismissed(false);
    } catch (err) {
      setStorageError(err.response?.data?.error || 'Failed to load storage stats.');
    } finally {
      setLoadingStorage(false);
    }
  }, []);

  // ── fetch app stats ──────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const { data } = await axios.get('/api/admin/stats');
      setStats(data);
    } catch {
      /* silent */
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── fetch all notes ──────────────────────────────────────────────────────
  const fetchNotes = useCallback(async () => {
    setLoadingNotes(true);
    try {
      const { data } = await axios.get('/api/admin/notes');
      setNotes(data);
    } catch {
      /* silent */
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  // ── Delete a note (admin power) ──────────────────────────────────────────
  const handleDelete = async (noteId) => {
    if (!window.confirm('Permanently delete this note and its file from Cloudinary?')) return;
    try {
      await axios.delete(`/api/notes/${noteId}`);
      setNotes(prev => prev.filter(n => n._id !== noteId));
      fetchStorage(); // refresh storage after deletion
    } catch (err) {
      alert(err.response?.data?.error || 'Delete failed.');
    }
  };

  useEffect(() => {
    fetchStorage();
    fetchStats();
    fetchNotes();
    const interval = setInterval(fetchStorage, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [fetchStorage, fetchStats, fetchNotes]);

  const isWarning = storage?.warning && !warningDismissed;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Storage Warning Popup ── */}
      {isWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-fadeIn text-center border border-red-200">
            <div className="flex justify-center mb-4">
              <div className="bg-red-100 p-4 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-2">Storage Warning</h2>
            <p className="text-gray-600 text-sm mb-1">
              Database storage has reached <span className="font-bold text-red-600">{storage.usedMB} MB</span> — approaching the 512 MB free tier limit.
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Please delete unused notes or old files to free up space.
            </p>
            <div className="mb-6">
              <StorageBar usedMB={storage.usedMB} totalMB={storage.totalMB} percentage={storage.percentage} />
            </div>
            <button
              onClick={() => setWarningDismissed(true)}
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition"
            >
              Understood — Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Navbar ── */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="md" />
            <span className="hidden sm:inline-block text-xs font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Admin</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-blue-600 transition">
              <LayoutDashboard className="h-4 w-4" /> Student View
            </Link>
            <button onClick={logout} className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-600 text-sm font-bold rounded-lg hover:bg-red-100 transition">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <button
            onClick={() => { fetchStorage(); fetchStats(); fetchNotes(); }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 shadow-sm transition"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <StatCard icon={FileText} label="Total Notes" value={loadingStats ? '...' : stats?.notes} color="bg-blue-500" />
          <StatCard icon={Users}    label="Registered Users" value={loadingStats ? '...' : stats?.users} color="bg-indigo-500" />
          <StatCard icon={Download} label="Total Downloads" value={loadingStats ? '...' : stats?.downloads} color="bg-emerald-500" />
        </div>

        {/* ── Storage Card ── */}
        <div className={`bg-white rounded-2xl border shadow-sm p-6 space-y-5 ${storage?.warning ? 'border-red-300' : 'border-gray-200'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${storage?.warning ? 'bg-red-100' : 'bg-blue-50'}`}>
                <Database className={`h-5 w-5 ${storage?.warning ? 'text-red-600' : 'text-blue-600'}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">MongoDB Atlas Storage</h2>
                <p className="text-xs text-gray-400">Auto-refreshes every 3 minutes · Last: {lastRefresh.toLocaleTimeString()}</p>
              </div>
            </div>
            {storage && !storage.warning && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                <CheckCircle className="h-3.5 w-3.5" /> Healthy
              </span>
            )}
            {storage?.warning && (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full animate-pulse">
                <AlertTriangle className="h-3.5 w-3.5" /> Critical
              </span>
            )}
          </div>

          {loadingStorage ? (
            <div className="h-16 flex items-center justify-center">
              <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : storageError ? (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg">{storageError}</div>
          ) : storage ? (
            <StorageBar usedMB={storage.usedMB} totalMB={storage.totalMB} percentage={storage.percentage} />
          ) : null}

          {storage?.warning && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              <p className="font-bold mb-1">⚠ Storage almost full ({storage.usedMB} MB / {storage.totalMB} MB)</p>
              <ul className="list-disc list-inside space-y-1 text-red-600">
                <li>Delete unused or duplicate notes from the table below</li>
                <li>Remove test/dummy files</li>
                <li>Consider upgrading to MongoDB Atlas M10+ cluster</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Notes Management Table ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">All Notes</h2>
            <span className="text-sm text-gray-500">{notes.length} total</span>
          </div>

          {loadingNotes ? (
            <div className="h-40 flex items-center justify-center">
              <div className="h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : notes.length === 0 ? (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No notes found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500 uppercase font-semibold">
                  <tr>
                    <th className="px-6 py-3 text-left">Title</th>
                    <th className="px-6 py-3 text-left">Subject</th>
                    <th className="px-6 py-3 text-left">Branch</th>
                    <th className="px-6 py-3 text-left">Sem</th>
                    <th className="px-6 py-3 text-left">Uploaded By</th>
                    <th className="px-6 py-3 text-left">DLs</th>
                    <th className="px-6 py-3 text-left">Date</th>
                    <th className="px-6 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {notes.map(note => (
                    <tr key={note._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-3 font-medium text-gray-900 max-w-[200px] truncate">{note.title}</td>
                      <td className="px-6 py-3 text-gray-600">{note.subject}</td>
                      <td className="px-6 py-3">
                        <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{note.branch}</span>
                      </td>
                      <td className="px-6 py-3 text-gray-600">S{note.semester}</td>
                      <td className="px-6 py-3 text-gray-600 max-w-[140px] truncate">{note.uploadedBy?.name || 'Unknown'}</td>
                      <td className="px-6 py-3 text-gray-500">{note.downloadsCount}</td>
                      <td className="px-6 py-3 text-gray-400 whitespace-nowrap">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-3 text-center">
                        <button
                          onClick={() => handleDelete(note._id)}
                          className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition"
                          title="Delete note"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
