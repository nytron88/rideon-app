import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getLocationSuggestions,
  clearSuggestions,
} from "../store/slices/mapSlice";
import debounce from "lodash/debounce";

export function useLocationSearch() {
  const [query, setQuery] = useState("");
  const dispatch = useDispatch();
  const { suggestions, loading } = useSelector((state) => state.map);

  // Debounce the API call
  const debouncedSearch = useCallback(
    debounce((searchTerm) => {
      if (searchTerm.length >= 2) {
        dispatch(getLocationSuggestions(searchTerm));
      } else {
        dispatch(clearSuggestions());
      }
    }, 300),
    [dispatch]
  );

  const search = useCallback(
    (searchTerm) => {
      setQuery(searchTerm);
      debouncedSearch(searchTerm);
    },
    [debouncedSearch]
  );

  return {
    query,
    results: suggestions,
    isLoading: loading,
    search,
    setQuery,
  };
}
