// src/components/common/LocationPicker.jsx
import { useState, useEffect, useRef } from "react";
import { MapPin, ChevronDown, Loader2, X } from "lucide-react";

const searchLocationAPI = async (query) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
        query,
      )}&format=json&limit=5&addressdetails=1`,
    );
    const data = await response.json();
    return data.map((item) => ({
      name: item.display_name.split(",")[0],
      fullName: item.display_name,
      lat: item.lat,
      lon: item.lon,
    }));
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
};

const popularLocations = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Philadelphia",
  "San Antonio",
  "San Diego",
  "Dallas",
  "Austin",
];

const LocationPicker = ({
  value,
  onChange,
  placeholder = "Select location",
}) => {
  const [location, setLocation] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPopular, setShowPopular] = useState(true);
  const timeoutRef = useRef(null);
  const ref = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (location.length > 1) {
      setIsLoading(true);
      setShowPopular(false);
      timeoutRef.current = setTimeout(async () => {
        const results = await searchLocationAPI(location);
        setSuggestions(results);
        setIsLoading(false);
        setShowDropdown(true);
      }, 500);
    } else {
      setSuggestions([]);
      setShowPopular(true);
      setShowDropdown(false);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [location]);

  const selectLocation = (loc) => {
    const locationName = typeof loc === "string" ? loc : loc.name;
    setLocation(locationName);
    setShowDropdown(false);
    if (onChange) onChange(locationName);
  };

  const clearLocation = () => {
    setLocation("");
    if (onChange) onChange("");
  };

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-200">
        <MapPin className="w-4 h-4 text-gray-400 mr-2" />
        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          className="text-sm bg-transparent placeholder-gray-500 outline-none w-full"
        />
        {location && (
          <button
            onClick={clearLocation}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
      </div>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
              <span className="ml-2 text-sm text-gray-500">Searching...</span>
            </div>
          )}

          {showPopular && !isLoading && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 font-medium">
                  Popular Locations
                </p>
              </div>
              {popularLocations.map((loc) => (
                <button
                  key={loc}
                  onClick={() => selectLocation(loc)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2 text-sm text-gray-700"
                >
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {loc}
                </button>
              ))}
            </>
          )}

          {!showPopular && suggestions.length > 0 && !isLoading && (
            <>
              <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
                <p className="text-xs text-gray-500 font-medium">Locations</p>
              </div>
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => selectLocation(sug)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-50"
                >
                  <p className="text-sm text-gray-700">{sug.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {sug.fullName}
                  </p>
                </button>
              ))}
            </>
          )}

          {!showPopular &&
            suggestions.length === 0 &&
            !isLoading &&
            location.length > 1 && (
              <div className="px-4 py-3 text-center text-sm text-gray-500">
                No locations found
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
