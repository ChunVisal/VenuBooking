// src/pages/DetailEvent.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaPlayCircle,
  FaStar,
  FaCheckCircle,
  FaCalendarAlt,
  FaChevronRight,
} from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import api from "../api/axiosConfig";
import StarRating from "../components/common/StarRating";
import SimilarEvents from "../components/events/SimilarEvents";
import ShareButton from "../components/common/ShareButton";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { useContext } from "react";
import toast from "react-hot-toast";

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L, { Events } from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const { addToWishlist, removeFromWishlist, wishlistItems } =
    useContext(WishlistContext);

  const [event, setEvent] = useState(null);
  const [organizer, setOrganizer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);
  const [geocoding, setGeocoding] = useState(false);

  const [userRating, setUserRating] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);

  const [hasBooked, setHasBooked] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);

  // Check if event is in wishlist
  useEffect(() => {
    if (event && wishlistItems) {
      const wishlistItem = wishlistItems.find((item) => item.id === event.id);
      setIsLiked(!!wishlistItem);
    }
  }, [event, wishlistItems]);

  // Geocode address to get coordinates
  const geocodeAddress = async (address) => {
    if (!address) return null;

    setGeocoding(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`,
        {
          headers: { "User-Agent": "EventApp/1.0" },
        },
      );
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          address: data[0].display_name,
        };
      }
      return null;
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    } finally {
      setGeocoding(false);
    }
  };
  // Fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/events/${id}`);
        const eventData = response.data;
        setEvent(eventData);
        setOrganizer(eventData.organizer);

        // Parse images
        let images = [];
        if (eventData.image) {
          try {
            images =
              typeof eventData.image === "string"
                ? JSON.parse(eventData.image)
                : [eventData.image];
          } catch (e) {
            images = [eventData.image];
          }
        }
        setActiveImage(
          images[0] || "https://via.placeholder.com/500x300?text=No+Image",
        );

        // Get location coordinates
        let coords = null;

        // First check if we have saved coordinates
        if (eventData.location_details) {
          try {
            coords =
              typeof eventData.location_details === "string"
                ? JSON.parse(eventData.location_details)
                : eventData.location_details;
          } catch (e) {}
        }

        // If no coordinates but we have address, geocode it
        if (!coords && (eventData.location || eventData.venue)) {
          const addressToGeocode = eventData.location || eventData.venue;
          coords = await geocodeAddress(addressToGeocode);
        }

        if (coords && coords.lat && coords.lng) {
          setMapLocation(coords);
        } else if (eventData.location || eventData.venue) {
          // Show address without map
          setMapLocation({ address: eventData.location || eventData.venue });
        }
      } catch (err) {
        console.error("Error:", err);
        toast.error("Failed to load event");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id, navigate]);

  const handleWishlistToggle = async () => {
    if (!currentUser) {
      toast.error("Please login to save events!");
      navigate("/login");
      return;
    }

    try {
      if (isLiked) {
        const wishlistItem = wishlistItems.find((item) => item.id === event.id);
        if (wishlistItem) {
          await removeFromWishlist(wishlistItem.wishlist_id);
          toast.success("Removed from wishlist");
        }
      } else {
        await addToWishlist(event.id);
        toast.success("Added to wishlist!");
      }
      setIsLiked(!isLiked);
    } catch (err) {
      toast.error("Something went wrong...");
    }
  };

  // Check if user already booked this event
  const checkUserBooking = async () => {
    if (!currentUser) return;

    try {
      const response = await api.get("/bookings/my-bookings");
      const booking = response.data.find((b) => b.event_id === parseInt(id));
      if (booking) {
        setHasBooked(true);
        setExistingBooking(booking);
      }
    } catch (err) {
      console.error("Error checking booking:", err);
    }
  };

  // Call this in your useEffect after fetching event
  useEffect(() => {
    if (id) {
      setEvent();
      if (currentUser) {
        checkUserBooking();
      }
    }
  }, [id, currentUser]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!event) return null;

  // Parse data
  let images = [];
  try {
    images =
      typeof event.image === "string"
        ? JSON.parse(event.image)
        : event.image
          ? [event.image]
          : [];
  } catch (e) {
    images = [event.image];
  }

  let highlights = [];
  try {
    highlights =
      typeof event.highlights === "string"
        ? JSON.parse(event.highlights)
        : event.highlights || [];
  } catch (e) {
    highlights = [];
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCreatedDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get display address
  const displayAddress = mapLocation?.address || event.location || event.venue;
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  // If no event after loading, show error
  if (!event) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-500">Event not found</p>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-4 font-sans">
      {/* MOBILE LAYOUT */}
      <div className="md:hidden flex flex-col gap-4">
        {/* Event Main Image */}
        <div className="w-full h-60">
          <img
            src={activeImage}
            alt={event.title}
            className="w-full h-full rounded-sm object-cover"
          />
        </div>
        {/* Image Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto">
            {images.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Thumb ${i}`}
                className={`w-24 h-16 object-cover rounded-sm cursor-pointer ${
                  activeImage === img ? "border-2 border-blue-500" : ""
                }`}
                onClick={() => setActiveImage(img)}
              />
            ))}
          </div>
        )}
        {/* Organizer Info */}
        {organizer && (
          <div className="flex items-center gap-3 bg-orange-400 text-white p-3 rounded-lg">
            {organizer.profile_image ? (
              <img
                src={
                  organizer.profile_image ||
                  `https://avatar.iran.liara.run/username?username=${organizer.username}`
                }
                alt={organizer.username}
                className="w-14 h-14 object-cover rounded-full border-2 border-white"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${organizer.username}&background=ff6600&color=fff&bold=true&size=56`;
                }}
              />
            ) : (
              <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center text-xl font-bold">
                {organizer.username?.[0]?.toUpperCase() || "?"}
              </div>
            )}
            <div className="text-xs flex-1">
              <p className="font-semibold">Hosted by {organizer.username}</p>
              <p className="opacity-90">{organizer.email}</p>
              <div className="flex items-center gap-1 mt-1">
                <FaCalendarAlt className="w-3 h-3" />
                <p>Joined {formatCreatedDate(organizer.created_at)}</p>
              </div>
            </div>
          </div>
        )}
        {/* Event Created Date */}
        {event.created_at && (
          <div className="flex items-center gap-2 text-gray-500 text-xs border-b pb-2">
            <FaCalendarAlt className="w-3 h-3" />
            <span>Event created: {formatCreatedDate(event.created_at)}</span>
          </div>
        )}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-2">
            <h1 className="text-lg font-bold">{event.title}</h1>
            <p className="text-sm text-gray-600">
              {formatDate(event.date)} • {formatTime(event.date)}
            </p>
            <p className="text-sm text-gray-500">{event.category}</p>
          </div>

          <div className="flex gap-2">
            <button onClick={handleWishlistToggle} className="p-2">
              <FaHeart
                className={`w-6 h-6 ${isLiked ? "text-red-500" : "text-gray-400"}`}
              />
            </button>
            <ShareButton
              eventId={event.id}
              eventTitle={event.title}
              eventImage={event.image}
            />
          </div>
        </div>
        {/* Location with Map - Desktop */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4" />
            <span className="font-medium">Location</span>
          </div>

          <p className="font-semibold">{event.venue || "TBA"}</p>
          {event.location && (
            <p className="text-gray-600 text-sm">{event.location}</p>
          )}

          {/* MAP BOARD - Always show map if location exists */}
          {(event.location || event.venue) && (
            <div className="mt-2">
              <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=104.7%2C11.4%2C105.1%2C11.7&layer=mapnik&marker=11.55%2C104.9`}
                  style={{ border: 0 }}
                />
              </div>
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(event.location || event.venue)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 mt-1 inline-block hover:underline"
              >
                View larger map →
              </a>
            </div>
          )}
        </div>
        {/* Booking Button - Conditional based on booking status */}
        {!currentUser ? (
          <Link
            to="/login"
            className="w-full bg-gray-500 text-white py-3 rounded-sm font-semibold block text-center"
          >
            Login to Book
          </Link>
        ) : hasBooked ? (
          <div className="space-y-3">
            <button
              disabled
              className="w-full bg-green-500 text-white py-3 rounded-sm font-semibold block text-center opacity-75 cursor-not-allowed"
            >
              ✓ Already Booked
            </button>
            <Link
              to="/my-bookings"
              className="w-full block text-center bg-orange-500 text-white py-3 rounded-sm font-semibold hover:bg-orange-600"
            >
              View My Tickets
            </Link>
          </div>
        ) : (
          <Link
            to={`/book/${event.id}`}
            className="w-full bg-orange-500 text-white py-3 rounded-sm hover:bg-orange-600 font-semibold block text-center"
          >
            Book Now - ${event.price ? parseFloat(event.price).toFixed(2) : "0"}
          </Link>
        )}
        {/* Highlights */}
        {highlights.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold">Highlights</h2>
            <div className="space-y-1">
              {highlights.map((highlight, i) => (
                <div key={i} className="flex items-center gap-2">
                  <FaStar className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm">{highlight}</span>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* About This Event */}
        <div className="space-y-2">
          <h2 className="font-semibold">About This Event</h2>
          <p className="text-sm text-gray-700">{event.description}</p>
        </div>
        <StarRating
          eventId={event.id}
          eventTitle={event.title}
          initialAvg={event.avg_rating}
          initialTotal={event.total_ratings}
        />
      </div>

      {/* DESKTOP LAYOUT - Same structure */}
      <div className="hidden md:flex md:gap-8">
        {/* Left Column */}
        <div className="md:w-2/3 space-y-4">
          <div className="w-full h-96">
            <img
              src={activeImage}
              alt={event.title}
              className="w-full h-full rounded-sm object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  className={`w-full h-20 object-cover rounded-sm cursor-pointer ${
                    activeImage === img ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => setActiveImage(img)}
                />
              ))}
            </div>
          )}
          <div className="space-y-3">
            <h2 className="font-semibold text-lg">About This Event</h2>
            <p className="text-gray-700">{event.description}</p>
          </div>
          <StarRating
            eventId={event.id}
            eventTitle={event.title}
            initialAvg={event.avg_rating}
            initialTotal={event.total_ratings}
          />
        </div>

        {/* Right Column */}
        <div className="md:w-1/3 space-y-4">
          <Link to={`/profile/${organizer.username}`}>
            {/* Organizer Info */}
            {organizer && (
              <div className="flex items-center gap-3 bg-orange-400 text-white p-2 rounded-lg">
                {organizer.profile_image ? (
                  <img
                    src={organizer.profile_image}
                    alt={organizer.username}
                    className="w-14 h-14 object-cover rounded-full border-2 border-white"
                  />
                ) : (
                  <div className="w-14 h-14 bg-white/30 rounded-full flex items-center justify-center text-2xl font-bold">
                    {organizer.username?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-lg">
                    Hosted by {organizer.username}
                  </p>
                  <p className="text-sm opacity-90">{organizer.email}</p>
                  <div className="flex items-center gap-1 mt-1 text-xs">
                    <FaCalendarAlt className="w-3 h-3" />
                    <p>Joined {formatCreatedDate(organizer.created_at)}</p>
                  </div>
                </div>
              </div>
            )}
          </Link>
          {/* Event Created Date */}
          {event.created_at && (
            <div className="flex items-center gap-2 text-gray-500 text-sm border-b p-2">
              <FaCalendarAlt className="w-4 h-4" />
              <span>Event created: {formatCreatedDate(event.created_at)}</span>
            </div>
          )}
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">{event.title}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(event.date)} • {formatTime(event.date)}
              </p>
              <p className="text-sm text-gray-500">{event.category}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={handleWishlistToggle} className="p-2">
                <FaHeart
                  className={`w-6 h-6 ${isLiked ? "text-red-500" : "text-gray-400"}`}
                />
              </button>
              <ShareButton
                type="event"
                id={event.id}
                title={event.title}
                image={event.image}
              />
            </div>
          </div>
          {/* Location with Map - Desktop */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span className="font-medium">Location</span>
            </div>

            <p className="font-semibold">{event.venue || "TBA"}</p>
            {event.location && (
              <p className="text-gray-600 text-sm">{event.location}</p>
            )}

            {/* MAP BOARD - Always show map if location exists */}
            {(event.location || event.venue) && (
              <div className="mt-2">
                <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=104.7%2C11.4%2C105.1%2C11.7&layer=mapnik&marker=11.55%2C104.9`}
                    style={{ border: 0 }}
                  />
                </div>
                <a
                  href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(event.location || event.venue)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-500 mt-1 inline-block hover:underline"
                >
                  View larger map →
                </a>
              </div>
            )}
          </div>
          {currentUser ? (
            hasBooked ? (
              <Link
                to="/my-bookings"
                className="flex items-center justify-center gap-2 rounded-md bg-green-400 shadow-md py-3 text-white font-semibold text-sm"
              >
                <FaCheckCircle className="w-4 h-4" color="white" />
                <span>
                  Booked ✓ for{" "}
                  {event.price ? parseFloat(event.price).toFixed(2) : "0"} $
                </span>
              </Link>
            ) : (
              <Link
                to={`/book/${event.id}`}
                className="flex items-center justify-center bg-orange-500 py-3 rounded-md gap-2 text-white font-semibold text-sm transition-colors"
              >
                <span>
                  {" "}
                  Book Now - $
                  {event.price ? parseFloat(event.price).toFixed(2) : "0"}
                </span>
                <FaChevronRight className="h-4 w-4 ml-1" />
              </Link>
            )
          ) : (
            <Link
              to="/login"
              className="flex items-center text-gray-500 font-semibold text-sm"
            >
              Login to Book
            </Link>
          )}
          {highlights.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Highlights</h3>
              <div className="space-y-1">
                {highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <FaStar className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <SimilarEvents currentEvent={event} />
    </div>
  );
}
