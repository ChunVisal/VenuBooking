// src/components/common/CardMenu.jsx
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Flag,
  BookmarkPlus,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CardMenu = ({ eventId, eventTitle, eventImage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
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

  const handleShare = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const eventUrl = `${window.location.origin}/event/${eventId}`;

    if (navigator.share) {
      navigator.share({
        title: eventTitle || "Check out this event",
        text: `Check out this event: ${eventTitle}`,
        url: eventUrl,
      });
    } else {
      navigator.clipboard.writeText(eventUrl);
      alert("Link copied to clipboard!");
    }

    setIsOpen(false);
  };

  const handleReport = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Thank you for your report. We will review this event.");
    setIsOpen(false);
  };

  const handleSave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Event saved for later!");
    setIsOpen(false);
  };

  const handleOpen = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/event/${eventId}`);
    setIsOpen(false);
  };

  const menuItems = [
    { icon: Share2, label: "Share Event", onClick: handleShare },
    { icon: BookmarkPlus, label: "Save for Later", onClick: handleSave },
    { icon: ExternalLink, label: "Open Event", onClick: handleOpen },
    { icon: Flag, label: "Report Event", onClick: handleReport, danger: true },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Menu Button */}
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
                onClick={item.onClick}
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
