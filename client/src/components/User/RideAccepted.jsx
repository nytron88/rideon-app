import React from "react";
import { Navigation } from "lucide-react";

function RideAccepted({ ride }) {
  const captain = ride?.captain || {};

  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6">
        Your captain is coming
      </h3>

      {/* Captain Info */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={captain.photo}
          alt={captain.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
        />
        <div className="flex-1">
          <h4 className="text-white font-medium">{captain.name}</h4>
        </div>
      </div>

      {/* Vehicle Info */}
      {captain.vehicle && (
        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Vehicle</p>
              <p className="text-white">{captain.vehicle.model}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Color</p>
              <p className="text-white">{captain.vehicle.color}</p>
            </div>
            <div className="col-span-2">
              <p className="text-gray-400 text-sm">License Plate</p>
              <p className="text-white font-medium">{captain.vehicle.plate}</p>
            </div>
          </div>
        </div>
      )}

      {/* ETA */}
      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Navigation className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-white font-medium">Captain is on the way</p>
          <p className="text-sm text-gray-400">Arriving at pickup point</p>
        </div>
      </div>
    </div>
  );
}

export default RideAccepted;
