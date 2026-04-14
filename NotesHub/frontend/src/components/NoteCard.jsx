import React from 'react';
import { Eye, Download, Trash2 } from 'lucide-react';
import RatingStars from './RatingStars';

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

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col overflow-hidden group">
      
      {/* Card Header — colored accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-500" />

      {/* Body */}
      <div className="px-4 md:px-5 py-4 flex-1 flex flex-col gap-2">
        {/* Branch + Semester badges */}
        <div className="flex items-center justify-between">
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
            average={note.rating?.average || 0}
            count={note.rating?.count || 0}
            userRating={null}
            size="sm"
          />
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Meta footer */}
        <div className="flex items-center justify-between text-xs text-gray-400 pt-2 border-t border-gray-100 mt-2">
          <span className="truncate max-w-[60%]">
            <span className="text-gray-500 font-medium">{note.uploadedBy?.name?.split(' ')[0] || 'Unknown'}</span>
          </span>
          <span>{note.downloadsCount} DLs</span>
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
    </div>
  );
};

export default NoteCard;
