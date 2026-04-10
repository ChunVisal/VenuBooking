// src/components/events/ReviewSection.jsx
import { useState, useEffect, useContext } from "react";
import { Star, Calendar, Flag } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";

const ReviewSection = ({ event }) => {
  const { currentUser } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(event?.rating || 0);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [hasReviewed, setHasReviewed] = useState(false);
  const [loading, setLoading] = useState(true);

  if (!event) return null;

  useEffect(() => {
    fetchReviews();
  }, [event.id]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/events/${event.id}/reviews`);
      setReviews(response.data);
      setAverageRating(event.rating || 0);

      if (currentUser) {
        const userReview = response.data.find(
          (r) => r.userId === currentUser.id,
        );
        if (userReview) {
          setHasReviewed(true);
          setUserRating(userReview.rating);
          setUserComment(userReview.comment);
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      alert("Please login to write a review");
      return;
    }

    if (userRating === 0) {
      alert("Please select a rating");
      return;
    }

    try {
      const response = await api.post(`/events/${event.id}/reviews`, {
        rating: userRating,
        comment: userComment,
        userId: currentUser.id,
        userName: currentUser.name || currentUser.email,
        userAvatar: null,
      });

      await fetchReviews();
      setUserComment("");
      setHasReviewed(true);
    } catch (error) {
      console.error("Error submitting review:", error);
      alert(error.response?.data?.error || "Failed to submit review");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm("Delete your review?")) return;

    try {
      await api.delete(`/events/${event.id}/reviews/${reviewId}`);
      await fetchReviews();
      setHasReviewed(false);
      setUserRating(0);
    } catch (error) {
      console.error("Error deleting review:", error);
      alert("Failed to delete review");
    }
  };

  const StarRating = ({ rating, onRate, interactive = false }) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onRate?.(star)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          {star <= rating ? (
            <Star className="w-5 h-5 fill-orange-500 text-orange-500" />
          ) : (
            <Star className="w-5 h-5 text-gray-300" />
          )}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg border p-6 mt-8">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold">Reviews</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
          <StarRating rating={averageRating} />
          <span className="text-sm text-gray-500">({reviews.length})</span>
        </div>
      </div>

      {!hasReviewed ? (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-3">Write a Review</h4>
          <form onSubmit={handleSubmitReview}>
            <div className="mb-3">
              <StarRating
                rating={userRating}
                onRate={setUserRating}
                interactive={true}
              />
            </div>
            <textarea
              value={userComment}
              onChange={(e) => setUserComment(e.target.value)}
              placeholder="Share your experience..."
              rows="3"
              className="w-full px-3 py-2 border rounded-lg mb-3"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg"
            >
              Submit Review
            </button>
          </form>
        </div>
      ) : (
        <div className="mb-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-700">You reviewed this event</p>
        </div>
      )}

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No reviews yet</p>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{review.userName}</span>
                    <StarRating rating={review.rating} />
                    <span className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-sm mt-1">{review.comment}</p>
                  )}
                </div>
                {currentUser?.id === review.userId && (
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
