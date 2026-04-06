// src/components/common/AccountProfile.jsx
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  User,
  LogOut,
  Settings,
  Calendar,
  Heart,
  BookOpen,
} from "lucide-react";

const AccountProfile = ({ currentUser, onLogout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleImageClick = () => {
    setIsOpen(!isOpen);
  };

  const menuItems = [
    // user create events
    { name: "My Events", icon: Calendar, to: "/my-events" },
    { name: "My Bookings", icon: BookOpen, to: "/my-bookings" },
    { name: "Wishlist", icon: Heart, to: "/wishlist" },
    { name: "Settings", icon: Settings, to: "/settings" },
  ];

  if (!currentUser) {
    return (
      <Link
        to="/login"
        className="hidden md:flex items-center space-x-1 border border-gray-200 px-4 py-1 rounded-full bg-orange-50 hover:bg-orange-100 text-sm whitespace-nowrap text-orange-700 font-semibold transition-colors"
      >
        <User className="w-4 h-4" />
        <span>Account / Sign In</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Image Button */}
      <button
        onClick={handleImageClick}
        className="flex items-center space-x-3 focus:outline-none group"
        aria-label="Profile menu"
      >
        {currentUser.profile_image ? (
          <img
            src={currentUser.profile_image}
            alt={currentUser.username}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-gray-200 group-hover:border-orange-400 transition-colors"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center border-1 border-orange-200 group-hover:border-orange-400 transition-colors">
            <span className="text-orange-600 font-semibold text-lg">
              {currentUser.username?.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-60 bg-white rounded-md shadow-lg border border-gray-100 py-2 z-50 animate-fadeIn">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <Link to="/profile" className="flex items-center space-x-3">
              {currentUser.profile_image ? (
                <img
                  src={currentUser.profile_image}
                  alt={currentUser.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-xl">
                    {currentUser.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">
                  {currentUser.username}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {currentUser.email}
                </p>
              </div>
            </Link>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* Logout Button */}
          <div className="border-t border-gray-100 pt-2">
            <button
              onClick={() => {
                setIsOpen(false);
                onLogout();
              }}
              className="flex items-center space-x-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountProfile;
