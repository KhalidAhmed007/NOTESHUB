import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { UploadCloud, FileText, ArrowLeft, CheckCircle2 } from 'lucide-react';

const UploadNote = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');
    
    // Form fields
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [branch, setBranch] = useState('CSE');
    const [semester, setSemester] = useState('1');
    const [file, setFile] = useState(null);

    const handleFileChange = (e) => {
        const selected = e.target.files[0];
        if (selected && selected.type !== "application/pdf") {
            setError("Security Error: Only strict .pdf documents are allowed!");
            setFile(null);
            return;
        }
        setError('');
        setFile(selected);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file) {
            setError('Please attach a secure PDF file before validating submission.');
            return;
        }

        const formData = new FormData();
        formData.append('title', title);
        formData.append('subject', subject);
        formData.append('branch', branch);
        formData.append('semester', semester);
        formData.append('file', file); // Multer natively intercepts this key remotely

        try {
            setLoading(true);
            setError('');
            await axios.post('/api/notes/upload', formData);
            setSuccess(true);
            
            // Clean up state
            setTitle('');
            setSubject('');
            setFile(null);

            setTimeout(() => {
                navigate('/');
            }, 2000);

        } catch(err) {
            console.error(err);
            setError(err.response?.data?.error || "Error executing secure file upload constraints.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <span className="ml-2 text-2xl font-bold text-gray-900">NotesHub</span>
                    </div>
                    <div className="flex items-center">
                    <Link to="/" className="text-gray-600 hover:text-blue-600 font-medium flex items-center transition">
                        <ArrowLeft className="h-5 w-5 mr-1" /> Return to Feed
                    </Link>
                    </div>
                </div>
                </div>
            </nav>

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-8 border-b border-gray-100 bg-gray-50/50 flex flex-col items-center text-center">
                        <div className="p-3 bg-blue-100 rounded-full mb-4 shadow-sm border border-blue-200">
                          <UploadCloud className="h-10 w-10 text-blue-600" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Upload Course Material</h2>
                        <p className="text-sm text-gray-500 mt-2 font-medium">Contribute to the KITSW community horizontally across branches.</p>
                    </div>

                    <div className="p-10">
                        {success && (
                            <div className="mb-8 bg-green-50 border border-green-200 text-green-700 px-5 py-4 rounded-xl flex items-center shadow-sm">
                                <CheckCircle2 className="h-6 w-6 mr-3" />
                                <span className="font-bold text-sm">Document uploaded securely! Indexing and redirecting you to feed shortly...</span>
                            </div>
                        )}

                        {error && (
                            <div className="mb-8 bg-red-50 border border-red-200 text-red-600 px-5 py-4 rounded-xl flex items-center shadow-sm">
                                <span className="font-bold text-sm">{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">Subject Title</label>
                                    <input 
                                        type="text" required
                                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        placeholder="e.g. Unit 1 Machine Learning Complete Details"
                                        value={title} onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">Course Name</label>
                                    <input 
                                        type="text" required
                                        className="block w-full border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
                                        placeholder="e.g. Artificial Intelligence"
                                        value={subject} onChange={(e) => setSubject(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">Branch Classification</label>
                                    <select 
                                        className="block w-full bg-white border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
                                        value={branch} onChange={(e) => setBranch(e.target.value)}
                                    >
                                        <option value="CSE">Computer Science (CSE)</option>
                                        <option value="ECE">Electronics (ECE)</option>
                                        <option value="EEE">Electrical (EEE)</option>
                                        <option value="MECH">Mechanical (MECH)</option>
                                        <option value="CIVIL">Civil (CIVIL)</option>
                                        <option value="IT">Info Tech (IT)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-2">Semester</label>
                                    <select 
                                        className="block w-full bg-white border border-gray-300 rounded-xl shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base font-medium"
                                        value={semester} onChange={(e) => setSemester(e.target.value)}
                                    >
                                        {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <label className="block text-sm font-extrabold text-gray-700 uppercase tracking-wider mb-4">Attach Primary PDF Payload</label>
                                <div className="flex justify-center px-6 pt-8 pb-8 border-2 border-dashed border-blue-200 bg-blue-50/30 rounded-2xl hover:bg-blue-50/60 transition-colors shadow-inner">
                                    <div className="space-y-2 text-center">
                                        <div className="flex justify-center mb-4">
                                            <div className="bg-white p-4 rounded-full shadow-sm border border-gray-100">
                                              <FileText className="h-10 w-10 text-gray-400" />
                                            </div>
                                        </div>
                                        <div className="flex text-base text-gray-600 justify-center font-medium">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-bold text-blue-600 hover:text-blue-500 focus-within:outline-none">
                                                <span>Click here to select a file locally</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" onChange={handleFileChange} required />
                                            </label>
                                        </div>
                                        {file ? (
                                            <p className="text-sm text-green-600 font-extrabold tracking-wide mt-3 bg-green-100 py-1 px-3 rounded-full inline-block border border-green-200 shadow-sm">{file.name}</p>
                                        ) : (
                                            <p className="text-sm text-gray-500 font-medium mt-2">Maximum limit: strictly 10MB PDF documents</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6">
                                <button 
                                    type="submit" 
                                    disabled={loading || success}
                                    className={`w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-md text-base font-extrabold text-white uppercase tracking-wider transition-all ${loading || success ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-blue-200'}`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                                            Transmitting Byte-Stream to Cloud...
                                        </>
                                    ) : 'Submit and Index Resource'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UploadNote;
