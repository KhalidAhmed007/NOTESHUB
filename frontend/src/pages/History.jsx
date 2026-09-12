import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Download, Eye, Flag } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const actionConfig = {
    view:     { icon: Eye,      bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100',  badge: 'bg-green-100 text-green-800',  label: 'Viewed' },
    download: { icon: Download, bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100',   badge: 'bg-blue-100 text-blue-800',    label: 'Downloaded' },
    report:   { icon: Flag,     bg: 'bg-red-50',    text: 'text-red-500',    border: 'border-red-100',    badge: 'bg-red-100 text-red-700',      label: 'Reported' },
};

const HistoryPage = () => {
    const { user } = useContext(AuthContext);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const res = await axios.get('/api/history/user');
                setHistory(res.data);
            } catch(err) {
                console.error("Error fetching history:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    const validHistory = history.filter(record => record.noteId);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex flex-col">
          <Navbar />

          <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-6 flex items-center">
                <Clock className="h-7 w-7 text-blue-600 mr-2" />
                <h2 className="text-2xl font-bold text-gray-900">Your Activity History</h2>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : validHistory.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm h-64 flex flex-col justify-center items-center">
                <Clock className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-800">No activity logged</h3>
                <p className="mt-2 text-sm text-gray-500 font-medium">You haven't viewed, downloaded, or reported any PDFs yet.</p>
                <Link to="/notes" className="mt-4 text-sm font-bold text-blue-600 hover:underline">Go Browse Notes</Link>
              </div>
            ) : (
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                        {validHistory.map((record) => {
                            const cfg = actionConfig[record.action] || actionConfig.view;
                            const Icon = cfg.icon;
                            const dateObj = new Date(record.timestamp);

                            return (
                                <li key={record._id} className="hover:bg-slate-50/50 transition-colors">
                                    <div className="px-5 py-4 sm:px-6 flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <div className={`p-2.5 rounded-xl mr-4 border shadow-sm ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                                                <Icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">{record.noteId.title}</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-1 tracking-wide uppercase">
                                                    {record.noteId.subject} • {record.noteId.branch} • Sem {record.noteId.semester}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center items-end pl-4 border-l border-gray-100 ml-4">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badge}`}>
                                              <Icon className="h-3 w-3" /> {cfg.label}
                                            </span>
                                            <p className="text-xs text-gray-500 font-medium mt-1.5 whitespace-nowrap">
                                                {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
          </main>
        </div>
      );
};

export default HistoryPage;
