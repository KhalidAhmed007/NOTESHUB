import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { FileText, Download, Eye, AlertCircle, ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import ShareModal from '../components/ShareModal';
import Footer from '../components/Footer';

const PublicNote = () => {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isShareOpen, setIsShareOpen] = useState(false);

  useEffect(() => {
    const fetchPublicNote = async () => {
      try {
        const res = await axios.get(`/api/notes/public/${id}`);
        const fetchedNote = res.data;
        setNote(fetchedNote);

        // SEO and Link Preview Dynamic Injection
        // Update document title
        document.title = `${fetchedNote.title} - NotesHub`;
        
        // Helper to update or create meta tags
        const setMetaTag = (attr, key, value) => {
          let el = document.querySelector(`meta[${attr}="${key}"]`);
          if (!el) {
            el = document.createElement('meta');
            el.setAttribute(attr, key);
            document.head.appendChild(el);
          }
          el.setAttribute('content', value);
        };

        const previewText = `📝 Subject: ${fetchedNote.subject} | 🎓 ${fetchedNote.branch} - Sem ${fetchedNote.semester}`;
        
        // Open Graph Meta Tags
        setMetaTag('property', 'og:title', fetchedNote.title);
        setMetaTag('property', 'og:description', previewText);
        setMetaTag('property', 'og:url', window.location.href);
        setMetaTag('property', 'og:type', 'website');
        // Setting a polished default generic thumbnail or the fileUrl (often a raw PDF though, so generic image is safer for OG)
        setMetaTag('property', 'og:image', `${window.location.origin}/logo.png`);

        // Standard Meta Description
        setMetaTag('name', 'description', previewText);

      } catch (err) {
        setError(err.response?.data?.error || 'Note not found or unavailable.');
      } finally {
        setLoading(false);
      }
    };
    fetchPublicNote();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </div>
    );
  }

  if (error || !note) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex justify-center items-center p-4">
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-8 max-w-sm w-full text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Note Unavailable</h2>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Link to="/notes" className="inline-flex items-center justify-center w-full py-2.5 rounded-xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition">
              <ArrowLeft className="h-4 w-4 mr-2" /> Go to Browse Notes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-10">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/notes" className="inline-flex items-center text-sm font-bold text-indigo-600 hover:text-indigo-700">
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Notes
          </Link>
          <button 
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Share2 className="h-4 w-4 mr-1.5" /> Share Note
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                {note.branch}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500">
                Semester {note.semester}
              </span>
            </div>

            <h1 className="text-3xl font-black text-gray-900 leading-tight mb-2">
              {note.title}
            </h1>
            <p className="text-lg font-medium text-gray-500 mb-8">
              {note.subject}
            </p>

            <div className="flex items-center justify-between text-sm text-gray-400 py-4 border-y border-gray-100 mb-8">
              <span className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-gray-300" />
                Uploaded by <span className="font-semibold text-gray-700">{note.uploadedBy?.name || 'Unknown'}</span>
              </span>
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={note.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold border-2 border-indigo-600 text-indigo-700 bg-indigo-50/50 hover:bg-indigo-100 transition-colors"
              >
                <Eye className="h-5 w-5" /> Preview PDF
              </a>
              <a 
                href={note.fileUrl} 
                download
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <Download className="h-5 w-5" /> Download PDF
              </a>
            </div>
          </div>
        </div>
      </main>

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        note={note}
      />
      <Footer />
    </div>
  );
};

export default PublicNote;
