import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
  Sparkles,
  PlusCircle,
  Type,
  Clock,
  Tag,
  Star,
  Trash2,
  Upload,
  Search,
  Navigation,
} from "lucide-react";

// FREE Map Options - OpenStreetMap with Leaflet
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Location Search Component using OpenStreetMap Nominatim (FREE)
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
      // Using OpenStreetMap Nominatim API (FREE)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "YourAppName/1.0", // Required by Nominatim
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

// Map Picker Component (FREE)
const MapPicker = ({
  onLocationSelect,
  initialLat = 40.7128,
  initialLng = -74.006,
}) => {
  const [position, setPosition] = useState([12.5657, 104.991]);
  const [address, setAddress] = useState("");

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        reverseGeocode(e.latlng.lat, e.latlng.lng);
      },
    });
    return <Marker position={position} />;
  };

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
      const fullAddress =
        data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

      // Create clean address (city and country only)
      let cleanAddress = fullAddress;
      if (fullAddress.includes(",")) {
        const parts = fullAddress.split(",");
        cleanAddress = parts.slice(0, 2).join(", ").trim();
      }

      setAddress(cleanAddress);
      onLocationSelect({
        name:
          data.address?.road ||
          data.address?.city ||
          data.address?.country ||
          "Selected Location",
        address: cleanAddress, // Store clean address
        fullAddress: fullAddress, // Keep full for reference
        lat: lat,
        lng: lng,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };
  return (
    <div className="space-y-4">
      <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>
      {address && (
        <div className="p-3 bg-gray-50 rounded-xl text-sm text-gray-600">
          <MapPin className="w-4 h-4 inline mr-2" />
          {address}
        </div>
      )}
      <p className="text-xs text-gray-500 text-center">
        Click anywhere on the map to select your event location
      </p>
    </div>
  );
};

// Main Component
const CreateEventPage = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [activeStep, setActiveStep] = useState(1);
  const [locationMethod, setLocationMethod] = useState("search"); // "search" or "map"

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

  const steps = [
    { id: 1, name: "Basic Info", icon: Type },
    { id: 2, name: "Media", icon: ImageIcon },
    { id: 3, name: "Location", icon: MapPin },
    { id: 4, name: "Details", icon: Info },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    if (validFiles.length !== files.length) {
      setStatus({ type: "error", msg: "Only image files are allowed" });
      return;
    }

    if (imageFiles.length + validFiles.length > 10) {
      setStatus({ type: "error", msg: "Maximum 10 images allowed" });
      return;
    }

    setImageFiles((prev) => [...prev, ...validFiles]);
    const newPreviews = validFiles.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    URL.revokeObjectURL(previews[index]);
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
      location: placeDetails.address || placeDetails.name,
      venue: placeDetails.name,
    }));
  };
  const cleanVenue = placeDetails.name;

  let cleanLocation = placeDetails.address;
  if (cleanLocation && cleanLocation.includes(",")) {
    const parts = cleanLocation.split(",");
    cleanLocation = parts.slice(0, 2).join(", ").trim();
  }

  setFormData((prev) => ({
    ...prev,
    location: cleanLocation, // Store only city, district
    venue: cleanVenue, // Store just the venue name
  }));

  const nextStep = () => {
    // Just move to next step, no validation required
    setActiveStep((prev) => prev + 1);
    setStatus({ type: "", msg: "" });
  };

  const prevStep = () => {
    setActiveStep((prev) => prev - 1);
    setStatus({ type: "", msg: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    const data = new FormData();

    // Combine date and time if both exist
    const eventDateTime =
      formData.date && formData.time
        ? `${formData.date}T${formData.time}`
        : formData.date || "";

    // Append all form data
    Object.keys(formData).forEach((key) => {
      if (key === "tags" || key === "highlights") {
        if (formData[key].length > 0) {
          data.append(key, JSON.stringify(formData[key]));
        }
      } else if (key !== "time") {
        const value = key === "date" ? eventDateTime : formData[key];
        if (value !== "" && value !== null && value !== undefined) {
          data.append(key, value);
        }
      }
    });

    // Add location details if available
    if (selectedLocation) {
      data.append("location_details", JSON.stringify(selectedLocation));
    }

    // Append images
    imageFiles.forEach((file) => data.append("images", file));

    try {
      await api.post("/events", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({
        type: "success",
        msg: "Event created successfully! Redirecting...",
      });
      setTimeout(() => navigate("/my-events"), 2000);
    } catch (err) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Failed to create event",
      });
      setIsSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            Create Your Event
          </h1>
          <p className="text-gray-500 mt-2">
            Share your experience with the world
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = activeStep === step.id;
              const isCompleted = activeStep > step.id;

              return (
                <React.Fragment key={step.id}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isActive
                          ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                          : isCompleted
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                      }`}
                      onClick={() => setActiveStep(step.id)}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>
                    <span
                      className={`text-xs mt-2 font-medium ${
                        isActive ? "text-orange-600" : "text-gray-500"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 ${
                        activeStep > step.id ? "bg-green-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
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

        <form onSubmit={handleSubmit}>
          {/* Step 1: Basic Info - NO REQUIRED */}
          {activeStep === 1 && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Basic Information
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Event Title
                    </label>
                    <div className="relative">
                      <Type className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                        placeholder="e.g., Summer Music Festival 2024"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Date
                      </label>
                      <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Time
                      </label>
                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="time"
                          name="time"
                          value={formData.time}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                      >
                        <option value="">Select category</option>
                        <option value="Music">🎵 Music & Concerts</option>
                        <option value="Business">
                          💼 Business & Networking
                        </option>
                        <option value="Tech">💻 Technology</option>
                        <option value="Food">🍔 Food & Drink</option>
                        <option value="Art">🎨 Arts & Culture</option>
                        <option value="Sports">⚽ Sports & Fitness</option>
                        <option value="Education">📚 Education</option>
                        <option value="Other">✨ Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Event Format
                      </label>
                      <select
                        name="eventType"
                        value={formData.eventType}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                      >
                        <option value="offline">📍 In-Person</option>
                        <option value="online">🌐 Online</option>
                        <option value="hybrid">🔄 Hybrid</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Price (USD)
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="price"
                          step="0.01"
                          placeholder="0.00 (Free)"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Capacity
                      </label>
                      <div className="relative">
                        <Users className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          name="availableSeats"
                          placeholder="Unlimited"
                          value={formData.availableSeats}
                          onChange={handleChange}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Media - NO REQUIRED */}
          {activeStep === 2 && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Event Media
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Event Images
                  </label>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                    {previews.map((src, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-2xl overflow-hidden bg-gray-100"
                      >
                        <img
                          src={src}
                          alt={`Preview ${index}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-red-500 text-white rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}

                    {previews.length < 10 && (
                      <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-2xl hover:border-orange-400 hover:bg-orange-50 cursor-pointer transition-all group">
                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-orange-500 mb-2" />
                        <span className="text-xs text-gray-500">
                          Upload Image
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          multiple
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                    )}
                  </div>

                  <p className="text-xs text-gray-500">
                    Upload up to 10 images (optional). First image will be the
                    cover if uploaded.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location - FREE MAP OPTIONS */}
          {activeStep === 3 && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Location Details
                </h2>

                {formData.eventType !== "online" ? (
                  <div className="space-y-6">
                    {/* Location Method Toggle */}
                    <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
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
                      <MapPicker onLocationSelect={handleLocationSelect} />
                    )}

                    {selectedLocation && (
                      <div className="mt-4 p-4 bg-green-50 rounded-2xl border border-green-200">
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              Location Selected
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedLocation.address}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              📍 Lat: {selectedLocation.lat?.toFixed(3)}, Lng:{" "}
                              {selectedLocation.lng?.toFixed(3)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="location"
                        placeholder="https://zoom.us/..."
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Details - NO REQUIRED */}
          {activeStep === 4 && (
            <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Event Details
                </h2>

                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      rows="6"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all resize-none"
                      placeholder="Describe your event... What can attendees expect? (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" && (e.preventDefault(), addTag())
                          }
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                          placeholder="Add a tag (optional)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-4 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-medium"
                        >
                          #{tag}
                          <X
                            className="w-3.5 h-3.5 cursor-pointer hover:text-red-500"
                            onClick={() => removeListItem("tags", i)}
                          />
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Key Highlights
                    </label>
                    <div className="flex gap-2 mb-3">
                      <div className="relative flex-1">
                        <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          value={highlightInput}
                          onChange={(e) => setHighlightInput(e.target.value)}
                          onKeyDown={(e) =>
                            e.key === "Enter" &&
                            (e.preventDefault(), addHighlight())
                          }
                          className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                          placeholder="What makes your event special? (optional)"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addHighlight}
                        className="px-4 py-2.5 bg-gray-900 text-white rounded-xl font-semibold hover:bg-black transition-colors"
                      >
                        Add
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.highlights.map((highlight, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 group"
                        >
                          <span className="text-gray-700">✨ {highlight}</span>
                          <X
                            className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer"
                            onClick={() => removeListItem("highlights", i)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {activeStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="flex-1 py-4 px-6 bg-white text-gray-700 font-semibold rounded-2xl border-2 border-gray-200 hover:bg-gray-50 transition-all"
              >
                ← Previous
              </button>
            )}

            {activeStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="flex-1 py-4 px-6 bg-orange-600 text-white font-semibold rounded-2xl hover:bg-orange-700 transition-all shadow-lg"
              >
                Continue →
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Event...
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-5 h-5" />
                    Create Event
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
