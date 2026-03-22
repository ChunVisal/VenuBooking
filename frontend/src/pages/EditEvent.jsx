// src/pages/EditEvent.jsx
import { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import {
  Loader2,
  Calendar,
  MapPin,
  Image as ImageIcon,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Users,
  Globe,
  Info,
  Hash,
  PlusCircle,
  Type,
  Edit3,
  Clock,
  Tag,
  Star,
  Trash2,
  Upload,
  Search,
  Sparkles,
} from "lucide-react";

// Import Leaflet for map (same as CreateEventPage)
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Location Search Component
const LocationSearch = ({ onLocationSelect, initialValue = "" }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "EventApp/1.0",
          },
        },
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      searchLocation(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location) => {
    // Create a clean, short location name
    let cleanName = location.display_name.split(",")[0]; // Just first part (venue name)
    let cleanAddress = "";

    // Get city and country only (first 3 parts of the address)
    const addressParts = location.display_name.split(",");
    if (addressParts.length >= 3) {
      cleanAddress = addressParts.slice(0, 3).join(", ").trim();
    } else {
      cleanAddress = location.display_name;
    }

    setSearchQuery(cleanName); // Show clean name in search input
    setShowSuggestions(false);
    onLocationSelect({
      name: cleanName,
      address: cleanAddress, // Only city, district, country
      fullAddress: location.display_name, // Keep full for reference
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
    });
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
          placeholder="Search for venue, city, or address..."
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((location) => (
            <button
              key={location.place_id}
              onClick={() => handleSelectLocation(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {location.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {location.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Map Picker Component
const MapPicker = ({
  onLocationSelect,
  initialLat = 12.5657,
  initialLng = 104.991,
}) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState("");
  const [map, setMap] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "EventApp/1.0",
          },
        },
      );
      const data = await response.json();
      const addressText =
        data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addressText);
      onLocationSelect({
        name:
          data.address?.road ||
          data.address?.city ||
          data.address?.country ||
          "Selected Location",
        address: addressText,
        lat: lat,
        lng: lng,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      },
    });
    return <Marker position={position} />;
  };

  return (
    <div className="space-y-4">
      <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          ref={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>
      {address && (
        <div className="p-3 bg-green-50 rounded-xl text-sm text-gray-600 border border-green-200">
          <MapPin className="w-4 h-4 inline mr-2" />
          {address}
        </div>
      )}
    </div>
  );
};

const EditEventPage = () => {
  const { id } = useParams();
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationMethod, setLocationMethod] = useState("search");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    price: "",
    category: "",
    availableSeats: "",
    eventType: "offline",
    location: "",
    tags: [],
    highlights: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  const fetchEvent = useCallback(async () => {
    try {
      const res = await api.get(`/events/${id}`);
      const event = Array.isArray(res.data) ? res.data[0] : res.data;

      if (!event) throw new Error("Event not found");

      // Parse date and time
      let formattedDate = "";
      let formattedTime = "";
      if (event.date) {
        const d = new Date(event.date);
        formattedDate = d.toISOString().split("T")[0];
        formattedTime = d.toTimeString().slice(0, 5);
      }

      // Parse JSON fields
      const safeParse = (data) => {
        if (!data) return [];
        if (Array.isArray(data)) return data;
        try {
          return JSON.parse(data);
        } catch (e) {
          return data ? [data] : [];
        }
      };

      // FIX: Ensure price and availableSeats are never NaN
      let priceValue = event.price;
      if (
        priceValue === null ||
        priceValue === undefined ||
        priceValue === "NaN" ||
        isNaN(parseFloat(priceValue))
      ) {
        priceValue = "";
      }

      let seatsValue = event.availableSeats || event.available_seats;
      if (
        seatsValue === null ||
        seatsValue === undefined ||
        seatsValue === "NaN" ||
        isNaN(parseInt(seatsValue))
      ) {
        seatsValue = "";
      }

      setFormData({
        title: event.title || "",
        description: event.description || "",
        date: formattedDate,
        time: formattedTime,
        venue: event.venue || "",
        price: priceValue,
        category: event.category || "",
        availableSeats: seatsValue,
        eventType: event.eventType || event.event_type || "offline",
        location: event.location || "",
        tags: safeParse(event.tags),
        highlights: safeParse(event.highlights),
      });

      // Load images
      const imageSource = event.image || event.images;
      const finalImages = safeParse(imageSource);
      setPreviews(finalImages);

      // Set location if exists
      if (event.location) {
        setSelectedLocation({
          address: event.location,
          name: event.venue || event.location,
        });
      }
    } catch (err) {
      console.error("FETCH ERROR:", err);
      setStatus({ type: "error", msg: "Unable to retrieve event details." });
    } finally {
      setIsLoadingData(false);
    }
  }, [id]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (imageFiles.length + validFiles.length > 10) {
      setStatus({ type: "error", msg: "Maximum 10 images allowed" });
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    if (previews[index] && !previews[index].startsWith("http")) {
      URL.revokeObjectURL(previews[index]);
    }
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const addTag = () => {
    const val = tagInput.trim();
    if (val && !formData.tags.includes(val) && formData.tags.length < 10) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      setTagInput("");
    }
  };

  const addHighlight = () => {
    const val = highlightInput.trim();
    if (val && formData.highlights.length < 15) {
      setFormData((prev) => ({
        ...prev,
        highlights: [...prev.highlights, val],
      }));
      setHighlightInput("");
    }
  };

  const removeListItem = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  const handleLocationSelect = (placeDetails) => {
    setSelectedLocation(placeDetails);
    setFormData((prev) => ({
      ...prev,
      location: placeDetails.address,
      venue: placeDetails.name,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    const data = new FormData();

    // Combine date and time
    const eventDateTime =
      formData.date && formData.time
        ? `${formData.date}T${formData.time}`
        : formData.date || "";

    // Handle each field
    Object.keys(formData).forEach((key) => {
      if (key === "tags" || key === "highlights") {
        if (formData[key].length > 0) {
          data.append(key, JSON.stringify(formData[key]));
        }
      } else if (key !== "time") {
        let value = key === "date" ? eventDateTime : formData[key];

        // For price and seats, send empty as null or don't send
        if (key === "price") {
          if (!value || value === "" || value === "NaN") {
            // Don't append - let backend handle null
            return;
          }
        }

        if (key === "availableSeats") {
          if (!value || value === "" || value === "NaN") {
            // Don't append - let backend handle null
            return;
          }
        }

        if (value && value !== "" && value !== "NaN") {
          data.append(key, String(value));
        }
      }
    });

    // Send existing images
    const existingImages = previews.filter((p) => p && p.startsWith("http"));
    if (existingImages.length > 0) {
      data.append("existing_images", JSON.stringify(existingImages));
    }

    // Send new images
    imageFiles.forEach((file) => {
      data.append("image", file);
    });

    // Add location details if exists
    if (selectedLocation && selectedLocation.address) {
      data.append("location_details", JSON.stringify(selectedLocation));
    }

    try {
      await api.put(`/events/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({
        type: "success",
        msg: "Event updated successfully! Redirecting...",
      });
      setTimeout(() => navigate("/my-events"), 1500);
    } catch (err) {
      console.error("Update error:", err);
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Failed to update event",
      });
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
        <p className="text-gray-500 font-medium">Loading event data...</p>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <Edit3 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Edit Event
          </h1>
          <p className="text-gray-500 mt-2">Update your event details</p>
        </div>

        {/* Status Alert */}
        {status.msg && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 ${
              status.type === "success"
                ? "bg-green-50 border border-green-200 text-green-700"
                : "bg-red-50 border border-red-200 text-red-700"
            }`}
          >
            {status.type === "success" ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="font-medium">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Media Upload */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" /> Event Visuals
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {previews.map((src, index) => (
                <div
                  key={index}
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-gray-200 shadow-sm"
                >
                  <img
                    src={src}
                    alt="Preview"
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-full shadow-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition-all group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-orange-100 transition-colors">
                  <Upload className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Add Image
                </span>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">
              Upload up to 10 images. First image will be the cover.
            </p>
          </section>

          {/* Core Details */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" /> General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                  placeholder="Event title"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                >
                  <option value="">Choose category</option>
                  <option value="Tech">💻 Technology</option>
                  <option value="Music">🎵 Music & Arts</option>
                  <option value="Food">🍔 Food & Drinks</option>
                  <option value="Business">💼 Business</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" /> Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" /> Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-gray-400" /> Price (USD)
                </label>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00 (Free)"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-gray-400" /> Max Capacity
                </label>
                <input
                  type="number"
                  name="availableSeats"
                  placeholder="Unlimited"
                  value={formData.availableSeats}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-gray-400" /> Format
                </label>
                <select
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                >
                  <option value="offline">📍 In-Person</option>
                  <option value="online">🌐 Virtual</option>
                  <option value="hybrid">🔄 Hybrid</option>
                </select>
              </div>
            </div>
          </section>

          {/* Location Section */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-orange-500" /> Location
            </h2>

            {formData.eventType !== "online" ? (
              <div className="space-y-4">
                <div className="flex gap-2 p-1 bg-gray-100 rounded-xl mb-4">
                  <button
                    type="button"
                    onClick={() => setLocationMethod("search")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      locationMethod === "search"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    Search Location
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMethod("map")}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      locationMethod === "map"
                        ? "bg-white text-orange-600 shadow-sm"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Pick on Map
                  </button>
                </div>

                {locationMethod === "search" ? (
                  <LocationSearch
                    onLocationSelect={handleLocationSelect}
                    initialValue={formData.location}
                  />
                ) : (
                  <MapPicker
                    onLocationSelect={handleLocationSelect}
                    initialLat={selectedLocation?.lat || 12.5657}
                    initialLng={selectedLocation?.lng || 104.991}
                  />
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  name="location"
                  placeholder="https://zoom.us/..."
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            )}
          </section>

          {/* Description & Lists */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" /> Content & Discovery
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Describe your event..."
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 items-center gap-1.5">
                  <Hash className="w-4 h-4 text-gray-400" /> Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 transition-all"
                    placeholder="Add a tag..."
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((t, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium border border-orange-100"
                    >
                      #{t}{" "}
                      <X
                        className="w-3.5 h-3.5 cursor-pointer"
                        onClick={() => removeListItem("tags", i)}
                      />
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Key Highlights
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 transition-all"
                    placeholder="What makes your event special?"
                  />
                  <button
                    type="button"
                    onClick={addHighlight}
                    className="px-5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 group"
                    >
                      <span className="text-gray-700">✨ {h}</span>
                      <X
                        className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                        onClick={() => removeListItem("highlights", i)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-4">
            <button
              type="button"
              onClick={() => navigate("/my-events")}
              className="flex-1 py-4 px-6 bg-white text-gray-600 font-bold rounded-2xl border border-gray-200 hover:bg-gray-50 transition-all shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-[2] py-4 px-6 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 disabled:opacity-50 transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle className="w-5 h-5" />
              )}
              {isSubmitting ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEventPage;
