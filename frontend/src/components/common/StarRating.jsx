import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import api from "../../api/axiosConfig";
import RatingModal from "./RatingModal";

const RatingStars = ({ eventId, eventTitle }) => {
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [neverShowAgain, setNeverShowAgain] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalShown, setModalShown] = useState(false);

  const fetchRatingData = async () => {
    try {
      const response = await api.get(`/events/${eventId}`);
      setAvgRating(response.data.avg_rating || 0);
      setTotalRatings(response.data.total_ratings || 0);

      const token = localStorage.getItem("token");
      if (token) {
        const ratedRes = await api.get(`/events/${eventId}/has-rated`);
        setHasRated(ratedRes.data.hasRated);
      }

      const neverShow = localStorage.getItem(`never_rate_${eventId}`);
      setNeverShowAgain(neverShow === "true");
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRatingData();
  }, [eventId]);

  // Show modal after 3 seconds if NOT rated and NOT "never show again"
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !hasRated && !neverShowAgain && !modalShown && !loading) {
      const timer = setTimeout(() => {
        setShowModal(true);
        setModalShown(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasRated, neverShowAgain, loading, modalShown]);

  const handleRated = (newAvg, newTotal) => {
    setAvgRating(newAvg);
    setTotalRatings(newTotal);
    setHasRated(true);
    setShowModal(false);
  };

  const handleNeverShowAgain = () => {
    localStorage.setItem(`never_rate_${eventId}`, "true");
    setNeverShowAgain(true);
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
        <span className="text-xs text-gray-500">
          ({totalRatings} {totalRatings === 1 ? "rating" : "ratings"})
        </span>
      </div>

      {showModal && (
        <RatingModal
          eventId={eventId}
          eventTitle={eventTitle}
          onClose={() => setShowModal(false)}
          onRated={handleRated}
          onNeverShowAgain={handleNeverShowAgain}
        />
      )}
    </>
  );
};

export default RatingStars;
