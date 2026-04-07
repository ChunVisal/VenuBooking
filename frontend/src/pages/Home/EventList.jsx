// src/pages/Home/EventList.jsx
import { useState, useEffect } from "react";
import { MapPin, Navigation } from "lucide-react";
import api from "../../api/axiosConfig";
import EventCard from "../../components/events/EventCard";

export default function EventList() {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDateFilter, setSelectedDateFilter] = useState("All");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [availableLocations, setAvailableLocations] = useState([]);

  useEffect(() => {
    fetchAllEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      const locations = [
        ...new Set(events.map((event) => event.location).filter(Boolean)),
      ];
      setAvailableLocations(locations);
      filterEvents();
    }
  }, [events, selectedLocation, selectedDateFilter]);

  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error("Failed to fetch all events:", err);
      setError("Could not load events.");
    } finally {
      setLoading(false);
    }
  };

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

  const filterEvents = () => {
    let filtered = [...events];

    if (selectedLocation) {
      filtered = filtered.filter((event) =>
        event.location?.toLowerCase().includes(selectedLocation.toLowerCase()),
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
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Filters - Clean text only */}
      <div className="flex items-center justify-between mb-6">
        {/* Date Filters */}
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

        {/* Browse Location */}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500">No events found</p>
        </div>
      )}
    </div>
  );
}
