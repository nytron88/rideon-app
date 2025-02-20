import React, { useEffect } from "react";
import { socketService } from "../../services/socket.service";

function WaitingForCaptain() {

  useEffect(() => {
    socketService.initialize();
    socketService.emitUserOnline();
  }, []);

  return (
    <div className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full border border-white/10 shadow-2xl">
      <h3 className="text-lg font-semibold text-white mb-6 text-center">
        Finding your captain
      </h3>

      <div className="flex flex-col items-center py-8 space-y-4">
        {/* Animated Pulse */}
        <div className="relative">
          <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-ping absolute inset-0" />
          <div className="w-16 h-16 bg-blue-500/20 rounded-full relative flex items-center justify-center">
            <div className="w-12 h-12 bg-blue-500/30 rounded-full animate-pulse" />
          </div>
        </div>

        <p className="text-white font-medium">
          Connecting you with a captain...
        </p>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          We're finding the perfect captain for your ride. This usually takes
          less than a minute.
        </p>
      </div>
    </div>
  );
}

export default WaitingForCaptain;
