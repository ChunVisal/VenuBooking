// src/components/Navbar.jsx
import { useState, useContext } from "react";
import { Plus, Menu, X, Home, User, LogOut, Sun, Moon } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import AccountProfile from "../common/LogoProfile";
import SearchBar from "../common/SearchBar";
import NotificationBell from "../common/NotificationBell";
import { useTheme } from "../../context/ThemeContext";

const Navbar = () => {
  const { currentUser, loading, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Reusable classes
  const navItemClasses =
    "flex items-center space-x-2 text-gray-700 hover:text-orange-600 transition-colors rounded-lg";
  const mobileLinkClasses = "w-full p-3 text-base text-left";
  const desktopLinkClasses = "px-3 py-2 text-sm font-medium";
  const iconButtonClasses =
    "p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full hover:bg-gray-100";

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-100 px-4 sm:px-6 py-3 shadow-md">
        <div className="h-[48px]"></div>
      </nav>
    );
  }

  return (
    <nav className="bg-white border-b border-gray-100 px-4 py-2 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-1">
          <img src="/logo.png" className="h-12 w-auto" alt="Logo" />
          <h6 className="text-gray-900 font-bold text-lg">VenuBooking</h6>
        </Link>

        {/* Right Section */}
        <div className="flex items-center space-x-1">
          {/* Desktop Nav - Direct Link instead of .map */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/create-event"
              className={`${navItemClasses} ${desktopLinkClasses}`}
            >
              <span>Create Event</span>
            </Link>
          </div>

          {/* Utilities */}
          <div className="flex items-center space-x-3">
            <SearchBar />
            <NotificationBell />
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-lg hover:text-orange-600 transition-colors focus:ring-orange-500"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <AccountProfile currentUser={currentUser} onLogout={handleLogout} />

            {/* Mobile Menu Toggle */}
            <button
              aria-label="Toggle Menu"
              className={`${iconButtonClasses} md:hidden`}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-3 absolute left-0 w-full bg-white shadow-lg">
          <div className="flex flex-col space-y-1 px-4">
            <Link
              to="/"
              onClick={() => setIsMenuOpen(false)}
              className={`${navItemClasses} ${mobileLinkClasses}`}
            >
              <Home className="w-5 h-5" />
              <span className="font-semibold">Home</span>
            </Link>

            {/* Direct Link instead of .map */}
            <Link
              to="/create-event"
              onClick={() => setIsMenuOpen(false)}
              className={`${navItemClasses} ${mobileLinkClasses}`}
            >
              <Plus className="w-5 h-5" />
              <span className="font-semibold whitespace-nowrap">
                Create Event
              </span>
            </Link>

            <div className="border-t border-gray-100 my-2 pt-2"></div>

            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className={`${navItemClasses} ${mobileLinkClasses}`}
                >
                  <User className="w-5 h-5" />
                  <span className="font-semibold">My Profile</span>
                </Link>
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  className={`${navItemClasses} ${mobileLinkClasses} text-red-600`}
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Logout</span>
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className={`${navItemClasses} ${mobileLinkClasses}`}
              >
                <User className="w-5 h-5" />
                <span className="font-semibold">Account / Sign In</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
