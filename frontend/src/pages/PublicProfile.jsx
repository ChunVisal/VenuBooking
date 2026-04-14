// src/pages/PublicProfile.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  Calendar,
  CalendarDays,
  Users,
  MessageSquare,
  ExternalLink,
  Eye,
} from "lucide-react";
import api from "../api/axiosConfig";
import toast from "react-hot-toast";
import ShareButton from "../components/common/ShareButton";

function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/auth/user/${username}`);
        setUser(response.data.user);
        setEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching profile:", err);
        toast.error("User not found");
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUserProfile();
    }
  }, [username]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getEventImage = (image) => {
    if (!image) return null;
    try {
      if (typeof image === "string") {
        const parsed = JSON.parse(image);
        return Array.isArray(parsed) ? parsed[0] : parsed;
      }
      if (Array.isArray(image)) {
        return image[0];
      }
      return image;
    } catch (e) {
      return image;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="h-8 w-8 animate-spin border-2 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The user you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-slate-900 font-sans antialiased">
      {/* Background Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-orange-600 md:h-64">
        {user.background_image ? (
          <img
            src={user.background_image}
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => setSelectedImage(user.background_image)}
            alt="Banner"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-r from-orange-500 to-orange-700 opacity-90" />
        )}
      </div>

      {/* Fullscreen Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <img
            src={selectedImage}
            alt="Full Size"
            className="max-w-full max-h-full rounded-lg shadow-lg"
          />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-15 sm:-mt-25">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between md:space-x-5">
            <div className="flex items-center space-x-5">
              {/* Profile Avatar */}
              <div className="relative">
                <img
                  src={
                    user.profile_image ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=ff7e00&color=fff&bold=true&size=160`
                  }
                  onClick={() =>
                    user.profile_image && setSelectedImage(user.profile_image)
                  }
                  className={`${user.profile_image ? "cursor-pointer" : ""} h-32 w-32 rounded-2xl ring-4 ring-white object-cover bg-white shadow-md md:h-40 md:w-40`}
                  alt={user.username}
                />
              </div>

              {/* User Identity & Join Date */}
              <div className="pt-15 sm:pt-27">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {user.username}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1">
                    <Mail size={14} className="text-gray-500" />
                    {user.email}
                  </p>
                  <span className="hidden sm:block text-gray-300">|</span>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    Joined: {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Button */}
            <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
              <a
                href={`mailto:${user.email}`}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Mail className="mr-2 h-4 w-4 text-gray-500" />
                Contact
              </a>
              <ShareButton type="profile" id={username} title={username} />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3 pb-12">
          {/* Left Column - User Info */}
          <section className="space-y-6 lg:col-start-1 lg:col-span-2">
            {/* Bio Section */}
            <div className="bg-white p-3 shadow-sm ring-1 ring-gray-900/5 rounded-xl">
              <div className="px-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-orange-600" />
                  About {user.username}
                </h2>
              </div>
              <div className="px-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {user.bio || `${user.username} hasn't added a bio yet.`}
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-4 border-t border-gray-50">
                  {user.job && (
                    <div className="flex items-center gap-2">
                      <Briefcase size={20} className="text-gray-600" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500">
                          Job
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.job}
                        </p>
                      </div>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2">
                      <MapPin size={20} className="text-gray-600" />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-500">
                          Location
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          {user.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {user.message && (
                  <div className="mt-4 p-3 bg-orange-50 rounded-lg border border-orange-100">
                    <div className="flex items-start gap-2">
                      <MessageSquare
                        size={16}
                        className="text-orange-500 mt-0.5"
                      />
                      <div>
                        <p className="text-xs font-semibold text-orange-600 uppercase">
                          Message from {user.username}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {user.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Right Column - Stats & Quick Info */}
          <section className="lg:col-start-3 lg:col-span-1 space-y-6">
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 border-b border-gray-100">
                <h2 className="text-sm pt-2 font-bold text-gray-900 uppercase tracking-wider">
                  About This Profile
                </h2>
                <p className="text-xs opacity-90 mt-1 text-gray-600">
                  {user.username} has been a member since{" "}
                  {formatDate(user.created_at)}
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CalendarDays size={16} className="text-orange-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Events Created
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">
                    {events.length}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Events Section */}
        <div className="mt-8 pb-12">
          <div className="bg-white shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CalendarDays size={18} className="text-orange-600" />
                Events by {user.username}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {events.length} {events.length === 1 ? "event" : "events"}{" "}
                created
              </p>
            </div>

            {events.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">
                  {user.username} hasn't created any events yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {events.map((event) => {
                  const imageUrl = getEventImage(event.image);
                  return (
                    <Link
                      key={event.id}
                      to={`/event/${event.id}`}
                      className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="h-48 overflow-hidden bg-gray-100">
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                            <CalendarDays className="w-12 h-12 text-orange-400" />
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        {event.venue && (
                          <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                            <MapPin className="w-3 h-3" />
                            <span className="line-clamp-1">{event.venue}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                          {event.price > 0 ? (
                            <span className="text-orange-600 font-bold text-lg">
                              ${event.price}
                            </span>
                          ) : (
                            <span className="text-green-600 font-semibold text-sm">
                              Free
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500 group-hover:text-orange-600 transition-colors">
                            View Event
                            <ExternalLink className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PublicProfile;
