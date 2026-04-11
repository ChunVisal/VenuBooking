import { useState, useRef, useEffect } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Location Search Component (copied from your EditEvent.jsx)
export const LocationSearch = ({ onLocationSelect, initialValue = "" }) => {
  const [searchQuery, setSearchQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  const searchLocation = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          query,
        )}&format=json&addressdetails=1&limit=5`,
        {
          headers: {
            "User-Agent": "EventApp/1.0",
          },
        },
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error searching location:", error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (value.trim()) {
      searchLocation(value);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location) => {
    let cleanName = location.display_name.split(",")[0];
    let cleanAddress = "";

    const addressParts = location.display_name.split(",");
    if (addressParts.length >= 3) {
      cleanAddress = addressParts.slice(0, 3).join(", ").trim();
    } else {
      cleanAddress = location.display_name;
    }

    setSearchQuery(cleanName);
    setShowSuggestions(false);
    onLocationSelect({
      name: cleanName,
      address: cleanAddress,
      fullAddress: location.display_name,
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lng),
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
          className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-100 focus:border-orange-500 outline-none transition-all"
          placeholder="Search for venue, city, or address..."
        />
        {isLoading && (
          <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 animate-spin" />
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg max-h-64 overflow-y-auto"
        >
          {suggestions.map((location) => (
            <button
              key={location.place_id}
              onClick={() => handleSelectLocation(location)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
            >
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {location.display_name.split(",")[0]}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {location.display_name}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Map Picker Component (copied from your EditEvent.jsx)
export const MapPicker = ({
  onLocationSelect,
  initialLat = 12.5657,
  initialLng = 104.991,
}) => {
  const [position, setPosition] = useState([initialLat, initialLng]);
  const [address, setAddress] = useState("");
  const [map, setMap] = useState(null);

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        {
          headers: {
            "User-Agent": "EventApp/1.0",
          },
        },
      );
      const data = await response.json();
      const addressText =
        data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      setAddress(addressText);
      onLocationSelect({
        name:
          data.address?.road ||
          data.address?.city ||
          data.address?.country ||
          "Selected Location",
        address: addressText,
        lat: lat,
        lng: lng,
      });
    } catch (error) {
      console.error("Reverse geocoding error:", error);
    }
  };

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        reverseGeocode(lat, lng);
      },
    });
    return <Marker position={position} />;
  };

  return (
    <div className="space-y-4">
      <div className="h-96 rounded-2xl overflow-hidden border border-gray-200">
        <MapContainer
          center={position}
          zoom={6}
          style={{ height: "100%", width: "100%" }}
          ref={setMap}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <LocationMarker />
        </MapContainer>
      </div>
      {address && (
        <div className="p-3 bg-green-50 rounded-xl text-sm text-gray-600 border border-green-200">
          <MapPin className="w-4 h-4 inline mr-2" />
          {address}
        </div>
      )}
    </div>
  );
};
