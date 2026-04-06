// src/components/Breadcrumb.jsx
import { Link, useLocation } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../api/axiosConfig";

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [eventTitle, setEventTitle] = useState(null);

  // Fetch event title if on event detail page
  useEffect(() => {
    const fetchEventTitle = async () => {
      if (pathnames[0] === "event" && pathnames[1] && !isNaN(pathnames[1])) {
        try {
          const response = await api.get(`/events/${pathnames[1]}`);
          setEventTitle(response.data.title);
        } catch (err) {
          console.error("Error fetching event title:", err);
        }
      }
    };
    fetchEventTitle();
  }, [pathnames]);

  // Don't show breadcrumb on home page
  if (pathnames.length === 0) return null;

  // Map route names to display names
  const getDisplayName = (path, index, fullPath) => {
    // Event detail page - show event title
    if (fullPath[0] === "event" && index === 1 && eventTitle) {
      return eventTitle;
    }
    if (fullPath[0] === "event" && index === 1) {
      return "Event Details";
    }

    // User profile page - decode username and remove @
    if (fullPath[0] === "profile" && index === 1) {
      const decodedUsername = decodeURIComponent(path);
      return decodedUsername;
    }
    // Edit event page
    if (fullPath[0] === "edit-event" && index === 1) {
      return "Edit Event";
    }

    // Regular route names
    const routeNames = {
      events: "Events",
      "my-events": "My Events",
      "create-event": "Create Event",
      profile: "Profile",
      settings: "Settings",
      login: "Login",
      register: "Register",
      wishlist: "Wishlist",
    };

    return routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-3 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <ol className="flex items-center space-x-2 text-sm overflow-x-auto whitespace-nowrap">
          <li>
            <Link
              to="/"
              className="text-gray-500 hover:text-orange-600 transition-colors flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </li>

          {pathnames.map((path, index) => {
            const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
            const isLast = index === pathnames.length - 1;
            const displayName = getDisplayName(path, index, pathnames);

            return (
              <li key={path} className="flex items-center">
                <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                {isLast ? (
                  <span className="ml-2 text-gray-900 font-medium">
                    {displayName}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="ml-2 text-gray-500 hover:text-orange-600 transition-colors"
                  >
                    {displayName}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};

export default Breadcrumb;
