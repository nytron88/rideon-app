import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  MapPin,
  Users,
  Navigation,
  Clock,
  DollarSign,
} from "lucide-react";
import SearchInput from "./SearchInput";
import { useLocationSearch } from "../../hooks/useLocationSearch";

function SearchPanel() {
  const [activeField, setActiveField] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [riderCount, setRiderCount] = useState(1);
  const pickup = useLocationSearch();
  const destination = useLocationSearch();

  // Check if mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // 768px is our md breakpoint
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleSelect = (result) => {
    if (!activeField) return;

    const currentSearch = activeField === "pickup" ? pickup : destination;
    currentSearch.setQuery(result.structured_formatting.main_text);
    setActiveField(null);
  };

  // Handle input focus
  const handleFocus = (field) => {
    if (isMobile) {
      setActiveField(field);
    }
  };

  return (
    <div className="relative">
      <div
        className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full 
                    border border-white/10 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Where to?</h2>

        <div className="space-y-4">
          <SearchInput
            placeholder="Pickup location"
            value={pickup.query}
            onChange={pickup.search}
            onFocus={() => handleFocus("pickup")}
            iconColor="blue"
            Icon={MapPin}
            results={pickup.results}
            isLoading={pickup.isLoading}
            onSelect={handleSelect}
            showResults={isMobile && activeField === "pickup"}
          />

          <SearchInput
            placeholder="Where to?"
            value={destination.query}
            onChange={destination.search}
            onFocus={() => handleFocus("destination")}
            iconColor="purple"
            Icon={MapPin}
            results={destination.results}
            isLoading={destination.isLoading}
            onSelect={handleSelect}
            showResults={isMobile && activeField === "destination"}
          />

          {/* Number of Riders */}
          <div
            className="bg-white/5 rounded-xl border border-white/10 p-4 
                       hover:bg-white/10 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-white font-medium">Number of riders</span>
              </div>
              <select
                value={riderCount}
                onChange={(e) => setRiderCount(Number(e.target.value))}
                className="bg-white/10 text-white border-none rounded-lg px-3 py-2 
                         outline-none focus:ring-2 focus:ring-blue-500"
              >
                {[1, 2, 3, 4].map((num) => (
                  <option key={num} value={num} className="bg-black text-white">
                    {num} {num === 1 ? "rider" : "riders"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trip Information */}
          {pickup.query && destination.query && (
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Estimated Time</span>
                </div>
                <p className="text-white font-medium">15-20 mins</p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Distance</span>
                </div>
                <p className="text-white font-medium">5.2 km</p>
              </div>

              <div className="col-span-2 bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Estimated Fare</span>
                </div>
                <p className="text-white font-medium">$12-15</p>
                <p className="text-xs text-gray-400 mt-1">
                  Final fare may vary based on traffic and demand
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white py-3.5 rounded-xl font-medium 
                     hover:from-blue-500 hover:to-purple-500 transition-all 
                     duration-300 group relative overflow-hidden shadow-lg 
                     disabled:opacity-50 cursor-pointer transform hover:scale-[0.98] 
                     active:scale-95"
            disabled={!pickup.query || !destination.query}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Search Available Rides
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 
                                 transition-transform duration-300"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
