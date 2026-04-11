import { useState, useEffect } from "react";
import { Star, X } from "lucide-react";
import api from "../../api/axiosConfig";

const RatingModal = ({ eventId, eventTitle, onClose, onRated }) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  const handleSubmit = async () => {
    if (selectedRating === 0) return;

    setSubmitting(true);
    try {
      const response = await api.post(`/events/${eventId}/rate`, {
        rating: selectedRating,
      });
      onRated(response.data.avg_rating, response.data.total_ratings);
      setIsVisible(false);
      setTimeout(onClose, 300);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-300">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 max-w-sm w-80">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-gray-900">Rate this event ✨</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              "{eventTitle?.substring(0, 40)}..."
            </p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 300);
            }}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <div className="flex justify-center gap-1.5 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setSelectedRating(star)}
              className="focus:outline-none transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={`${
                  star <= (hoverRating || selectedRating)
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-200"
                } transition-all duration-150`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedRating === 0 || submitting}
          className="w-full py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 disabled:opacity-50 transition-all text-sm"
        >
          {submitting
            ? "Submitting..."
            : `Rate ${selectedRating} star${selectedRating !== 1 ? "s" : ""}`}
        </button>

        <p className="text-[10px] text-gray-400 text-center mt-2">
          Your rating helps other event-goers
        </p>
      </div>
    </div>
  );
};

export default RatingModal;
