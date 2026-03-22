// src/pages/DetailEvent.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaHeart,
  FaMapMarkerAlt,
  FaPlayCircle,
  FaStar,
  FaCalendarAlt,
} from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import { WishlistContext } from "../context/WishlistContext";
import { useContext } from "react";
import toast from "react-hot-toast";

// Import Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
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

        console.log("FULL EVENT DATA:", eventData);
        console.log("ORGANIZER DATA:", eventData.organizer);
        console.log("PROFILE IMAGE URL:", eventData.organizer?.profile_image);

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
          <div className="flex items-center gap-3 bg-orange-500 text-white p-3 rounded-lg">
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
            <button onClick={handleShare} className="p-2">
              <FiShare2 className="w-6 h-6 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Location with Map */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FaMapMarkerAlt className="w-4 h-4 text-gray-700" />
            <span className="font-medium">Location</span>
          </div>
          <div className="text-sm">
            {event.location && (
              <p className="text-gray-600">{event.location}</p>
            )}
          </div>

          {/* MAP BOARD */}
          <div className="mt-2">
            <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
              {geocoding ? (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : mapLocation && mapLocation.lat ? (
                <MapContainer
                  key={mapLocation.lat}
                  center={[mapLocation.lat, mapLocation.lng]}
                  zoom={15}
                  style={{ height: "100%", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap"
                  />
                  <Marker position={[mapLocation.lat, mapLocation.lng]}>
                    <Popup>
                      <strong>{event.venue || event.title}</strong>
                      <br />
                      {displayAddress}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : displayAddress ? (
                <iframe
                  title="Location Map"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(displayAddress)}&layer=mapnik&marker=1`}
                  style={{ border: 0 }}
                />
              ) : (
                <div className="h-full flex items-center justify-center bg-gray-100">
                  <p className="text-gray-500 text-sm">No location specified</p>
                </div>
              )}
            </div>
            {displayAddress && !mapLocation?.lat && (
              <a
                href={`https://www.openstreetmap.org/search?query=${encodeURIComponent(displayAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-orange-500 mt-1 inline-block hover:underline"
              >
                View full map →
              </a>
            )}
          </div>
        </div>

        {/* Booking Button */}
        <button className="w-full bg-orange-500 text-white py-2 text-sm rounded-sm hover:bg-orange-600">
          Book Now - ${event.price ? parseFloat(event.price).toFixed(2) : "0"}
        </button>

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
        </div>

        {/* Right Column */}
        <div className="md:w-1/3 space-y-4">
          {/* Organizer Info */}
          {organizer && (
            <div className="flex items-center gap-3 bg-orange-500 text-white p-4 rounded-lg">
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

          {/* Event Created Date */}
          {event.created_at && (
            <div className="flex items-center gap-2 text-gray-500 text-sm border-b pb-2">
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
              <button onClick={handleShare} className="p-2">
                <FiShare2 className="w-6 h-6 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Location with Map - Desktop */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FaMapMarkerAlt className="w-4 h-4" />
              <span className="font-medium">Location</span>
            </div>

            {event.location && (
              <p className="text-gray-600 text-sm">{event.location}</p>
            )}

            {/* MAP BOARD - Desktop */}
            <div className="mt-2">
              <div className="h-52 rounded-lg overflow-hidden border border-gray-200">
                {geocoding ? (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : mapLocation && mapLocation.lat ? (
                  <MapContainer
                    key={mapLocation.lat}
                    center={[mapLocation.lat, mapLocation.lng]}
                    zoom={15}
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap"
                    />
                    <Marker position={[mapLocation.lat, mapLocation.lng]}>
                      <Popup>
                        <strong>{event.venue || event.title}</strong>
                        <br />
                        {displayAddress}
                      </Popup>
                    </Marker>
                  </MapContainer>
                ) : displayAddress ? (
                  <iframe
                    title="Location Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight="0"
                    marginWidth="0"
                    src={`https://www.openstreetmap.org/export/embed.html?q=${encodeURIComponent(displayAddress)}&layer=mapnik&marker=1`}
                    style={{ border: 0 }}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gray-100">
                    <p className="text-gray-500 text-sm">
                      No location specified
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <button className="w-full bg-orange-500 text-white py-3 rounded-sm hover:bg-orange-600 font-semibold">
            Book Now - ${event.price ? parseFloat(event.price).toFixed(2) : "0"}
          </button>

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
    </div>
  );
}
