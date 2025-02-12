import React, { useRef } from "react";
import { MapPin } from "lucide-react";

function SearchInput({
  placeholder,
  value,
  onChange,
  onFocus,
  iconColor = "blue",
  results = [],
  isLoading = false,
  onSelect,
  showResults = false,
}) {
  const inputRef = useRef(null);

  // Get input position for dropdown
  const getDropdownPosition = () => {
    if (!inputRef.current) return {};
    const rect = inputRef.current.getBoundingClientRect();
    return {
      width: rect.width,
      top: "100%",
      left: 0,
    };
  };

  return (
    <div className="relative group">
      {/* Input Field */}
      <div
        className={`absolute left-3 top-3 w-8 h-8 bg-${iconColor}-500/20 rounded-full 
                    flex items-center justify-center`}
      >
        <MapPin className={`w-4 h-4 text-${iconColor}-400`} />
      </div>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                   text-white placeholder-gray-400 focus:border-${iconColor}-500 
                   focus:ring-2 focus:ring-${iconColor}-500/20 outline-none transition-all 
                   duration-300 hover:border-white/20 cursor-text`}
      />

      {/* Results Dropdown */}
      {showResults && (
        <div
          className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-xl border border-white/10 
                   rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto"
          style={getDropdownPosition()}
        >
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.place_id}
                onClick={() => onSelect(result)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 
                         transition-colors text-left border-b border-white/10 last:border-0"
              >
                <div className="flex-1">
                  <p className="text-white font-medium">
                    {result.structured_formatting.main_text}
                  </p>
                  <p className="text-sm text-gray-400">
                    {result.structured_formatting.secondary_text}
                  </p>
                </div>
              </button>
            ))
          ) : (
            value.length >= 2 && (
              <div className="px-4 py-3 text-gray-400 text-sm">
                No results found
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default SearchInput;
