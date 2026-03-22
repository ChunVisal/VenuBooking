import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axiosConfig";
import {
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  DollarSign,
  Users,
  Image,
  Tag,
} from "lucide-react";

const MyEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events/user/events");
        setEvents(res.data);
        console.log("events: ", res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load your events. Please try again.");
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(events.filter((event) => event.id !== eventId));
    } catch (err) {
      alert("Failed to delete event.");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Your Events {events.length}
            </h1>
            <p className="text-gray-600">Manage your hosted experiences</p>
          </div>
          <Link
            to="/create-event"
            style={{ fontSize: "13px" }}
            className=" font-bold bg-orange-600 hover:bg-orange-700 text-white px-6 py-2 rounded-md transition-all shadow-lg hover:shadow-orange-200"
          >
            + Create New
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="text-center bg-white rounded-3xl p-20 shadow-sm border border-gray-100">
            <p className="text-xl text-gray-400">
              You haven't listed any events yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 ">
            {events.map((event) => (
              <div
                key={event.id}
                className="group bg-white rounded-lg overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
              >
                {/* Image Section */}
                <Link
                  to={`/event/${event.id}`}
                  className="relative h-50 overflow-hidden"
                >
                  <img
                    src={
                      event.image?.startsWith("[")
                        ? JSON.parse(event.image)[0]
                        : event.image ||
                          `https://source.unsplash.com/800x600/?event,${event.category}`
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 px-2 py-1 rounded-md text-xs font-semibold shadow-sm">
                    {event.category || "No Category"}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-md text-xs font-semibold text-orange-600 shadow-sm">
                    $ {event.price || "Free"}
                  </div>

                  {/* image count length */}
                  {(() => {
                    if (event.image?.startsWith("[")) {
                      const imagesArray = JSON.parse(event.image);
                      if (imagesArray.length >= 2) {
                        return (
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-2 py-1 rounded flex gap-1 items-center">
                            <Image size={15} />
                            {imagesArray.length} Images
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </Link>

                {/* Content Section */}
                <div className="flex-grow px-4 py-3 flex flex-col justify-between">
                  <h2 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">
                    {event.title}
                  </h2>
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-600 text-sm italic font-medium">
                      <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                      {new Date(event.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        timeZone: "UTC",
                      })}
                    </div>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-orange-500" />
                      {event.location && (
                        <p className="text-gray-600 text-sm">
                          {event.location}
                        </p>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-2">
                      {event.description}
                    </p>
                  </div>

                  {/* Footer Actions */}
                  <div className=" bg-gray-50 flex justify-between gap-4">
                    <Link
                      to={`/edit-event/${event.id}`}
                      className="flex-1 flex justify-center items-center gap-2 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium shadow-sm"
                    >
                      <Edit3 className="w-4 h-4" /> Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex-1 flex justify-center items-center gap-2 py-2 bg-white border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;
