// Updated SearchBar component - navigates to /events with params
import { useState } from "react";
import { Search, MapPin, LayoutGrid, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SearchBar() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const categories = [
    "All Categories",
    "Cars",
    "Spare Parts",
    "Services",
    "Accessories",
    "Electronics",
    "Fashion",
    "Real Estate",
    "Jobs",
    "Pets",
    "Sports",
    "Education",
    "Health & Beauty",
    "Food & Dining",
    "Travel",
    "Entertainment",
  ];

  const allLocations = [
    { name: "Phnom Penh, Cambodia", type: "City" },
    { name: "Siem Reap, Cambodia", type: "City" },
    { name: "Battambang, Cambodia", type: "City" },
    { name: "Sihanoukville, Cambodia", type: "City" },
    { name: "Kampot, Cambodia", type: "City" },
    { name: "New York, USA", type: "City" },
    { name: "Los Angeles, USA", type: "City" },
    { name: "London, UK", type: "City" },
    { name: "Tokyo, Japan", type: "City" },
    { name: "Paris, France", type: "City" },
    { name: "Singapore", type: "Country" },
    { name: "Bangkok, Thailand", type: "City" },
  ];

  const filteredLocations =
    searchLocation.length >= 2
      ? allLocations
          .filter((loc) =>
            loc.name.toLowerCase().includes(searchLocation.toLowerCase()),
          )
          .slice(0, 8)
      : [];

  const handleSearch = (e) => {
    e.preventDefault();

    // Build URL params
    const params = new URLSearchParams();

    if (searchQuery) params.append("q", searchQuery);
    if (searchLocation) params.append("location", searchLocation);
    if (searchCategory && searchCategory !== "All Categories") {
      params.append("category", searchCategory);
    }

    // Navigate to events page with params
    navigate(`/events?${params.toString()}`);
    setIsMobileOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setSearchLocation(selectedLocation.name);
    setShowLocationDropdown(false);
  };

  const clearSearchQuery = () => {
    setSearchQuery("");
  };

  const clearSearchLocation = () => {
    setSearchLocation("");
  };

  const clearAll = () => {
    setSearchQuery("");
    setSearchLocation("");
    setSearchCategory("All Categories");
  };

  return (
    <>
      {/* Mobile: Only Search Icon */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-gray-600 hover:text-orange-600 transition-colors rounded-full hover:bg-gray-100"
          aria-label="Search"
        >
          <Search size={20} />
        </button>

        {/* Mobile Search Modal */}
        {isMobileOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-200"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 rounded-t-2xl shadow-2xl z-50 animate-in slide-in-from-bottom duration-300">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Search Events</h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="p-4 space-y-3">
                {/* Search Input with X button */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
                    <Search size={18} className="text-blue-600" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search events by title..."
                      className="flex-1 outline-none bg-transparent text-gray-700 text-sm"
                      autoFocus
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={clearSearchQuery}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Location Input with X button */}
                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
                    <MapPin size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="City or Country"
                      className="flex-1 outline-none bg-transparent text-gray-700 text-sm"
                    />
                    {searchLocation && (
                      <button
                        type="button"
                        onClick={clearSearchLocation}
                        className="p-0.5 hover:bg-gray-200 rounded-full transition-colors"
                      >
                        <X size={14} className="text-gray-400" />
                      </button>
                    )}
                  </div>
                  {showLocationDropdown &&
                    searchLocation.length >= 2 &&
                    filteredLocations.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto animate-in fade-in duration-150">
                        {filteredLocations.map((loc, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(loc)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 transition-colors"
                          >
                            <div className="font-medium text-gray-700">
                              {loc.name}
                            </div>
                            <div className="text-xs text-gray-400">
                              {loc.type}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                </div>

                {/* Category Selector - Full list */}
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-transparent transition-all">
                  <LayoutGrid size={18} className="text-gray-400" />
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="flex-1 outline-none bg-transparent text-gray-600 cursor-pointer text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear All Button */}
                {(searchQuery ||
                  searchLocation ||
                  searchCategory !== "All Categories") && (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    Clear all filters
                  </button>
                )}

                <button
                  type="submit"
                  className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center justify-center gap-2 text-sm active:scale-98"
                >
                  <span>Find Events</span>
                  <ArrowRight size={16} />
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Full Search Bar */}
      <div className="hidden md:flex md:items-center md:gap-1 md:bg-white md:border md:border-gray-200 md:rounded-md md:shadow-sm md:p-1">
        {/* Search Input with X */}
        <div className="relative flex items-center gap-1.5 px-2 py-1 group">
          <Search size={14} className="text-blue-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-28 outline-none bg-transparent text-gray-700 text-xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={clearSearchQuery}
              className="absolute right-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={12} className="text-gray-400" />
            </button>
          )}
        </div>

        {/* Location Input with X */}
        <div className="relative flex items-center gap-1.5 px-2 py-1 border-l border-gray-200 group">
          <MapPin size={14} className="text-gray-400" />
          <input
            type="text"
            value={searchLocation}
            onChange={(e) => setSearchLocation(e.target.value)}
            onFocus={() => setShowLocationDropdown(true)}
            onBlur={() => setTimeout(() => setShowLocationDropdown(false), 200)}
            placeholder="Location"
            className="w-28 outline-none bg-transparent text-gray-700 text-xs"
          />
          {searchLocation && (
            <button
              type="button"
              onClick={clearSearchLocation}
              className="absolute right-1 p-0.5 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={12} className="text-gray-400" />
            </button>
          )}
          {showLocationDropdown &&
            searchLocation.length >= 2 &&
            filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto animate-in fade-in duration-150">
                {filteredLocations.map((loc, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 border-b border-gray-100 transition-colors"
                  >
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-xs text-gray-400">{loc.type}</div>
                  </button>
                ))}
              </div>
            )}
        </div>

        {/* Category Selector - Full list with better width */}
        <div className="relative flex items-center gap-1.5 px-2 py-1 border-l border-gray-200">
          <LayoutGrid size={14} className="text-gray-400" />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-transparent outline-none text-gray-600 cursor-pointer text-xs pr-6 min-w-[100px]"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          onClick={handleSearch}
          className="bg-orange-600 text-white px-3 py-1 rounded-sm font-semibold hover:bg-orange-700 transition-all flex items-center gap-0.5 text-xs active:scale-95"
        >
          <span>Find</span>
          <ArrowRight size={10} />
        </button>
      </div>
    </>
  );
}
