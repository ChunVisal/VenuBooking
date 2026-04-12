import { useState, useEffect } from "react";
import EventCard from "./EventCard";
import api from "../../api/axiosConfig";

export default function SimilarEvents({ currentEvent }) {
  const [similarEvents, setSimilarEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentEvent) return;

    const fetchSimilarEvents = async () => {
      try {
        const response = await api.get("/events");
        const allEvents = response.data;

        // Filter similar events (same category or location, exclude current)
        const filtered = allEvents
          .filter(
            (event) =>
              event.id !== currentEvent.id &&
              (event.category === currentEvent.category ||
                event.location
                  ?.toLowerCase()
                  .includes(
                    currentEvent.location?.split(",")[0]?.toLowerCase() || "",
                  )),
          )
          .slice(0, 6);

        setSimilarEvents(filtered);
      } catch (error) {
        console.error("Error fetching similar events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSimilarEvents();
  }, [currentEvent]);

  if (loading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-xl h-64 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (similarEvents.length === 0) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {similarEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
