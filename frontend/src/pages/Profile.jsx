import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, Navigate } from "react-router-dom";
import {
  User,
  Mail,
  PlusCircle,
  Settings,
  LogOut,
  MapPin,
  Briefcase,
  Calendar,
  CalendarDays,
  ExternalLink,
} from "lucide-react";
import api from "../api/axiosConfig";
import { useState, useEffect } from "react";
import ShareButton from "../components/common/ShareButton";

function Profile() {
  const { currentUser, loading, logout } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);
  const [myEvents, setMyEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  useEffect(() => {
    const fetchMyEvents = async () => {
      if (!currentUser) return;
      try {
        const response = await api.get(`/events/user/${currentUser.id}`);
        setMyEvents(response.data.events || []);
      } catch (err) {
        console.error("Error fetching events:", err);
      } finally {
        setLoadingEvents(false);
      }
    };
    fetchMyEvents();
  }, [currentUser]);

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

  if (loading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="h-8 w-8 animate-spin border-2 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );

  if (!currentUser) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen  text-slate-900 font-sans antialiased">
      {/* 1. Background Image Section */}
      <div className="relative h-48 w-full overflow-hidden bg-orange-600 md:h-64">
        {currentUser.background_image ? (
          <img
            src={currentUser.background_image}
            className="h-full w-full object-cover cursor-pointer"
            onClick={() => setSelectedImage(currentUser.background_image)}
            alt="Banner"
          />
        ) : (
          /* Fallback gradient if no background image exists */
          <div className="h-full w-full bg-gradient-to-r from-orange-500 to-orange-700 opacity-90" />
        )}
      </div>

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
                    currentUser.profile_image ||
                    `https://ui-avatars.com/api/?name=${currentUser.username}&background=ff7e00&color=fff`
                  }
                  onClick={() => setSelectedImage(currentUser.profile_image)}
                  className="cursor-pointer h-32 w-32 rounded-2xl ring-4 ring-white object-cover bg-white shadow-md md:h-40 md:w-40"
                  alt="User"
                />
              </div>

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

              {/* User Identity & Join Date */}
              <div className="pt-15 sm:pt-27">
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                  {currentUser.username}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                  <p className="text-sm font-medium text-gray-900">
                    {currentUser.email}
                  </p>
                  <span className="hidden sm:block text-gray-300">|</span>
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Calendar size={14} />
                    Joined:{" "}
                    {(() => {
                      const date = new Date(currentUser.created_at);
                      const options = {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      };
                      return date.toLocaleDateString(undefined, options);
                    })()}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-x-reverse sm:space-y-0 sm:space-x-3 md:mt-0 md:flex-row md:space-x-3">
              <Link
                to="/edit-profile"
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <Settings className="mr-2 h-4 w-4 text-gray-500" />
                Edit Profile
              </Link>
              <button
                onClick={logout}
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 transition-colors"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </button>
              <ShareButton
                type="profile"
                id={currentUser.username}
                title={currentUser.username}
              />
            </div>
          </div>
        </div>

        {/* 2. Main Content */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-flow-col-dense lg:grid-cols-3 ">
          {/* Left Column */}
          <section className="space-y-6 lg:col-start-1 lg:col-span-2">
            <div className="bg-white p-3 shadow-sm ring-1 ring-gray-900/5 rounded-xl">
              <div className="px-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User size={18} className="text-orange-600" />
                  Professional Summary
                </h2>
              </div>
              <div className="px-4">
                <p className="text-sm text-gray-700 leading-relaxed">
                  {currentUser.bio ||
                    "Update your bio to showcase about you."}
                </p>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <Briefcase size={20} color="black" />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">
                        Job
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.job || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={20} />
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-500">
                        Location
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {currentUser.address || "Cambodia"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column (Sidebar) */}
          <section className="lg:col-start-3 lg:col-span-1 space-y-6">
            <div className="bg-white shadow-sm rounded-xl overflow-hidden">
              <div className="px-4 sm:px-6 border-b border-gray-100">
                <h2 className="text-sm pt-2 font-bold text-gray-900 uppercase tracking-wider">
                  Quick Access
                </h2>
                <p className="text-xs opacity-90 mt-1 text-gray-600">
                  Access your events, manage bookings, and more from here.
                </p>
              </div>
              <div className="p-4 space-y-3">
                <Link
                  to="/my-events"
                  className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-md text-sm font-bold text-white bg-green-600 hover:bg-green-500 transition-all"
                >
                  <ExternalLink size={16} />
                  View your events
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default Profile;
