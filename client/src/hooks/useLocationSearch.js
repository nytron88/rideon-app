import { useState, useCallback } from "react";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Replace with Google Places Autocomplete
  const search = useCallback((searchTerm) => {
    setQuery(searchTerm);

    if (searchTerm.length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);

    // PLACEHOLDER: Replace this mock implementation with Google Places API
    setTimeout(() => {
      // Mock data structure matching Google Places Autocomplete predictions
      const mockResults = [
        {
          place_id: "1",
          structured_formatting: {
            main_text: `${searchTerm} Station`,
            secondary_text: "Railway Square, Downtown",
          },
          description: `${searchTerm} Station, Railway Square, Downtown`,
        },
      ];
      setResults(mockResults);
      setIsLoading(false);
    }, 300);
  }, []);

  return { query, results, isLoading, search, setQuery };
}
