import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import api from "../../api/axiosConfig";
import RatingModal from "./RatingModal";

const RatingStars = ({ eventId, eventTitle }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch REAL data from database
  const fetchRatingData = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setAvgRating(response.data.avg_rating || 0);
      setTotalRatings(response.data.total_ratings || 0);

      // Check if user already rated
      const token = localStorage.getItem("token");
      if (token) {
        const ratedRes = await api.get(`/events/${eventId}/has-rated`);
        setHasRated(ratedRes.data.hasRated);
      }
    } catch (err) {
      console.error("Error fetching rating:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatingData();
  }, [eventId]);

  // Auto popup modal (only if not rated)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !hasRated && !loading) {
      const timer = setTimeout(() => {
        setShowModal(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [hasRated, loading]);

  const handleRated = async () => {
    // Refresh data from database after rating
    await fetchRatingData();
    setShowModal(false);
  };

  if (loading) return null;

  return (
    <>
      <div className="flex items-center gap-2">
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={
                star <= avgRating
                  ? "fill-orange-500 text-orange-500"
                  : "text-gray-300"
              }
            />
          ))}
        </div>
        <span className="text-xs text-gray-500">({totalRatings} Users)</span>
      </div>

      {showModal && (
        <RatingModal
          eventId={eventId}
          eventTitle={eventTitle}
          onClose={() => setShowModal(false)}
          onRated={handleRated}
        />
      )}
    </>
  );
};

export default RatingStars;
