import React, { useState, useCallback, useEffect } from "react";
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
import { getFare, createRide } from "../../store/slices/rideSlice";
import WaitingForCaptain from "./WaitingForCaptain";
import { debounce } from "lodash";
import RideAccepted from "./RideAccepted";

function SearchPanel() {
  const [pickupLocation, setPickupLocation] = useState({
    query: "",
    coordinates: null,
  });
  const [destinationLocation, setDestinationLocation] = useState({
    query: "",
    coordinates: null,
  });
  const [activeField, setActiveField] = useState(null);
  const [riderCount, setRiderCount] = useState(1);
  const [error, setError] = useState(null);
  const [isCreatingRide, setIsCreatingRide] = useState(false);
  const [showWaiting, setShowWaiting] = useState(false);

  const dispatch = useDispatch();
  const pickup = useLocationSearch();
  const destination = useLocationSearch();
  const { distance, duration } = useSelector((state) => state.map);
  const {
    fare,
    loading: fareLoading,
    currentRide,
  } = useSelector((state) => state.ride);

  const handleInputChange = (value, type) => {
    setError(null);
    if (type === "pickup") {
      setPickupLocation((prev) => ({ ...prev, query: value }));
      pickup.search(value);
    } else {
      setDestinationLocation((prev) => ({ ...prev, query: value }));
      destination.search(value);
    }
  };

  // Debounced function to calculate route
  const calculateRoute = useCallback(
    debounce(async (pickup, destination) => {
      try {
        if (!pickup.coordinates || !destination.coordinates) return;

        const distanceResult = await dispatch(
          getDistanceTime({
            origin: pickup.query,
            destination: destination.query,
          })
        ).unwrap();

        if (distanceResult?.distance) {
          await dispatch(
            getFare({
              pickup: pickup.query,
              destination: destination.query,
            })
          ).unwrap();
        }
      } catch (err) {
        console.error("Error calculating route:", err);
        setError("Unable to calculate route. Please try again.");
      }
    }, 500),
    [dispatch]
  );

  // Effect to recalculate route when locations change
  useEffect(() => {
    if (pickupLocation.coordinates && destinationLocation.coordinates) {
      calculateRoute(pickupLocation, destinationLocation);
    }
  }, [pickupLocation.coordinates, destinationLocation.coordinates]);

  const handleSelect = async (result, type) => {
    try {
      setError(null);
      const coordinates = await dispatch(
        getCoordinates(result.description)
      ).unwrap();

      if (type === "pickup") {
        setPickupLocation({ query: result.description, coordinates });
        dispatch(setPickupCoordinates(coordinates));
      } else {
        setDestinationLocation({ query: result.description, coordinates });
        dispatch(setDestinationCoordinates(coordinates));
      }

      setActiveField(null);
    } catch (err) {
      console.error("Error in handleSelect:", err);
      setError("Failed to get location details");
    }
  };

  const handleFocus = (field) => {
    setActiveField(field);
    dispatch(clearSuggestions());
  };

  const handleCreateRide = async () => {
    try {
      setIsCreatingRide(true);
      setError(null);

      const rideData = {
        pickup: pickupLocation.query,
        destination: destinationLocation.query,
        passengers: riderCount,
      };

      await dispatch(createRide(rideData)).unwrap();
      setShowWaiting(true);
    } catch (err) {
      setError(err?.message || "Failed to create ride");
    } finally {
      setIsCreatingRide(false);
    }
  };

  return (
    <div className="relative">
      {currentRide ? (
        <RideAccepted ride={currentRide} />
      ) : showWaiting ? (
        <WaitingForCaptain />
      ) : (
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
              value={pickupLocation.query}
              onChange={(value) => handleInputChange(value, "pickup")}
              onSearch={(value) => pickup.search(value)} // Add this
              onFocus={() => handleFocus("pickup")}
              onBlur={() => setActiveField(null)}
              iconColor="blue"
              results={pickup.results}
              isLoading={pickup.isLoading}
              onSelect={(result) => handleSelect(result, "pickup")}
              showResults={activeField === "pickup"}
              error={error}
            />

            <SearchInput
              placeholder="Where to?"
              value={destinationLocation.query}
              onChange={(value) => handleInputChange(value, "destination")}
              onSearch={(value) => destination.search(value)} // Add this
              onFocus={() => handleFocus("destination")}
              onBlur={() => setActiveField(null)}
              iconColor="purple"
              results={destination.results}
              isLoading={destination.isLoading}
              onSelect={(result) => handleSelect(result, "destination")}
              showResults={activeField === "destination"}
              error={error}
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
                  <span className="text-white font-medium">
                    Number of riders
                  </span>
                </div>
                <select
                  value={riderCount}
                  onChange={(e) => setRiderCount(Number(e.target.value))}
                  className="bg-white/10 text-white border-none rounded-lg px-3 py-2 
                         outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option
                      key={num}
                      value={num}
                      className="bg-black text-white"
                    >
                      {num} {num === 1 ? "rider" : "riders"}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Trip Information */}
            {pickupLocation.query && destinationLocation.query && (
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/5 rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-400 text-sm">
                      Estimated Time
                    </span>
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
                    <span className="text-gray-400 text-sm">
                      Estimated Fare
                    </span>
                  </div>
                  {fareLoading ? (
                    <div className="animate-pulse h-6 bg-white/10 rounded w-24" />
                  ) : fare ? (
                    <p className="text-white font-medium">${fare.fare}</p>
                  ) : (
                    <p className="text-gray-400 text-sm">
                      Calculate route to see fare
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Final fare may vary based on traffic and demand
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <button
              onClick={handleCreateRide}
              disabled={
                !pickupLocation.query ||
                !destinationLocation.query ||
                isCreatingRide
              }
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white py-3.5 rounded-xl font-medium 
                     hover:from-blue-500 hover:to-purple-500 transition-all 
                     duration-300 group relative overflow-hidden shadow-lg 
                     disabled:opacity-50 cursor-pointer transform hover:scale-[0.98] 
                     active:scale-95"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isCreatingRide ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating Ride...
                  </>
                ) : (
                  <>
                    Search Available Rides
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-1 
                                 transition-transform duration-300"
                    />
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchPanel;
