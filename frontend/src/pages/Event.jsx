// src/pages/Event.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import QuickFilter from "../components/common/CategoryFilter";
import EventCard from "../components/events/EventCard";
import api from "../api/axiosConfig";

const Event = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Get category from URL params
  const currentCategory = searchParams.get("category") || "All";

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEventsByCategory();
  }, [currentCategory, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data);
      filterEventsByCategory(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterEventsByCategory = (eventsData = events) => {
    if (currentCategory === "All") {
      setFilteredEvents(eventsData);
    } else {
      const filtered = eventsData.filter(
        (event) =>
          event.category?.toLowerCase() === currentCategory.toLowerCase(),
      );
      setFilteredEvents(filtered);
    }
  };

  const handleCategoryChange = (category) => {
    if (category === "All") {
      navigate("/events");
      setSearchParams({});
    } else {
      navigate(`/events?category=${category}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Events
          </h1>
          <p className="text-gray-600 mt-2">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"} found
            {currentCategory !== "All" && ` in ${currentCategory}`}
          </p>
        </div>

        {/* Quick Filter Component */}
        <QuickFilter
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Events Grid - Using EventCard component */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 text-lg">
                No events found in this category.
              </p>
              <button
                onClick={() => handleCategoryChange("All")}
                className="mt-4 text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                View all events
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-8">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Event;
