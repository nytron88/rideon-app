import React, { useState, useEffect, useCallback } from "react";
import { LoadScript, GoogleMap, Marker } from "@react-google-maps/api";
import { useSelector } from "react-redux";

const containerStyle = {
  width: "100%",
  height: "100%",
};

function UserLiveTracking({ origin, destination, isRideActive }) {
  const [map, setMap] = useState(null);
  const [captainMarker, setCaptainMarker] = useState(null);
  const captainLocation = useSelector((state) => state.ride.captainLocation);

  console.log(captainLocation);

  // Get Captain's latest location
  const getCurrentLocation = () => {
    return captainLocation
      ? { lat: captainLocation.latitude, lng: captainLocation.longitude }
      : { lat: 37.7749, lng: -122.4194 }; // Default SF
  };

  // Update Captain's marker position in real-time
  useEffect(() => {
    if (map && window.google && captainLocation) {
      if (!captainMarker) {
        // Create marker if it doesn't exist
        const newMarker = new window.google.maps.Marker({
          position: getCurrentLocation(),
          map,
          title: "Captain's Location",
          icon: {
            url: "https://maps.google.com/mapfiles/kml/shapes/cabs.png",
            scaledSize: new window.google.maps.Size(40, 40),
          },
        });
        setCaptainMarker(newMarker);
      } else {
        // Update existing marker position
        captainMarker.setPosition(getCurrentLocation());
      }
    }
  }, [captainLocation, map]);

  // Map Load
  const onLoad = useCallback((mapInstance) => {
    setMap(mapInstance);
  }, []);

  // Cleanup on Unmount
  const onUnmount = useCallback(() => {
    setMap(null);
    if (captainMarker) {
      captainMarker.setMap(null);
      setCaptainMarker(null);
    }
  }, [captainMarker]);

  return (
    <div className="h-screen">
      <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={getCurrentLocation()}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapId: import.meta.env.VITE_GOOGLE_MAPS_ID,
            disableDefaultUI: false,
            clickableIcons: true,
          }}
        >
          {/* Captain's Live Location Marker */}
          {captainLocation && (
            <Marker
              position={getCurrentLocation()}
              title="Captain's Live Location"
            />
          )}
        </GoogleMap>
      </LoadScript>
    </div>
  );
}

export default UserLiveTracking;
