import React, { useState } from "react";
import {
  ArrowRight,
  MapPin,
  Users,
  Navigation,
  Clock,
  DollarSign,
} from "lucide-react";
import SearchInput from "./SearchInput";
import { useDispatch, useSelector } from "react-redux";
import { useLocationSearch } from "../../hooks/useLocationSearch";
import {
  getCoordinates,
  setPickupCoordinates,
  setDestinationCoordinates,
  getDistanceTime,
  clearSuggestions,
} from "../../store/slices/mapSlice";

function SearchPanel() {
  const [activeField, setActiveField] = useState(null);
  const [riderCount, setRiderCount] = useState(1);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const pickup = useLocationSearch();
  const destination = useLocationSearch();
  const { distance, duration, fare } = useSelector((state) => state.map);

  const handleSelect = async (result, type) => {
    try {
      setError(null);
      const coordinates = await dispatch(
        getCoordinates(result.description)
      ).unwrap();

      if (type === "pickup") {
        pickup.setQuery(result.description);
        dispatch(setPickupCoordinates(coordinates));
      } else {
        destination.setQuery(result.description);
        dispatch(setDestinationCoordinates(coordinates));
      }

      setActiveField(null);

      if (pickup.query && destination.query) {
        await dispatch(
          getDistanceTime({
            origin: pickup.query,
            destination: destination.query,
          })
        ).unwrap();
      }
    } catch (err) {
      console.error("Error in handleSelect:", err);
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to get location details"
      );
    }
  };

  const handleFocus = (field) => {
    if (activeField !== field) {
      dispatch(clearSuggestions());
      setActiveField(field);
    }
  };

  const handleBlur = () => {
    // Use setTimeout to allow click events on suggestions to fire first
    setTimeout(() => setActiveField(null), 200);
  };

  return (
    <div className="relative">
      <div
        className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full 
                    border border-white/10 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Where to?</h2>
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}
        <div className="space-y-4">
          <SearchInput
            placeholder="Pickup location"
            value={pickup.query}
            onChange={pickup.search}
            onFocus={() => handleFocus("pickup")}
            onBlur={handleBlur}
            iconColor="blue"
            Icon={MapPin}
            results={pickup.results}
            isLoading={pickup.isLoading}
            onSelect={(result) => handleSelect(result, "pickup")}
            showResults={activeField === "pickup"}
          />

          <SearchInput
            placeholder="Where to?"
            value={destination.query}
            onChange={destination.search}
            onFocus={() => handleFocus("destination")}
            onBlur={handleBlur}
            iconColor="purple"
            Icon={MapPin}
            results={destination.results}
            isLoading={destination.isLoading}
            onSelect={(result) => handleSelect(result, "destination")}
            showResults={activeField === "destination"}
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
                <p className="text-white font-medium">{duration} mins</p>
              </div>

              <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Navigation className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Distance</span>
                </div>
                <p className="text-white font-medium">{distance} miles</p>
              </div>

              <div className="col-span-2 bg-white/5 rounded-xl border border-white/10 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-400 text-sm">Estimated Fare</span>
                </div>
                <p className="text-white font-medium">
                  ${fare?.min} - ${fare?.max}
                </p>
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
