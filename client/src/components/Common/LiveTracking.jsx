import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "100%",
};

function LiveTracking({ origin, destination, isRideActive, captainLocation }) {
  const [map, setMap] = useState(null);
  const [marker, setMarker] = useState(null);

  // Convert captainLocation to Google Maps LatLng
  const getCurrentLocation = () => {
    return captainLocation
      ? {
          lat: captainLocation.latitude,
          lng: captainLocation.longitude,
        }
      : {
          lat: 37.7749,
          lng: -122.4194,
        };
  };

  // Update marker position when captainLocation changes
  useEffect(() => {
    if (map && window.google && captainLocation) {
      if (marker) {
        // Update existing marker position
        marker.position = getCurrentLocation();
      } else {
        // Create new marker if it doesn't exist
        const newMarker = new window.google.maps.marker.AdvancedMarkerElement({
          position: getCurrentLocation(),
          map,
          title: "Current Location",
        });
        setMarker(newMarker);
      }
    }
  }, [captainLocation, map]);

  const onLoad = React.useCallback(function callback(map) {
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(
    function callback(map) {
      setMap(null);
      if (marker) {
        marker.setMap(null);
        setMarker(null);
      }
    },
    [marker]
  );

  return (
    <div className="h-screen">
      <LoadScript
        googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
        libraries={["marker"]}
      >
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
        />
      </LoadScript>
    </div>
  );
}

export default LiveTracking;
