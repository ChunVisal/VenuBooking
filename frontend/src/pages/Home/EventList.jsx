// src/pages/Home/EventList.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Navigation, Loader2 } from "lucide-react";
import api from "../../api/axiosConfig";
import EventCard from "../../components/events/EventCard";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);
  const [allEvents, setAllEvents] = useState([]);

  const scrollRef = useRef(null);
  const observerRef = useRef(null);
  const loadMoreRef = useRef(null);

  // Fetch events with pagination
  const fetchEvents = async (pageNum, isLoadMore = false) => {
    try {
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res = await api.get(`/events?page=${pageNum}&limit=9`);
      const newEvents = res.data.events;

      if (pageNum === 1) {
        setEvents(newEvents);
        setAllEvents(newEvents);
      } else {
        setEvents((prev) => [...prev, ...newEvents]);
        setAllEvents((prev) => [...prev, ...newEvents]);
      }

      setHasMore(pageNum < res.data.totalPages);
      setTotal(res.data.totalEvents);
    } catch (err) {
      console.error("Failed to fetch events:", err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchEvents(1, false);
  }, []);

  // Infinite scroll using Intersection Observer
  useEffect(() => {
    if (loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchEvents(nextPage, true);
        }
      },
      { threshold: 0.1, rootMargin: "100px" }, // Trigger 100px before bottom
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [loadMoreRef.current, hasMore, loadingMore, page]);

  // Filter events
  useEffect(() => {
    if (allEvents.length > 0) {
      const locations = [
        ...new Set(allEvents.map((event) => event.location).filter(Boolean)),
      ];
      setAvailableLocations(locations);

      let filtered = [...allEvents];

      if (selectedLocation) {
        filtered = filtered.filter((event) =>
          event.location
            ?.toLowerCase()
            .includes(selectedLocation.toLowerCase()),
        );
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const thisWeekStart = new Date(today);
      thisWeekStart.setDate(today.getDate() - today.getDay());
      const thisWeekEnd = new Date(thisWeekStart);
      thisWeekEnd.setDate(thisWeekStart.getDate() + 6);

      if (selectedDateFilter === "Today") {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate.getTime() === today.getTime();
        });
      } else if (selectedDateFilter === "ThisWeek") {
        filtered = filtered.filter((event) => {
          const eventDate = new Date(event.date);
          return eventDate >= thisWeekStart && eventDate <= thisWeekEnd;
        });
      }

      setFilteredEvents(filtered);
    }
  }, [selectedLocation, selectedDateFilter, allEvents]);

  const getUserCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
          );
          const data = await response.json();
          const city =
            data.address?.city || data.address?.town || data.address?.state;
          if (city) setSelectedLocation(city);
        } catch (error) {
          console.error("Error:", error);
        }
      },
      (error) => {
        alert("Unable to get your location");
      },
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading && page === 1) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-6">
          <button
            onClick={() => setSelectedDateFilter("All")}
            className={`pb-1 text-sm ${
              selectedDateFilter === "All"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setSelectedDateFilter("Today")}
            className={`pb-1 text-sm ${
              selectedDateFilter === "Today"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setSelectedDateFilter("ThisWeek")}
            className={`pb-1 text-sm ${
              selectedDateFilter === "ThisWeek"
                ? "text-orange-500 border-b-2 border-orange-500"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            This Week
          </button>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <MapPin size={14} />
            <span>{selectedLocation || "Browse Location"}</span>
          </button>

          {showLocationDropdown && (
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[180px]">
              <button
                onClick={() => {
                  setSelectedLocation("");
                  setShowLocationDropdown(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50"
              >
                All Locations
              </button>
              {availableLocations.map((loc, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedLocation(loc);
                    setShowLocationDropdown(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-t border-gray-100"
                >
                  {loc}
                </button>
              ))}
              <button
                onClick={() => {
                  getUserCurrentLocation();
                  setShowLocationDropdown(false);
                }}
                className="block w-full text-left px-3 py-2 text-sm text-orange-500 hover:bg-gray-50 border-t border-gray-100"
              >
                <Navigation size={12} className="inline mr-1" />
                Use my location
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-400 mb-6">
        {filteredEvents.length} events
      </p>

      {/* Event Grid */}
      {filteredEvents.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {/* Sentinel element for infinite scroll */}
          {hasMore && (
            <div ref={loadMoreRef} className="py-8 flex justify-center">
              {loadingMore && (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Loading more events...</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </div>
  );
}
