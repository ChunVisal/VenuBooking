import React, { useState, useContext } from "react";
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
} from "lucide-react";

const CreateEventPage = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  const [imageFiles, setImageFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

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
    highlights: [], // Start empty for a cleaner UI
  });

  const [tagInput, setTagInput] = useState("");
  const [highlightInput, setHighlightInput] = useState("");

  // Generic Change Handler
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Image Logic
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Tags Logic
  const addTag = () => {
    const val = tagInput.trim();
    if (val && !formData.tags.includes(val)) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, val] }));
      setTagInput("");
    }
  };

  // Highlights Logic
  const addHighlight = () => {
    const val = highlightInput.trim();
    if (val) {
      setFormData((prev) => ({ ...prev, highlights: [...prev.highlights, val] }));
      setHighlightInput("");
    }
  };

  const removeListItem = (listName, index) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: "", msg: "" });

    const data = new FormData();
    // Append standard fields
    Object.keys(formData).forEach((key) => {
      if (key === "tags" || key === "highlights") {
        data.append(key, JSON.stringify(formData[key]));
      } else {
        data.append(key, formData[key]);
      }
    });

    // Append images
    imageFiles.forEach((file) => data.append("images", file));

    try {
      await api.post("/events", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStatus({ type: "success", msg: "Event created successfully! Redirecting..." });
      setTimeout(() => navigate("/my-events"), 2000);
    } catch (err) {
      setStatus({ type: "error", msg: err.response?.data?.error || "Failed to create event" });
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-10 h-10 animate-spin text-orange-500 mb-4" />
      <p className="text-gray-500 font-medium">Preparing your workspace...</p>
    </div>
  );

  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#fcfcfd] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-3 mb-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Sparkles className="w-6 h-6 text-orange-600" />
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Create Event</h1>
          </div>
          <p className="text-gray-500">Launch your next experience from <span className="text-orange-600 font-medium">{currentUser.email}</span></p>
        </div>

        {/* Status Alerts */}
        {status.msg && (
          <div className={`mb-8 p-4 rounded-xl flex items-center gap-3 border ${
            status.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"
          }`}>
            {status.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span className="font-medium">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Media Upload */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-orange-500" /> Event Visuals
            </h2>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {previews.map((src, index) => (
                <div key={index} className="group relative aspect-video sm:aspect-square overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
                  <img src={src} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-red-500 hover:text-white text-gray-700 rounded-full shadow-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              <label className="aspect-video sm:aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50/50 cursor-pointer transition-all group">
                <div className="p-3 bg-gray-50 rounded-full group-hover:bg-orange-100 transition-colors">
                  <PlusCircle className="w-6 h-6 text-gray-400 group-hover:text-orange-500" />
                </div>
                <span className="mt-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Add Image</span>
                <input type="file" className="hidden" multiple accept="image/*" onChange={handleFileChange} />
              </label>
            </div>
          </section>

          {/* 2. Core Details */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Type className="w-5 h-5 text-orange-500" /> General Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Event Title</label>
                <input
                  required
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                  placeholder="The Ultimate Tech Networking Night"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all appearance-none"
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
                  <Calendar className="w-4 h-4 text-gray-400" /> Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="date"
                  value={formData.date}
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

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-gray-400" /> Venue / Link
                </label>
                <input
                  name="location"
                  placeholder="Street address or Zoom link"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>
          </section>

          {/* 3. Description & Lists */}
          <section className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Info className="w-5 h-5 text-orange-500" /> Content & Discovery
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Tell your story..."
                />
              </div>

              {/* Tags Section */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-1.5">
                  <Hash className="w-4 h-4 text-gray-400" /> Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 transition-all"
                    placeholder="E.g. Networking"
                  />
                  <button type="button" onClick={addTag} className="px-5 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((t, i) => (
                    <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-lg text-sm font-bold border border-orange-100 uppercase tracking-tighter">
                      #{t} <X className="w-3.5 h-3.5 cursor-pointer" onClick={() => removeListItem("tags", i)} />
                    </span>
                  ))}
                </div>
              </div>

              {/* Highlights Section */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Key Highlights</label>
                <div className="flex gap-2 mb-3">
                  <input
                    value={highlightInput}
                    onChange={(e) => setHighlightInput(e.target.value)}
                    className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-orange-400 transition-all"
                    placeholder="E.g. Free drinks for early birds"
                  />
                  <button type="button" onClick={addHighlight} className="px-5 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors">Add</button>
                </div>
                <ul className="space-y-2">
                  {formData.highlights.map((h, i) => (
                    <li key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200 group">
                      <span className="text-gray-700 font-medium">✨ {h}</span>
                      <X className="w-4 h-4 text-gray-400 hover:text-red-500 cursor-pointer" onClick={() => removeListItem("highlights", i)} />
                    </li>
                  ))}
                </ul>
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
              className="flex-[2] py-4 px-6 bg-orange-600 text-white font-bold rounded-2xl hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
              {isSubmitting ? "Publishing..." : "Launch Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;