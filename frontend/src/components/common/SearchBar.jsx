// Updated SearchBar component with context
import { useState } from "react";
import { Search, MapPin, LayoutGrid, ArrowRight, X } from "lucide-react";
import { useSearch } from "../../context/SearchContext";

export default function SearchBar() {
  const {
    searchQuery,
    setSearchQuery,
    searchLocation,
    setSearchLocation,
    searchCategory,
    setSearchCategory,
    performSearch,
    isSearching,
    clearSearch,
  } = useSearch();

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

  const handleSearch = async (e) => {
    e.preventDefault();
    // Get events from your events list/API
    const allEvents = window.allEvents || []; // Replace with your events data
    await performSearch(allEvents, searchQuery, searchLocation, searchCategory);
    setIsMobileOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setSearchLocation(selectedLocation.name);
    setShowLocationDropdown(false);
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
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setIsMobileOpen(false)}
            />
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-2xl z-50">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-800">Search Events</h3>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} className="text-gray-500" />
                </button>
              </div>

              <form onSubmit={handleSearch} className="p-4 space-y-3">
                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  <Search size={18} className="text-blue-600" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search events by title, category..."
                    className="flex-1 outline-none bg-transparent text-gray-700 text-sm"
                    autoFocus
                  />
                </div>

                <div className="relative">
                  <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                    <MapPin size={18} className="text-gray-400" />
                    <input
                      type="text"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                      onFocus={() => setShowLocationDropdown(true)}
                      placeholder="City or Country"
                      className="flex-1 outline-none bg-transparent text-gray-700 text-sm"
                    />
                  </div>
                  {showLocationDropdown &&
                    searchLocation.length >= 2 &&
                    filteredLocations.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                        {filteredLocations.map((loc, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => handleLocationSelect(loc)}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100"
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

                <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
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

                <button
                  type="submit"
                  disabled={isSearching}
                  className="w-full bg-orange-600 text-white py-2.5 rounded-lg font-semibold hover:bg-orange-700 flex items-center justify-center gap-2 text-sm disabled:opacity-50"
                >
                  {isSearching ? (
                    <>Searching...</>
                  ) : (
                    <>
                      <span>Find Events</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </div>

      {/* Desktop: Full Search Bar */}
      <div className="hidden md:flex md:items-center md:gap-1 md:bg-white md:border md:border-gray-200 md:rounded-md md:shadow-sm md:p-1">
        <div className="flex items-center gap-1.5 px-2 py-1">
          <Search size={14} className="text-blue-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="w-28 outline-none bg-transparent text-gray-700 text-xs"
          />
        </div>

        <div className="relative flex items-center gap-1.5 px-2 py-1 border-l border-gray-200">
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
          {showLocationDropdown &&
            searchLocation.length >= 2 &&
            filteredLocations.length > 0 && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredLocations.map((loc, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleLocationSelect(loc)}
                    className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 border-b border-gray-100"
                  >
                    <div className="font-medium">{loc.name}</div>
                    <div className="text-xs text-gray-400">{loc.type}</div>
                  </button>
                ))}
              </div>
            )}
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 border-l border-gray-200">
          <LayoutGrid size={14} className="text-gray-400" />
          <select
            value={searchCategory}
            onChange={(e) => setSearchCategory(e.target.value)}
            className="bg-transparent outline-none text-gray-600 cursor-pointer text-xs pr-4"
          >
            {categories.slice(0, 5).map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-orange-600 text-white px-3 py-1 rounded-sm font-semibold hover:bg-orange-700 flex items-center gap-0.5 text-xs disabled:opacity-50"
        >
          <span>Find</span>
          <ArrowRight size={10} />
        </button>
      </div>
    </>
  );
}
  