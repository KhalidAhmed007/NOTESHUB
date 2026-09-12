import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Mail, MessageCircle, Send, CheckCircle2 } from 'lucide-react';

const ShareModal = ({ isOpen, onClose, note }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !note) return null;

  // The public URL that users will visit
  const publicUrl = `${window.location.origin}/notes/${note._id}`;
  
  // Note details
  const title = note.title;
  const preview = `Check out this note on NotesHub:\n\n📌 Title: ${title}\n📚 Subject: ${note.subject}\n🎓 Branch: ${note.branch} - Sem ${note.semester}\n\n🔗 Link: ${publicUrl}`;

  const encodedText = encodeURIComponent(preview);
  const encodedTitle = encodeURIComponent(title);
  const encodedUrl = encodeURIComponent(publicUrl);

  const shareLinks = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
    gmail: `mailto:?subject=${encodedTitle}&body=${encodedText}`
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Share Note</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {/* WhatsApp */}
            <a 
              href={shareLinks.whatsapp} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-green-50 text-gray-600 hover:text-green-600 transition-colors group"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="text-xs font-semibold">WhatsApp</span>
            </a>

            {/* Telegram */}
            <a 
              href={shareLinks.telegram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-blue-50 text-gray-600 hover:text-blue-500 transition-colors group"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors">
                <Send className="h-5 w-5 text-blue-500" />
              </div>
              <span className="text-xs font-semibold">Telegram</span>
            </a>

            {/* Gmail */}
            <a 
              href={shareLinks.gmail} 
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-red-50 text-gray-600 hover:text-red-500 transition-colors group"
            >
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-100 group-hover:bg-red-200 transition-colors">
                <Mail className="h-5 w-5 text-red-500" />
              </div>
              <span className="text-xs font-semibold">Gmail</span>
            </a>
          </div>

          <div className="pt-2">
            <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Page Link</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-500 truncate select-all">
                {publicUrl}
              </div>
              <button 
                onClick={handleCopyLink}
                className="flex items-center justify-center h-10 px-4 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-sm transition-colors border border-indigo-100 shrink-0"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 font-semibold mt-2 text-center animate-pulse">Link copied successfully!</p>}
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ShareModal;
