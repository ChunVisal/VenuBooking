// src/components/common/SearchBar.jsx
import { useState, useEffect, useRef } from "react";
import { Search, MapPin, X, ChevronDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Using OpenStreetMap Nominatim API (free, no API key needed)
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
      type: item.type,
    }));
  } catch (error) {
    console.error("Location search error:", error);
    return [];
  }
};

// Alternative: Google Places API (requires API key)
// const searchLocationAPI = async (query) => {
//   const API_KEY = "YOUR_GOOGLE_API_KEY";
//   const response = await fetch(
//     `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${query}&key=${API_KEY}`
//   );
//   const data = await response.json();
//   return data.predictions;
// };

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
  "Seattle",
  "Boston",
  "Denver",
  "Miami",
  "Atlanta",
];

const SearchBar = ({ onSearch, className = "" }) => {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const locationTimeoutRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
        setShowLocationDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced location search
  useEffect(() => {
    if (locationTimeoutRef.current) {
      clearTimeout(locationTimeoutRef.current);
    }

    if (location.length > 1) {
      setIsLoadingLocation(true);
      locationTimeoutRef.current = setTimeout(async () => {
        const results = await searchLocationAPI(location);
        setLocationSuggestions(results);
        setIsLoadingLocation(false);
        setShowLocationDropdown(true);
      }, 500);
    } else {
      setLocationSuggestions([]);
      setShowLocationDropdown(false);
    }

    return () => {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
    };
  }, [location]);

  const saveRecentSearch = (searchQuery, searchLocation) => {
    const newSearch = {
      id: Date.now(),
      query: searchQuery,
      location: searchLocation,
    };
    const updated = [
      newSearch,
      ...recentSearches.filter((s) => s.query !== searchQuery),
    ].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (query.trim() || location.trim()) {
      saveRecentSearch(query, location);
      if (onSearch) {
        onSearch({ query, location });
      } else {
        navigate(
          `/events?search=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`,
        );
      }
      setShowSuggestions(false);
      setShowLocationDropdown(false);
    }
  };

  const selectLocation = (loc) => {
    setLocation(loc.name || loc);
    setShowLocationDropdown(false);
    setLocationSuggestions([]);
  };

  const selectPopularLocation = (loc) => {
    setLocation(loc);
    setShowLocationDropdown(false);
  };

  const clearSearch = () => {
    setQuery("");
    setLocation("");
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="w-full">
        {/* Search Container */}
        <div className="hidden sm:flex items-center space-x-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 focus-within:ring-2 focus-within:ring-orange-200 w-full">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search events, venues..."
            className="text-sm bg-transparent placeholder-gray-500 outline-none w-full"
          />
        </div>
      </form>

      {/* Recent Searches Dropdown */}
      {showSuggestions && recentSearches.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-2 bg-gray-50 border-b border-gray-100">
            <p className="text-xs text-gray-500 font-medium">Recent Searches</p>
          </div>
          {recentSearches.map((search) => (
            <button
              key={search.id}
              onClick={() => {
                setQuery(search.query);
                setLocation(search.location);
                setShowSuggestions(false);
                handleSearch();
              }}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 transition-colors"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <p className="text-sm text-gray-700">
                  {search.query || "All events"}
                </p>
                {search.location && (
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3" />
                    {search.location}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
