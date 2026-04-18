import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, Share2, FileText } from 'lucide-react';
import axios from 'axios';
import RatingStars from './RatingStars';
import ShareModal from './ShareModal';

const getPlaceholderGradient = (subject) => {
  const gradients = [
    'from-emerald-400 to-teal-500',
    'from-indigo-400 to-purple-500',
    'from-blue-400 to-cyan-500',
    'from-orange-400 to-red-500',
    'from-pink-400 to-rose-500',
    'from-violet-400 to-fuchsia-500'
  ];
  let sum = 0;
  for(let i = 0; i < (subject?.length || 0); i++){
     sum += subject.charCodeAt(i);
  }
  return gradients[sum % gradients.length];
};

/**
 * NoteCard — reusable note card component.
 *
 * Props:
 *  note          — note object from API
 *  currentUser   — user object from AuthContext
 *  onView        — fn(noteId, fileUrl)
 *  onDownload    — fn(noteId, fileUrl)
 *  onDelete      — fn(noteId)
 */
const NoteCard = ({ note, currentUser, onView, onDownload, onDelete }) => {
  const isOwner = currentUser && note.uploadedBy?._id === currentUser.id;
  const isAdmin = currentUser?.role === 'admin';
  const canDelete = isOwner || isAdmin;

  const [userRating, setUserRating] = useState(null);
  const [ratingAvg,  setRatingAvg]  = useState(note.rating?.average || 0);
  const [ratingCnt,  setRatingCnt]  = useState(note.rating?.count   || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    axios.get(`/api/ratings/${note._id}`)
      .then(({ data }) => {
        if (!cancelled) {
          setUserRating(data.userRating ?? null);
          setRatingAvg(data.average  ?? 0);
          setRatingCnt(data.count    ?? 0);
        }
      })
      .catch(() => {/* silent */});
    return () => { cancelled = true; };
  }, [note._id]);

  const isTrending = (note.downloadsCount || 0) > 20 || (note.viewsCount || 0) > 50;
  const isTopRated = ratingAvg >= 4.5 && ratingCnt > 0;
  const isNew = note.createdAt && new Date() - new Date(note.createdAt) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div className="group flex flex-col bg-[#ffffff] rounded-2xl shadow-[0_10px_25px_rgba(0,0,0,0.08),0_4px_10px_rgba(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_40px_rgba(0,0,0,0.12),0_8px_16px_rgba(0,0,0,0.06)] hover:-translate-y-[6px] transition-all duration-300 ease-out relative">
      
      {/* Visual Preview */}
      <div className="relative h-40 w-full overflow-hidden bg-slate-100 shrink-0 border-b border-[#f1f5f9] rounded-t-2xl">
        {note.thumbnailUrl && !imgError ? (
          <img 
            src={note.thumbnailUrl} 
            alt="PDF preview" 
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover rounded-t-2xl group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${getPlaceholderGradient(note.subject)} group-hover:scale-105 transition-transform duration-500`}>
            <FileText className="w-12 h-12 text-white opacity-40 mix-blend-overlay" />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {isTrending && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              🔥 Trending
            </span>
          )}
          {isTopRated && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-yellow-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              ⭐ Top Rated
            </span>
          )}
          {isNew && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm text-emerald-600 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
              🆕 New
            </span>
          )}
        </div>

        {/* Share Button Floating */}
        <button onClick={() => setIsShareOpen(true)} className="absolute top-3 right-3 p-2 bg-white/40 hover:bg-white/80 backdrop-blur-md text-slate-700 rounded-full transition-all duration-200 shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100 z-10">
          <Share2 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-5 gap-3">
        {/* Branch & Semester */}
        <div className="flex items-center justify-between">
          <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold tracking-wide uppercase rounded-full block w-fit">
            {note.branch}
          </span>
          <span className="text-xs font-bold tracking-wide uppercase text-[#6b7280] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
            Sem {note.semester}
          </span>
        </div>

        {/* Title & Subject */}
        <div>
          <h3 className="text-[17px] font-[600] text-[#0f172a] leading-tight line-clamp-2">
            {note.title}
          </h3>
          <p className="text-[13px] font-medium text-[#64748b] mt-1 line-clamp-1">
            {note.subject}
          </p>
        </div>

        {/* Rating */}
        <div className="flex items-center mt-1">
          <div className="[&>div>span]:hidden flex items-center gap-2">
            <RatingStars
              noteId={note._id}
              average={ratingAvg}
              count={ratingCnt}
              userRating={userRating}
              onRated={(avg, cnt, ur) => {
                setRatingAvg(avg);
                setRatingCnt(cnt);
                setUserRating(ur);
              }}
            />
            <span className="text-sm font-medium whitespace-nowrap text-slate-600 ml-1">
              {ratingCnt > 0 ? (
                <span className="flex items-center gap-1">
                 ⭐ <span className="font-bold text-slate-800">{ratingAvg.toFixed(1)}</span> <span className="text-slate-400">({ratingCnt})</span>
                </span>
              ) : (
                <span className="italic text-slate-400 text-xs px-1">Be the first to rate</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex-1" />

        {/* Metadata Row */}
        <div className="flex items-center justify-between text-sm text-slate-500 pt-3 border-t border-slate-100 mt-2">
          <span className="truncate max-w-[40%] font-medium" title={note.uploadedBy?.name || 'Unknown'}>
            {note.uploadedBy?.name?.split(' ')[0] || 'Unknown'}
          </span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5" title="Views">
              <Eye className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{note.viewsCount ?? 0}</span>
            </span>
            <span className="flex items-center gap-1.5" title="Downloads">
              <Download className="w-4 h-4 text-slate-400" />
              <span className="font-medium">{note.downloadsCount ?? 0}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 pb-5 flex items-center gap-3">
        <button
          onClick={() => onView(note._id, note.fileUrl)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-[10px] text-white bg-gradient-to-br from-[#6d28d9] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#8b5cf6] shadow-[0_4px_10px_rgba(124,58,237,0.3)] hover:scale-[1.03] transition-all duration-200 focus:outline-none"
        >
          <Eye className="w-4 h-4" /> View
        </button>
        <button
          onClick={() => onDownload(note._id, note.fileUrl)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-[10px] text-[#374151] bg-[#f1f5f9] hover:bg-[#e2e8f0] transition-all duration-200 focus:outline-none"
        >
          <Download className="w-4 h-4" /> Save
        </button>

        {canDelete && (
          <button
             onClick={() => onDelete(note._id)}
             className="flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100"
             title={isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete'}
          >
             <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      <ShareModal 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        note={note}
      />
    </div>
  );
};

export default NoteCard;
