import React from "react";
import { LoadScript, GoogleMap, Marker } from '@react-google-maps/api'

function LiveTracking() {
  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2048&auto=format&fit=crop"
        alt="Map"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/10"></div>
    </div>
  );
}

export default LiveTracking;