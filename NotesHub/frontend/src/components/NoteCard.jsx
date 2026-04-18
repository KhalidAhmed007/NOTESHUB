import React, { useState, useEffect } from 'react';
import { Eye, Download, Trash2, Share2 } from 'lucide-react';
import axios from 'axios';
import RatingStars from './RatingStars';
import ShareModal from './ShareModal';

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

  // Fetch this user's saved rating for this note
  const [userRating, setUserRating] = useState(null);
  const [ratingAvg,  setRatingAvg]  = useState(note.rating?.average || 0);
  const [ratingCnt,  setRatingCnt]  = useState(note.rating?.count   || 0);
  const [isShareOpen, setIsShareOpen] = useState(false);

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
      .catch(() => {/* silent — shows defaults */});
    return () => { cancelled = true; };
  }, [note._id]);

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden group">
      
      {/* Card Header — colored accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

      {/* Body */}
      <div className="px-4 md:px-5 py-4 flex-1 flex flex-col gap-2 relative">
        {/* Share Button placed absolute top right of the inner body */}
        <button 
          onClick={() => setIsShareOpen(true)}
          title="Share Note"
          className="absolute right-4 top-4 p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors z-10"
        >
          <Share2 className="h-4 w-4" />
        </button>

        {/* Branch + Semester badges */}
        <div className="flex items-center justify-between pr-8">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {note.branch}
          </span>
          <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            Sem {note.semester}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 line-clamp-2 leading-snug mt-1">
          {note.title}
        </h3>

        {/* Subject */}
        <p className="text-xs text-gray-500 font-medium truncate">{note.subject}</p>

        {/* Rating */}
        <div className="mt-1">
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
            size="sm"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Meta footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 mt-2">
          <span className="truncate max-w-[55%]">
            <span className="text-gray-500 font-medium">{note.uploadedBy?.name?.split(' ')[0] || 'Unknown'}</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-0.5">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.641 0-8.58-3.007-9.964-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {note.viewsCount ?? 0}
            </span>
            <span className="flex items-center gap-0.5">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              {note.downloadsCount ?? 0}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="px-4 md:px-5 pb-4 flex gap-2">
        <button
          onClick={() => onView(note._id, note.fileUrl)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <Eye className="h-3.5 w-3.5" /> View
        </button>

        <button
          onClick={() => onDownload(note._id, note.fileUrl)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <Download className="h-3.5 w-3.5" /> Save
        </button>

        {canDelete && (
          <button
            onClick={() => onDelete(note._id)}
            className="flex items-center justify-center px-2.5 py-2 rounded-xl text-red-500 bg-red-50 hover:bg-red-100 border border-red-200 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400"
            title={isAdmin && !isOwner ? 'Delete (Admin)' : 'Delete'}
          >
            <Trash2 className="h-3.5 w-3.5" />
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
