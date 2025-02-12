import React, { useState } from "react";
import { ArrowRight } from "lucide-react";
import SearchInput from "./SearchInput";
import { useLocationSearch } from "../../hooks/useLocationSearch";

function SearchPanel() {
  const [activeField, setActiveField] = useState(null);
  const pickup = useLocationSearch();
  const destination = useLocationSearch();

  const handleSelect = (result) => {
    if (!activeField) return;

    const currentSearch = activeField === "pickup" ? pickup : destination;
    currentSearch.setQuery(result.structured_formatting.main_text);
    setActiveField(null);
  };

  return (
    <div className="relative">
      <div
        className="bg-black/80 backdrop-blur-lg rounded-2xl p-6 w-full 
                    border border-white/10 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white mb-6">Where to?</h2>

        <div className="space-y-4">
          <SearchInput
            placeholder="Pickup location"
            value={pickup.query}
            onChange={pickup.search}
            onFocus={() => setActiveField("pickup")}
            iconColor="blue"
            results={pickup.results}
            isLoading={pickup.isLoading}
            onSelect={handleSelect}
            showResults={activeField === "pickup"}
          />

          <SearchInput
            placeholder="Where to?"
            value={destination.query}
            onChange={destination.search}
            onFocus={() => setActiveField("destination")}
            iconColor="purple"
            results={destination.results}
            isLoading={destination.isLoading}
            onSelect={handleSelect}
            showResults={activeField === "destination"}
          />
        </div>

        <div className="mt-6">
          <button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white py-3.5 rounded-xl font-medium 
                     hover:from-blue-500 hover:to-purple-500 transition-all 
                     duration-300 group relative overflow-hidden shadow-lg 
                     disabled:opacity-50 cursor-pointer transform hover:scale-[0.98] 
                     active:scale-95"
            disabled={!pickup.query || !destination.query}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              Search Rides
              <ArrowRight
                className="w-4 h-4 group-hover:translate-x-1 
                                 transition-transform duration-300"
              />
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default SearchPanel;
