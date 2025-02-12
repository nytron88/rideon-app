import React from 'react';
import { Star, Navigation } from 'lucide-react';

// Move to constants/mockData.js later
const mockCaptain = {
  name: "John Doe",
  photo: "https://i.pravatar.cc/150?img=68",
  rating: 4.9,
  totalRides: 1234,
  vehicle: {
    model: "Toyota Camry",
    color: "Silver",
    plate: "ABC 123"
  }
};

function RideAccepted({ ride }) {
  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6">Your captain is coming</h3>

      {/* Captain Info */}
      <div className="flex items-center gap-4 mb-6">
        <img
          src={mockCaptain.photo}
          alt={mockCaptain.name}
          className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
        />
        <div className="flex-1">
          <h4 className="text-white font-medium">{mockCaptain.name}</h4>
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white ml-1">{mockCaptain.rating}</span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">{mockCaptain.totalRides} rides</span>
          </div>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-white/5 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400 text-sm">Vehicle</p>
            <p className="text-white">{mockCaptain.vehicle.model}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Color</p>
            <p className="text-white">{mockCaptain.vehicle.color}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-400 text-sm">License Plate</p>
            <p className="text-white font-medium">{mockCaptain.vehicle.plate}</p>
          </div>
        </div>
      </div>

      {/* ETA */}
      <div className="flex items-center gap-3 bg-white/5 rounded-xl p-4">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Navigation className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <p className="text-white font-medium">Captain is 2 mins away</p>
          <p className="text-sm text-gray-400">Arriving at pickup point</p>
        </div>
      </div>
    </div>
  );
}

export default RideAccepted;