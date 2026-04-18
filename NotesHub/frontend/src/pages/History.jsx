import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Download, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

const HistoryPage = () => {
    const { user, logout } = useContext(AuthContext);
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
                <p className="mt-2 text-sm text-gray-500 font-medium">You haven't viewed or downloaded any PDFs recently.</p>
                <Link to="/notes" className="mt-4 text-sm font-bold text-blue-600 hover:underline">Go Browse Notes</Link>
              </div>
            ) : (
                <div className="bg-white shadow-sm overflow-hidden sm:rounded-xl border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                        {validHistory.map((record) => {
                            
                            const isDownload = record.action === 'download';
                            const dateObj = new Date(record.timestamp);

                            return (
                                <li key={record._id} className="hover:bg-blue-50/50 transition-colors">
                                    <div className="px-5 py-4 sm:px-6 flex items-center justify-between">
                                        <div className="flex items-center flex-1">
                                            <div className={`p-2.5 rounded-xl mr-4 border shadow-sm ${isDownload ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
                                                {isDownload ? <Download className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <p className="text-base font-bold text-gray-900">{record.noteId.title}</p>
                                                <p className="text-xs font-semibold text-gray-500 mt-1 tracking-wide uppercase">
                                                    {record.noteId.subject} • {record.noteId.branch} • Sem {record.noteId.semester}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col justify-center items-end pl-4 border-l border-gray-100 ml-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${isDownload ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                              {record.action}
                                            </span>
                                            <p className="text-xs text-gray-500 font-medium mt-1.5 whitespace-nowrap">
                                                {dateObj.toLocaleDateString()} • {dateObj.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
          </main>
        </div>
      );
}

export default HistoryPage;
