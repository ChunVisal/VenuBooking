import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../api/axiosConfig";
import CardMenu from "../common/CardMenu";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Tag,
  ChevronRight,
} from "lucide-react";

const EventCard = ({ event }) => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isWished, setIsWished] = useState(false);

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      alert("Please log in to add to your wishlist.");
      navigate("/login");
      return;
    }

    try {
      const res = await api.post(`/wishlist/${event.id}`);
      alert(res.data);
      setIsWished(true);
    } catch (err) {
      const msg = err.response?.data || "Failed to add to wishlist.";
      alert(msg);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="relative w-full bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <Link to={`/event/${event.id}`} className="block">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <img
            src={
              event.image ||
              `https://source.unsplash.com/800x600/?event,${event.category}`
            }
            alt={event.title}
            className="w-full h-full object-cover"
          />

          {/* Price Tag */}
          <div className="absolute top-3 left-3 bg-gray-800/80 text-white text-sm font-bold px-3 py-1.5 rounded-sm shadow-lg">
            {event.price ? `$${parseFloat(event.price).toFixed(2)}` : "Free"}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center space-x-2">
            <button
              onClick={handleAddToWishlist}
              disabled={!currentUser || isWished}
              className={`p-2.5 rounded-full backdrop-blur-md transition-all duration-300 transform hover:scale-110 ${
                isWished
                  ? "bg-red-500 text-white"
                  : "bg-white/90 text-gray-700 hover:bg-white"
              } ${!currentUser && "cursor-not-allowed"}`}
            >
              <Heart className={`h-3.5 w-3.5 ${isWished ? "fill-current" : ""}`} />
            </button>
            <CardMenu eventId={event.id} />
          </div>
        </div>

        {/* Content Section */}
        <div className="p-5 pb-3 pt-3">
          {/* Title */}
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-orange-600 transition-colors">
            {event.title}
          </h3>

          {/* Venue/Location */}
          <div className="flex items-center text-gray-700 mb-1">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{event.venue}</span>
          </div>

          {/* Date and Time */}
          <div className="flex items-center text-gray-700 mb-1">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center text-gray-700 mb-1">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="text-sm">{formatTime(event.date)}</span>
          </div>
            
          {/* description */}
          <div className="mb-4">
              <span className="text-gray-700 text-sm">{event.description}</span>
          </div>

          {/* Bottom Row: Category (Left) and View Details (Right) */}
          <div className="flex items-center justify-between">
            <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
              <Tag className="h-3 w-3 mr-1" />
              {event.category || "Event"}
            </div>

            <button className="flex items-center text-orange-700 hover:text-orange-600 font-semibold text-sm transition-colors">
              <span>Details</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default EventCard;
