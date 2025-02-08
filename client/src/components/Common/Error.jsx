import React from "react";
import { XCircle, Home, RefreshCw } from "lucide-react";

function Error({
  message = "Something went wrong. Please try again.",
  className = "",
  showHomeButton = true,
  showRetryButton = false,
  onHomeClick = () => (window.location.href = "/"),
  onRetryClick,
  title = "Error Occurred",
  details = null,
}) {
  return (
    <div className={`flex justify-center items-center py-16 px-4 ${className}`}>
      <div className="relative w-full max-w-2xl p-8 rounded-2xl border border-white/10 bg-[#1a2332]/90 text-white/90 shadow-2xl">
        {/* Animated subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10 opacity-10 blur-lg animate-pulse rounded-2xl"></div>

        {/* Error Content */}
        <div className="relative space-y-6">
          {/* Title and Icon */}
          <div className="flex items-center gap-4">
            <XCircle className="w-8 h-8 text-white/80" />
            <h1 className="text-2xl font-bold text-white">{title}</h1>
          </div>

          {/* Message */}
          <p className="text-lg text-white/80">{message}</p>

          {/* Details */}
          {details && (
            <div className="p-4 bg-black/40 rounded-xl border border-white/10">
              <pre className="text-sm text-white/70 overflow-x-auto">
                {details}
              </pre>
            </div>
          )}

          {/* Buttons */}
          {(showHomeButton || showRetryButton) && (
            <div className="flex justify-end gap-4 border-t border-white/10 pt-6">
              {showHomeButton && (
                <button
                  onClick={onHomeClick}
                  className="px-6 py-2.5 text-sm font-medium text-white/90 bg-white/10 rounded-lg 
                           hover:bg-white/20 transition-colors flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Home
                </button>
              )}
              {showRetryButton && (
                <button
                  onClick={onRetryClick}
                  disabled={!onRetryClick}
                  className="px-6 py-2.5 text-sm font-medium text-white bg-white/20 rounded-lg
                           hover:bg-white/30 transition-colors disabled:opacity-50 
                           disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Error;
