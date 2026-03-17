import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";
import {
  Loader2,
  Calendar,
  MapPin,
  Tag,
  Users,
  Globe,
  Info,
  Edit3,
  Image as ImageIcon,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Hash,
} from "lucide-react";

const EditEventPage = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();

  // Full state for all DB columns
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    price: 0,
    category: "",
    location: "",
    available_seats: "",
    event_type: "offline",
    tags: [],
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        const event = Array.isArray(res.data) ? res.data[0] : res.data;

        if (!event) throw new Error("Event not found");

        // Format date for datetime-local input
        let formattedDate = "";
        if (event.date) {
          const d = new Date(event.date);
          formattedDate = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
            .toISOString()
            .slice(0, 16);
        }

        setFormData({
          title: event.title || "",
          description: event.description || "",
          date: formattedDate,
          venue: event.venue || "",
          price: event.price || 0,
          category: event.category || "",
          location: event.location || "",
          available_seats: event.available_seats || "",
          event_type: event.event_type || "offline",
          tags: Array.isArray(event.tags) ? event.tags : [],
        });

        if (event.image) setPreviewUrl(event.image);
        setIsLoadingData(false);
      } catch (err) {
        setError("Failed to load event data.");
        setIsLoadingData(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const data = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => {
      if (key === "tags") {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Handle image
    if (imageFile) {
      data.append("image", imageFile);
    } else if (previewUrl && !previewUrl.startsWith("blob:")) {
      data.append("image", previewUrl);
    }

    try {
      const res = await api.put(`/events/${id}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMessage("Event Updated Successfully!");
      setTimeout(() => navigate("/my-events"), 1500);
    } catch (err) {
      console.error("UPDATE ERROR:", err);
      setError(err.response?.data?.error || "Update failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <Edit3 className="w-8 h-8 text-orange-500" />
          Edit Event
        </h1>
        <p className="text-gray-600 mt-2">Update your event details below</p>
      </div>

      {/* Messages */}
      {message && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-green-700 font-medium">{message}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="max-w-4xl mx-auto mb-6">
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* Main Form Card */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Edit3 className="w-5 h-5" />
              Editing: {formData.title}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Image Section */}
              <div className="bg-orange-50 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Image
                </label>
                <div className="flex flex-col items-center">
                  {previewUrl ? (
                    <div className="relative w-full mb-4">
                      <img
                        src={previewUrl}
                        className="w-full h-64 object-cover rounded-xl shadow-md"
                        alt="Event preview"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setPreviewUrl(null);
                        }}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-64 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">No image selected</p>
                    </div>
                  )}

                  <label className="cursor-pointer bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {previewUrl ? "Change Image" : "Upload Image"}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>
              </div>

              {/* Grid Layout for Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="e.g., Summer Music Festival"
                  />
                </div>
                {/* Category */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                  >
                    <option value="">Select category</option>
                    <option value="Music">🎵 Music</option>
                    <option value="Tech">💻 Tech</option>
                    <option value="Fashion">👗 Fashion</option>
                    <option value="Food">🍔 Food & Drink</option>
                    <option value="Business">💼 Business</option>
                    <option value="Sports">⚽ Sports</option>
                  </select>
                </div>
                {/* Date */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <Calendar className="w-4 h-4 inline mr-1 text-orange-500" />
                    Date & Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                  />
                </div>
                {/* Venue */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 inline mr-1 text-orange-500" />
                    Venue
                  </label>
                  <input
                    type="text"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="e.g., Madison Square Garden"
                  />
                </div>
                {/* Price */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <DollarSign className="w-4 h-4 inline mr-1 text-orange-500" />
                    Price ($)
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Enter 0 or leave empty for free events"
                  />
                  {(!formData.price ||
                    formData.price === "0" ||
                    formData.price === 0) && (
                    <p className="text-sm text-green-600 mt-1">
                      ✨ This will be displayed as a FREE event
                    </p>
                  )}
                </div>
                {/* Available Seats */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 inline mr-1 text-orange-500" />
                    Available Seats
                  </label>
                  <input
                    type="number"
                    name="available_seats"
                    value={formData.available_seats}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="e.g., 100"
                  />
                </div>
                {/* Event Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 inline mr-1 text-orange-500" />
                    Event Type
                  </label>
                  <select
                    name="event_type"
                    value={formData.event_type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all bg-white"
                  >
                    <option value="offline">📍 Offline / In-Person</option>
                    <option value="online">🌐 Online / Virtual</option>
                    <option value="hybrid">🔄 Hybrid</option>
                  </select>
                </div>
                {/* Location/Address */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <MapPin className="w-4 h-4 inline mr-1 text-orange-500" />
                    Location / Address
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Full address or virtual meeting link"
                  />
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  <Hash className="w-4 h-4 inline mr-1 text-orange-500" />
                  Tags
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Tags Display */}
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-orange-900"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  <Info className="w-4 h-4 inline mr-1 text-orange-500" />
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="6"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                  placeholder="Describe your event in detail..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => navigate("/my-events")}
                  className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] px-6 py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save All Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditEventPage;
