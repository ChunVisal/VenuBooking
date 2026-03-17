// src/pages/Home/EventList.jsx
import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";
import EventCard from "../../components/events/EventCard";

export default function EventList() {
  const [events, setEvent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllEvents = async () => {
      try {
        const res = await api.get("/events");
        setEvent(res.data);
      } catch (err) {
        console.error("Failed to fetch all events:", err);
        setError("Could not load events. Check your backend server status.");
      } finally {
        setLoading(false);
      }
    };
    fetchAllEvents();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-orange-500 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-4 text-gray-600 text-lg">
            Loading Upcoming Events...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-lg max-w-2xl">
          <div className="flex items-center">
            <svg
              className="h-6 w-6 text-red-500 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <p className="font-medium">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-5">
          <h1 className="items-center text-xl font-bold text-gray-900">
            Upcoming Events
          </h1>
          <div className="flex items-center  gap-2">
              <p className="text-gray-600 text-sm">
                Discover amazing events happening near you
              </p>
              <div className="inline-flex items-center bg-gray-200 shadow-sm text-orange-800 px-4 py-2 rounded-full">
                <span className="font-semibold mr-2">{events.length}</span>
                <span>events available</span>
              </div>
          </div>
        </div>

        {/* Event Grid - Responsive Layout */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
            {events.map((event) => (
              <div key={event.id} className="h-full">
                <EventCard event={event} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
              <svg
                className="h-10 w-10 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              No Events Yet
            </h3>
            <p className="text-gray-600">
              Be the first to create an amazing event!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
