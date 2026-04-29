import { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { WishlistContext } from "../../context/WishlistContext";
import CardMenu from "../common/CardMenu";
import OptimizedImage from "../common/OptimizedImage";
import toast from "react-hot-toast";
import {
  Calendar,
  MapPin,
  Clock,
  Heart,
  Trash,
  Tag,
  ChevronRight,
  Image,
} from "lucide-react";

const EventCard = ({ event }) => {
  const { currentUser } = useContext(AuthContext);
  const { wishlistItems, addToWishlist, removeFromWishlist } =
    useContext(WishlistContext);

  // Check if this specific event is in the global wishlist array
  const wishlistItem = wishlistItems.find((item) => item.id === event.id);
  const isWished = !!wishlistItem;

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      toast.error("Please login to save events!");
      return;
    }

    try {
      if (isWished) {
        await removeFromWishlist(wishlistItem.wishlist_id);
        toast.success("Removed from wishlist", {
          icon: <Trash className="text-red-600" size={20} />,
          style: {
            borderRadius: "5px",
            background: "#F0F0F0",
            color: "#3B3B3B",
          },
        });
      } else {
        await addToWishlist(event.id);
        toast.success("Added to wishlist!", {
          icon: <Heart className="text-red-500 fill-red-500" size={20} />,
          style: { borderRadius: "5px", background: "#008000 ", color: "#fff" },
        });
      }
    } catch (err) {
      // Handle the 409 Conflict error silently or with a specific message
      if (err.response?.status === 409) {
        toast.error("Already in your list!");
      } else {
        toast.error("Something went wrong...");
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
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
    <div className="relative w-full h-full bg-white rounded-sm overflow-hidden shadow-md hover:shadow-xl transition-all duration-300">
      <div className="block">
        {/* Image Section */}
        <div className="relative h-56 overflow-hidden">
          <Link to={`/event/${event.id}`}>
            <OptimizedImage
              src={
                event.image?.startsWith("[")
                  ? JSON.parse(event.image)[0]
                  : event.image
              }
              alt={event.title}
              className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            />
          </Link>

          {/* Price Tag */}
          <div className="absolute top-3 left-3 bg-gray-800/80 text-white text-sm font-bold px-3 py-1.5 rounded-sm shadow-lg">
            {event.price && parseFloat(event.price) > 0
              ? `$${parseFloat(event.price).toFixed(2)}`
              : "Free"}
          </div>

          {/* Action Buttons */}
          <div className="absolute top-3 right-3 flex items-center space-x-2 ">
            <button
              onClick={handleToggleWishlist}
              className={` p-[8px] rounded-full bg-gray-200 backdrop-blur-md transition-all ${
                isWished
                  ? " scale-110"
                  : "bg-white/90 hover:scale-110 hover:bg-white"
              }`}
            >
              <Heart
                className={`h-5 w-5 transition-transform duration-300 ${
                  isWished ? "fill-current text-red-600 scale-110" : ""
                }`}
              />
            </button>
            <CardMenu eventId={event.id} />
          </div>

          {/* image count length */}
          {(() => {
            if (event.image?.startsWith("[")) {
              const imagesArray = JSON.parse(event.image);
              if (imagesArray.length >= 2) {
                return (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded flex gap-1 items-center">
                    <Image size={15} />
                    {imagesArray.length} Images
                  </div>
                );
              }
            }
            return null;
          })()}
        </div>

        {/* Content Section */}
        {/* Content Section - Add h-full to make the container stretch */}
        <div className="flex flex-col h-full p-5 pb-3 pt-2">
          {/* info section - Added flex-grow here */}
          <div className="flex-grow">
            {/* Title */}
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 hover:text-orange-600 transition-colors">
              {event.title}
            </h3>

            {/* Venue/Location */}
            <div className="flex items-center text-gray-700 mb-1">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              {event.location && (
                <p className="text-gray-600 text-sm">{event.location}</p>
              )}
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

            {/* description - Added line-clamp-2 to keep height consistent */}
            <div className="mb-4">
              <p className="text-gray-700 text-sm line-clamp-2">
                {event.description || "No description available."}
              </p>
            </div>
          </div>

          {/* Bottom Row - Now always stays at the bottom because of flex-grow above */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-800">
              <Tag className="h-3 w-3 mr-1" />
              {event.category || "Event"}
            </div>

            <Link
              to={`/event/${event.id}`}
              className="flex items-center text-orange-700 hover:text-orange-600 font-semibold text-sm transition-colors"
            >
              <span>Book now</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
