import { useState } from "react";
import { Star, X } from "lucide-react";
import api from "../../api/axiosConfig";
import toast from "react-hot-toast";

const RatingModal = ({
  eventId,
  eventTitle,
  onClose,
  onRated,
  onNeverShowAgain,
}) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (selectedRating === 0) {
      toast.error("Select a rating first");
      return;
    }

    setSubmitting(true);
    try {
      const response = await api.post(`/events/${eventId}/rate`, {
        rating: selectedRating,
      });
      toast.success("Thank you for rating!");
      onRated(response.data.avg_rating, response.data.total_ratings);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to rate");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-2xl shadow-2xl border p-5 w-80">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-bold text-gray-900 dark:text-white">
            Rate this event ✨
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
          >
            <X size={16} className="text-gray-400" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          "{eventTitle?.substring(0, 40)}..."
        </p>

        <div className="flex justify-center gap-1.5 my-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setSelectedRating(star)}
            >
              <Star
                size={32}
                className={`${
                  star <= (hoverRating || selectedRating)
                    ? "fill-orange-500 text-orange-500"
                    : "text-gray-300 dark:text-gray-600"
                } transition-all`}
              />
            </button>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={selectedRating === 0 || submitting}
          className="w-full py-2 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 text-sm"
        >
          {submitting
            ? "Submitting..."
            : `Rate ${selectedRating} star${selectedRating !== 1 ? "s" : ""}`}
        </button>

        <button
          onClick={onNeverShowAgain}
          className="w-full text-xs text-gray-400 hover:text-gray-600 mt-2"
        >
          Never show again
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
