import React from "react";

function Loader({ className = "" }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className={`relative ${className}`}>
        <div className="h-16 w-16 rounded-full border-4 border-t-white border-r-white/20 border-b-white border-l-white/20 animate-spin" />
      </div>
    </div>
  );
}

Loader.Spinner = ({ className = "" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative">
        <div
          className={`w-8 h-8 rounded-full border-2 border-t-white border-r-transparent border-b-white/60 border-l-transparent animate-spin ${className}`}
        />
      </div>
    </div>
  );
};

Loader.Pulse = ({ className = "" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="flex gap-2">
        <div
          className={`w-4 h-4 rounded-full bg-white animate-pulse ${className}`}
        />
        <div
          className={`w-4 h-4 rounded-full bg-white/80 animate-pulse delay-150 ${className}`}
        />
        <div
          className={`w-4 h-4 rounded-full bg-white/60 animate-pulse delay-300 ${className}`}
        />
      </div>
    </div>
  );
};

Loader.Ring = ({ className = "" }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="relative">
        <div className={`relative ${className}`}>
          <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping"></div>
          <div className="w-12 h-12 rounded-full border-4 border-t-white border-r-white/30 border-b-white/60 border-l-white/30 animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default Loader;
