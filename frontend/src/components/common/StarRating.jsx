import { useState, useEffect } from "react";
import { Star } from "lucide-react";
import RatingModal from "./RatingModal";

const RatingStars = ({
  eventId,
  eventTitle,
  initialAvg = 0,
  initialTotal = 0,
}) => {
  const [avgRating, setAvgRating] = useState(initialAvg);
  const [totalRatings, setTotalRatings] = useState(initialTotal);
  const [showModal, setShowModal] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [popupShown, setPopupShown] = useState(false);

  // Check if user already rated (from localStorage)
  useEffect(() => {
    const rated = localStorage.getItem(`rated_${eventId}`);
    if (rated) {
      setHasRated(true);
      setPopupShown(true);
    }
  }, [eventId]);

  // Auto popup modal after 2 seconds
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token && !hasRated && !popupShown) {
      const timer = setTimeout(() => {
        setShowModal(true);
        setPopupShown(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [hasRated, popupShown, eventId]);

  const handleRated = (newAvg, newTotal) => {
    setAvgRating(newAvg);
    setTotalRatings(newTotal);
    setHasRated(true);
    localStorage.setItem(`rated_${eventId}`, "true");
    setShowModal(false);
  };

  // Display only stars and total (no click to rate)
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

      {/* Rating Modal - auto pops up after 2 seconds */}
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
