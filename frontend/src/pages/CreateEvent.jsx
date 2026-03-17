import React, { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
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
  Image as ImageIcon,
  DollarSign,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Hash,
  Sparkles,
  PlusCircle,
} from "lucide-react";

const CreateEventPage = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Form fields matching backend schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    price: "",
    category: "",
    availableSeats: "",
    eventType: "offline",
    location: "",
    tags: [],
  });

  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setPreview(null);
  };

  // Tag management
  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setMessage("");

    const data = new FormData();

    // Append basic fields
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("date", formData.date);
    data.append("venue", formData.venue);
    data.append("price", formData.price || 0);
    data.append("category", formData.category);
    data.append("eventType", formData.eventType);
    data.append("location", formData.location);
    data.append("availableSeats", formData.availableSeats);
    data.append("tags", JSON.stringify(formData.tags));

    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      const res = await api.post("/events", data, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });

      setMessage("Event Created Successfully!");
      setTimeout(() => navigate("/my-events"), 1500);
    } catch (err) {
      console.log("Full Error Object:", err);
      if (!err.response) {
        setError("Server crashed or Network Error. Check your Backend Terminal!");
      } else {
        setError(err.response.data.error || "Something went wrong");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading / Redirect Protection
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Checking user status...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gradient-to-br  to-white py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-800">Create New Event</h1>
        </div>
        <p className="text-gray-600 ml-11">
          Posting as <span className="font-semibold text-gray-900">{currentUser.email || currentUser.email}</span>
        </p>
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
              <PlusCircle className="w-5 h-5" />
              Event Details
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-8">
            <div className="space-y-8">
              {/* Image Section */}
              <div className="bg-orange-50 rounded-xl p-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Event Poster
                </label>
                <div className="flex flex-col items-center">
                  {preview ? (
                    <div className="relative w-full mb-4">
                      <img
                        src={preview}
                        className="w-full h-64 object-cover rounded-xl shadow-md"
                        alt="Event preview"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center mb-4 hover:border-orange-400 transition-colors">
                      <ImageIcon className="w-12 h-12 text-gray-400 mb-2" />
                      <p className="text-gray-500">Click to upload event poster</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                  
                  <label className="cursor-pointer bg-white border-2 border-orange-500 text-orange-500 hover:bg-orange-50 px-6 py-3 rounded-xl font-medium transition-colors inline-flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" />
                    {preview ? 'Change Image' : 'Upload Image'}
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
                {/* Event Title */}
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
                    <option value="Art">🎨 Art</option>
                    <option value="Education">📚 Education</option>
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
                    placeholder="0.00 (Free)"
                  />
                </div>

                {/* Available Seats */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <Users className="w-4 h-4 inline mr-1 text-orange-500" />
                    Available Seats
                  </label>
                  <input
                    type="number"
                    name="availableSeats"
                    value={formData.availableSeats}
                    onChange={handleChange}
                    min="1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    placeholder="e.g., 100 (leave blank for unlimited)"
                  />
                </div>

                {/* Event Type */}
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 inline mr-1 text-orange-500" />
                    Event Type
                  </label>
                  <select
                    name="eventType"
                    value={formData.eventType}
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
                        #{tag}
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
                <p className="text-xs text-gray-500 mt-1">
                  Add relevant tags to help people find your event
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  <Info className="w-4 h-4 inline mr-1 text-orange-500" />
                  Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows="6"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                  placeholder="Describe your event in detail... What makes it special? What can attendees expect?"
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
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="w-5 h-5" />
                      Create Event
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

export default CreateEventPage;