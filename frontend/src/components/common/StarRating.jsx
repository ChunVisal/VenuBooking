// Create: src/components/common/StarRating.jsx
import { Star } from "lucide-react";

const StarRating = ({ rating = 0, total = 0 }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={14}
            className={
              star <= rating
                ? "fill-orange-500 text-orange-500"
                : "text-gray-300"
            }
          />
        ))}
      </div>
      <span className="text-xs text-gray-500">({total})</span>
    </div>
  );
};

export default StarRating;
