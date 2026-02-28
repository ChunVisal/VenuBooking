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
} from "lucide-react";

const Profile = () => {
  const { currentUser, loading, logout } = useContext(AuthContext);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-orange-500">
        Loading...
      </div>
    );
  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Banner Section */}
      <div className="h-48 bg-gradient-to-r from-orange-600 to-red-600 relative">
        {currentUser.background_image && (
          <img
            src={currentUser.background_image}
            className="w-full h-full object-cover opacity-50"
            alt="Banner"
          />
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="relative -mt-20 flex flex-col items-center md:items-start md:flex-row md:space-x-8 pb-8">
          {/* Avatar */}
          <img
            src={currentUser.profile_image || "https://via.placeholder.com/150"}
            className="w-40 h-40 rounded-full border-4 border-gray-900 object-cover shadow-2xl bg-gray-800"
          />

          <div className="mt-6 md:mt-24 flex-grow text-center md:text-left">
            <h1 className="text-4xl font-bold">{currentUser.username}</h1>
            <p className="text-orange-400 font-medium">
              {currentUser.job || "Event Planner"}
            </p>
          </div>

          <div className="mt-6 md:mt-24">
            <Link
              to="/edit-profile"
              className="flex items-center px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:bg-gray-700 transition-all"
            >
              <Settings className="w-4 h-4 mr-2" /> Edit Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
          {/* Left Side: Info */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
              <h3 className="font-bold text-lg mb-4">About Me</h3>
              <p className="text-gray-400 text-sm leading-relaxed">
                {currentUser.bio ||
                  "No bio yet. Tell the world about your events!"}
              </p>
              <div className="mt-4 space-y-3 text-sm text-gray-300">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-orange-500" />{" "}
                  {currentUser.address || "Cambodia"}
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2 text-orange-500" />{" "}
                  {currentUser.email}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Actions */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/create-event"
                className="p-6 bg-orange-600 rounded-2xl hover:bg-orange-700 transition-all group"
              >
                <PlusCircle className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" />
                <h4 className="font-bold text-lg">New Event</h4>
                <p className="text-orange-200 text-xs">
                  Host a new venue listing
                </p>
              </Link>
              <button
                onClick={logout}
                className="p-6 bg-gray-800 rounded-2xl hover:bg-red-900/20 border border-gray-700 transition-all text-left"
              >
                <LogOut className="w-8 h-8 mb-2 text-red-500" />
                <h4 className="font-bold text-lg">Logout</h4>
                <p className="text-gray-500 text-xs">
                  End your current session
                </p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
