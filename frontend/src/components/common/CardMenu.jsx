// src/components/common/CardMenu.jsx
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Share2,
  Flag,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CardMenu = ({ eventId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuAction = (action, e) => {
    e.preventDefault();
    e.stopPropagation();

    switch (action) {
      case "share":
        // Implement share functionality
        if (navigator.share) {
          navigator.share({
            title: "Check out this event",
            url: `${window.location.origin}/event/${eventId}`,
          });
        } else {
          navigator.clipboard.writeText(
            `${window.location.origin}/event/${eventId}`,
          );
          alert("Link copied to clipboard!");
        }
        break;
      case "report":
        // Implement report functionality
        alert("Thank you for your report. We will review this event.");
        break;
      case "save":
        // Implement save for later
        alert("Event saved for later!");
        break;
      case "open":
        navigate(`/event/${eventId}`);
        break;
      default:
        break;
    }

    setIsOpen(false);
  };

  const menuItems = [
    { icon: Share2, label: "Share Event", action: "share" },
    { icon: BookmarkPlus, label: "Save for Later", action: "save" },
    { icon: ExternalLink, label: "Open Event", action: "open" },
    { icon: Flag, label: "Report Event", action: "report", danger: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Burger Menu Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="p-2.5 bg-white/90 backdrop-blur-md rounded-full hover:bg-white transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-orange-500"
        aria-label="Event menu"
      >
        <MoreVertical className="h-4 w-4 text-gray-700" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-sm shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeIn">
          <div className="py-1">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={(e) => handleMenuAction(item.action, e)}
                className={`w-full flex items-center px-4 py-2 text-sm transition-colors hover:bg-gray-50 ${
                  item.danger ? "text-red-600 hover:bg-red-50" : "text-gray-700"
                }`}
              >
                <item.icon
                  className={`h-3.5 w-3.5 mr-3 ${
                    item.danger ? "text-red-500" : "text-gray-500"
                  }`}
                />
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardMenu;
