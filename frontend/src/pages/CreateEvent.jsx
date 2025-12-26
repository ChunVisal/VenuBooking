// src/pages/CreateEventPage.jsx

import React, { useState, useContext } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import api from "../api/axiosConfig";
import { AuthContext } from "../context/AuthContext";

const CreateEventPage = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // ✅ Form fields matching your backend schema
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    venue: "",
    price: "",
    category: "",
    image: "",
    availableSeats: "",
    eventType: "offline", // default
    location: "",
    tags: "",
  });

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Handle Input Change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ✅ Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    if (!formData.title || !formData.date || !formData.venue) {
      setError("Please fill out all required fields.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Convert tags string → array
      const payload = {
        ...formData,
        tags: formData.tags
          ? formData.tags.split(",").map((tag) => tag.trim())
          : [],
        price: formData.price ? parseFloat(formData.price) : 0,
        availableSeats: formData.availableSeats
          ? parseInt(formData.availableSeats)
          : null,
      };

      const res = await api.post("/events", payload);
      setMessage(res.data || "Event created successfully!");

      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        venue: "",
        price: "",
        category: "",
        image: "",
        availableSeats: "",
        eventType: "offline",
        location: "",
        tags: "",
      });

      setTimeout(() => navigate("/my-listings"), 1500);
    } catch (err) {
      console.error("Event creation failed:", err);
      const msg =
        err.response?.data?.error ||
        err.response?.data ||
        "An unexpected error occurred.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Loading / Redirect Protection
  if (loading)
    return (
      <div className="text-center py-10 text-gray-500">
        Checking user status...
      </div>
    );

  if (!currentUser) return <Navigate to="/login" replace />;

  // ✅ Responsive Layout + Tailwind Design
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10 px-4">
      <div className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
          Create New Event 🎟️
        </h2>
        <p className="text-center text-sm text-gray-500 mb-6">
          Posting as <span className="font-semibold">{currentUser.name}</span> (
          {currentUser.email})
        </p>

        {message && (
          <p className="text-green-600 font-semibold bg-green-50 border border-green-200 p-3 rounded mb-4">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 font-semibold bg-red-50 border border-red-200 p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="grid gap-4">
          {/* Event Title */}
          <input
            type="text"
            name="title"
            placeholder="Event Title"
            value={formData.title}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Description */}
          <textarea
            name="description"
            placeholder="Full description of the event..."
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          ></textarea>

          {/* Date & Time */}
          <label className="text-gray-600 font-medium">Date and Time</label>
          <input
            type="datetime-local"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Venue */}
          <input
            type="text"
            name="venue"
            placeholder="Venue (e.g., Tech Hub Center)"
            value={formData.venue}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Price */}
          <input
            type="number"
            name="price"
            placeholder="Price (0 for Free)"
            value={formData.price}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
            step="0.01"
          />

          {/* Category */}
          <input
            type="text"
            name="category"
            placeholder="Category (e.g., Concert, Workshop)"
            value={formData.category}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          {/* Image URL */}
          <input
            type="url"
            name="image"
            placeholder="Image URL"
            value={formData.image}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          {/* Available Seats */}
          <input
            type="number"
            name="availableSeats"
            placeholder="Available Seats (leave blank for unlimited)"
            value={formData.availableSeats}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          {/* Event Type */}
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="offline">Offline</option>
            <option value="online">Online</option>
          </select>

          {/* Location */}
          <input
            type="text"
            name="location"
            placeholder="Address or Link (for online events)"
            value={formData.location}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          {/* Tags */}
          <input
            type="text"
            name="tags"
            placeholder="Tags (comma separated, e.g. music,night,fun)"
            value={formData.tags}
            onChange={handleChange}
            className="p-3 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`p-3 rounded-lg text-white font-semibold transition-all duration-300 ${
              isSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isSubmitting ? "Submitting..." : "Post Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEventPage;
