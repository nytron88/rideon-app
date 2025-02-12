import React from 'react';
import { X } from 'lucide-react';

function WaitingForCaptain({ onCancel }) {
  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-white">Finding your captain</h3>
        <button 
          onClick={onCancel}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-center py-8 space-y-4">
        {/* Animated Pulse */}
        <div className="relative">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-16 h-16 bg-blue-500/20 rounded-full relative flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-500/30 rounded-full animate-pulse" />
          </div>
        </div>

        <p className="text-white font-medium">Connecting you with a captain...</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          We're finding the perfect captain for your ride. This usually takes less than a minute.
        </p>
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-white/5 text-white py-3 rounded-xl font-medium
                 hover:bg-white/10 transition-all duration-300 mt-4"
      >
        Cancel
      </button>
    </div>
  );
}

export default WaitingForCaptain;