// src/pages/Event.jsx
import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, Search as SearchIcon, X } from "lucide-react";
import QuickFilter from "../components/common/CategoryFilter";
import EventCard from "../components/events/EventCard";
import api from "../api/axiosConfig";

const Event = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredEvents, setFilteredEvents] = useState([]);

  // Get search params from URL
  const currentCategory = searchParams.get("category") || "All";
  const searchQuery = searchParams.get("q") || "";
  const searchLocation = searchParams.get("location") || "";
  const dateFilter = searchParams.get("date") || "All";

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      filterEvents();
    }
  }, [currentCategory, searchQuery, searchLocation, dateFilter, events]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get("/events");
      setEvents(response.data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to check if location matches
  const isLocationMatch = (eventLocation, searchLocationTerm) => {
    if (!searchLocationTerm) return true;
    if (!eventLocation) return false;

    const eventLocLower = eventLocation.toLowerCase();
    const searchLower = searchLocationTerm.toLowerCase();

    return (
      eventLocLower.includes(searchLower) ||
      searchLower.includes(eventLocLower) ||
      eventLocLower
        .split(/[, ]+/)
        .some((part) => searchLower.includes(part) && part.length > 2)
    );
  };

  // Helper function to check if query matches
  const isQueryMatch = (event, searchQueryTerm) => {
    if (!searchQueryTerm) return true;

    const queryLower = searchQueryTerm.toLowerCase();

    return (
      (event.title && event.title.toLowerCase().includes(queryLower)) ||
      (event.category && event.category.toLowerCase().includes(queryLower)) ||
      (event.description &&
        event.description.toLowerCase().includes(queryLower)) ||
      (event.location && event.location.toLowerCase().includes(queryLower))
    );
  };

  // Helper function to check date filter
  const isDateMatch = (eventDate) => {
    if (dateFilter === "All") return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateObj = new Date(eventDate);
    eventDateObj.setHours(0, 0, 0, 0);

    if (dateFilter === "Today") {
      return eventDateObj.getTime() === today.getTime();
    }

    if (dateFilter === "ThisWeek") {
      // Get start of week (Sunday)
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      // Get end of week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);

      return eventDateObj >= startOfWeek && eventDateObj <= endOfWeek;
    }

    return true;
  };

  const filterEvents = () => {
    let results = [...events];

    // 1. Filter by category
    if (currentCategory !== "All") {
      results = results.filter(
        (event) =>
          event.category?.toLowerCase() === currentCategory.toLowerCase(),
      );
    }

    // 2. Filter by search query
    if (searchQuery) {
      results = results.filter((event) => isQueryMatch(event, searchQuery));
    }

    // 3. Filter by location
    if (searchLocation) {
      results = results.filter((event) =>
        isLocationMatch(event.location, searchLocation),
      );
    }

    // 4. Filter by date
    if (dateFilter !== "All") {
      results = results.filter((event) => isDateMatch(event.date));
    }

    setFilteredEvents(results);
  };

  const handleCategoryChange = (category) => {
    const params = new URLSearchParams(searchParams);
    if (category === "All") {
      params.delete("category");
    } else {
      params.set("category", category);
    }
    navigate(`/events?${params.toString()}`);
  };

  const handleDateFilterChange = (filter) => {
    const params = new URLSearchParams(searchParams);
    if (filter === "All") {
      params.delete("date");
    } else {
      params.set("date", filter);
    }
    navigate(`/events?${params.toString()}`);
  };

  const clearSearch = () => {
    navigate("/events");
  };

  const removeFilter = (filterType) => {
    const params = new URLSearchParams(searchParams);
    if (filterType === "category") {
      params.delete("category");
    } else if (filterType === "location") {
      params.delete("location");
    } else if (filterType === "query") {
      params.delete("q");
    } else if (filterType === "date") {
      params.delete("date");
    }
    navigate(`/events?${params.toString()}`);
  };

  const hasActiveFilters =
    searchQuery ||
    searchLocation ||
    currentCategory !== "All" ||
    dateFilter !== "All";

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
        {/* Header with Date Filters */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Events
              </h1>
              <p className="text-gray-600 mt-1">
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"} found
                {hasActiveFilters && (
                  <span className="text-orange-600 ml-2">(filtered)</span>
                )}
              </p>
            </div>

            {/* Date Filters - Clean text with underline */}
            <div className="flex gap-6">
              <button
                onClick={() => handleDateFilterChange("All")}
                className={`pb-1 text-sm ${
                  dateFilter === "All"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => handleDateFilterChange("Today")}
                className={`pb-1 text-sm ${
                  dateFilter === "Today"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => handleDateFilterChange("ThisWeek")}
                className={`pb-1 text-sm ${
                  dateFilter === "ThisWeek"
                    ? "text-orange-500 border-b-2 border-orange-500"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                This Week
              </button>
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
                  Search: {searchQuery}
                  <button
                    onClick={() => removeFilter("query")}
                    className="hover:text-orange-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {searchLocation && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
                  Location: {searchLocation}
                  <button
                    onClick={() => removeFilter("location")}
                    className="hover:text-blue-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {currentCategory !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                  Category: {currentCategory}
                  <button
                    onClick={() => removeFilter("category")}
                    className="hover:text-green-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              {dateFilter !== "All" && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                  {dateFilter === "Today" ? "Today" : "This Week"}
                  <button
                    onClick={() => removeFilter("date")}
                    className="hover:text-purple-900"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}
              <button
                onClick={clearSearch}
                className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Quick Filter Component */}
        <QuickFilter
          currentCategory={currentCategory}
          onCategoryChange={handleCategoryChange}
        />

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm mt-8">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <SearchIcon className="w-12 h-12 text-gray-400" />
              </div>
              <p className="text-gray-500 text-lg mb-2">No events found</p>
              <p className="text-gray-400 text-sm mb-4">
                {searchQuery && `for "${searchQuery}" `}
                {searchLocation && `in "${searchLocation}" `}
                {currentCategory !== "All" && `in ${currentCategory} `}
                {dateFilter !== "All" &&
                  `${dateFilter === "Today" ? "today" : "this week"}`}
              </p>
              <div className="text-sm text-gray-500 mb-4">
                <p>Try:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>Checking your spelling</li>
                  <li>Using fewer keywords</li>
                  <li>Removing some filters</li>
                </ul>
              </div>
              <button
                onClick={clearSearch}
                className="text-orange-500 hover:text-orange-600 font-medium transition-colors"
              >
                Clear all filters
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
