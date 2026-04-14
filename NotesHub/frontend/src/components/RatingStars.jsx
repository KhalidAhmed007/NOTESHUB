import React, { useState } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';

/**
 * RatingStars — interactive 1–5 star rating widget.
 *
 * Props:
 *  noteId      — MongoDB note _id
 *  average     — current average (from note.rating.average)
 *  count       — total ratings count
 *  userRating  — logged-in user's existing rating (null if not rated)
 *  onRated     — callback(newAverage, newCount, newUserRating) after rating
 *  size        — 'sm' | 'md' (default: 'md')
 *  readOnly    — if true, just display, no interaction
 */
const RatingStars = ({
  noteId,
  average = 0,
  count = 0,
  userRating = null,
  onRated,
  size = 'md',
  readOnly = false,
}) => {
  const [hovered, setHovered]       = useState(0);
  const [myRating, setMyRating]     = useState(userRating);
  const [avgRating, setAvgRating]   = useState(average);
  const [ratingCount, setCount]     = useState(count);
  const [loading, setLoading]       = useState(false);

  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const display  = hovered || myRating || 0;

  const handleRate = async (value) => {
    if (readOnly || loading) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/ratings/${noteId}`, { value });
      setMyRating(data.userRating);
      setAvgRating(data.average);
      setCount(data.count);
      if (onRated) onRated(data.average, data.count, data.userRating);
    } catch (err) {
      console.error('Rating failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 select-none">
      {/* Stars */}
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = readOnly
            ? star <= Math.round(avgRating)
            : star <= (display);

          return (
            <button
              key={star}
              type="button"
              disabled={readOnly || loading}
              onClick={() => handleRate(star)}
              onMouseEnter={() => !readOnly && setHovered(star)}
              onMouseLeave={() => !readOnly && setHovered(0)}
              className={`
                transition-transform duration-100 
                ${!readOnly ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}
                ${loading ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <Star
                className={`${starSize} transition-colors duration-100 ${
                  filled
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Average + count */}
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {avgRating > 0 ? (
          <><span className="font-semibold text-gray-700">{avgRating.toFixed(1)}</span> ({ratingCount})</>
        ) : (
          <span className="italic">No ratings yet</span>
        )}
      </span>
    </div>
  );
};

export default RatingStars;
