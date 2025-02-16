import React, { useRef, useEffect } from "react";
import { MapPin } from "lucide-react";
import PropTypes from "prop-types";

function SearchInput({
  placeholder,
  value = "",
  onChange,
  onFocus,
  onBlur,
  iconColor = "blue",
  results = [],
  isLoading = false,
  onSelect,
  showResults = false,
}) {
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        onBlur?.();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape" && showResults) {
      onBlur?.();
    }
  };

  return (
    <div className="relative group">
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
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full pl-12 pr-4 py-3.5 rounded-xl bg-white/5 border border-white/10 
                   text-white placeholder-gray-400 focus:border-${iconColor}-500 
                   focus:ring-2 focus:ring-${iconColor}-500/20 outline-none transition-all 
                   duration-300 hover:border-white/20 cursor-text`}
        aria-label={placeholder}
        autoComplete="off"
      />

      {showResults && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-black/95 backdrop-blur-xl border border-white/10 
                   rounded-xl shadow-2xl overflow-hidden max-h-[200px] overflow-y-auto"
        >
          {isLoading ? (
            <div className="px-4 py-3 text-gray-400 text-sm flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-gray-400 border-t-white rounded-full animate-spin" />
              Searching...
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <button
                key={result.placeId}
                onClick={() => onSelect?.(result)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 
                         transition-colors text-left border-b border-white/10 last:border-0"
                type="button"
              >
                <div className="flex-1">
                  <p className="text-white font-medium line-clamp-2">
                    {result.description}
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

SearchInput.propTypes = {
  placeholder: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  iconColor: PropTypes.oneOf(["blue", "purple"]),
  results: PropTypes.arrayOf(
    PropTypes.shape({
      placeId: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ),
  isLoading: PropTypes.bool,
  onSelect: PropTypes.func,
  showResults: PropTypes.bool,
};

export default SearchInput;
