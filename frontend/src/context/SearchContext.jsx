// src/context/SearchContext.jsx
import React, { createContext, useContext, useState, useCallback } from "react";

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearch must be used within SearchProvider");
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCategory, setSearchCategory] = useState("All Categories");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [noResultsFound, setNoResultsFound] = useState(false);

  // Helper function to calculate similarity between strings
  const calculateSimilarity = (str1, str2) => {
    const s1 = str1.toLowerCase();
    const s2 = str2.toLowerCase();

    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Word matching
    const words1 = s1.split(" ");
    const words2 = s2.split(" ");
    let matches = 0;

    words1.forEach((word1) => {
      words2.forEach((word2) => {
        if (word1 === word2 || word1.includes(word2) || word2.includes(word1)) {
          matches++;
        }
      });
    });

    return matches / Math.max(words1.length, words2.length);
  };

  // Main search function
  const performSearch = useCallback(
    async (events, query, location, category) => {
      setIsSearching(true);
      setNoResultsFound(false);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      let filteredEvents = [...events];
      const searchTerms = query
        .toLowerCase()
        .split(" ")
        .filter((term) => term.length > 0);
      const locationTerm = location.toLowerCase();
      const categoryTerm = category;

      // Store similarity scores
      const eventsWithScores = [];

      filteredEvents.forEach((event) => {
        let score = 0;
        let matchReasons = [];

        // 1. Check exact matches first (highest priority)
        const titleMatch = event.title
          ?.toLowerCase()
          .includes(query.toLowerCase());
        const exactLocationMatch =
          event.location?.toLowerCase() === locationTerm;
        const exactCategoryMatch = event.category === categoryTerm;

        if (titleMatch) {
          score += 100;
          matchReasons.push("exact title match");
        }
        if (exactLocationMatch) {
          score += 100;
          matchReasons.push("exact location match");
        }
        if (exactCategoryMatch && categoryTerm !== "All Categories") {
          score += 100;
          matchReasons.push("exact category match");
        }

        // 2. Title similarity search
        if (query && !titleMatch) {
          let titleSimilarity = 0;
          searchTerms.forEach((term) => {
            const sim = calculateSimilarity(event.title || "", term);
            titleSimilarity = Math.max(titleSimilarity, sim);
          });

          if (titleSimilarity > 0.3) {
            score += titleSimilarity * 50;
            matchReasons.push(
              `title match (${Math.round(titleSimilarity * 100)}% similar)`,
            );
          }
        }

        // 3. Location similarity search
        if (location && !exactLocationMatch) {
          const locationSimilarity = calculateSimilarity(
            event.location || "",
            locationTerm,
          );
          if (locationSimilarity > 0.3) {
            score += locationSimilarity * 50;
            matchReasons.push(
              `location match (${Math.round(locationSimilarity * 100)}% similar)`,
            );
          }
        }

        // 4. Category match (partial)
        if (categoryTerm !== "All Categories") {
          const categorySimilarity = calculateSimilarity(
            event.category || "",
            categoryTerm,
          );
          if (categorySimilarity > 0.4) {
            score += categorySimilarity * 40;
            matchReasons.push(
              `category match (${Math.round(categorySimilarity * 100)}% similar)`,
            );
          }
        }

        // 5. Search across multiple fields (title + location + category)
        if (query) {
          searchTerms.forEach((term) => {
            // Check in title
            if (event.title?.toLowerCase().includes(term)) {
              score += 30;
              matchReasons.push(`keyword "${term}" in title`);
            }
            // Check in location
            if (event.location?.toLowerCase().includes(term)) {
              score += 25;
              matchReasons.push(`keyword "${term}" in location`);
            }
            // Check in category
            if (event.category?.toLowerCase().includes(term)) {
              score += 20;
              matchReasons.push(`keyword "${term}" in category`);
            }
            // Check in description if available
            if (event.description?.toLowerCase().includes(term)) {
              score += 15;
              matchReasons.push(`keyword "${term}" in description`);
            }
          });
        }

        // 6. Partial word matching
        if (query && query.length >= 2) {
          searchTerms.forEach((term) => {
            if (
              event.title
                ?.toLowerCase()
                .split(" ")
                .some((word) => word.startsWith(term) || word.endsWith(term))
            ) {
              score += 10;
              matchReasons.push(`partial match "${term}" in title`);
            }
          });
        }

        if (score > 0) {
          eventsWithScores.push({
            ...event,
            searchScore: score,
            matchReasons: [...new Set(matchReasons)], // Remove duplicates
          });
        }
      });

      // Sort by score (highest first)
      const sortedResults = eventsWithScores.sort(
        (a, b) => b.searchScore - a.searchScore,
      );

      // Check if no results found
      const hasNoResults = sortedResults.length === 0;
      setNoResultsFound(hasNoResults);

      // If no results, try to find similar events by category or location
      if (
        hasNoResults &&
        (query || location || categoryTerm !== "All Categories")
      ) {
        const similarEvents = [];

        filteredEvents.forEach((event) => {
          let similarScore = 0;

          // Find events in same category
          if (
            categoryTerm !== "All Categories" &&
            event.category === categoryTerm
          ) {
            similarScore += 60;
          }

          // Find events in same location area
          if (
            location &&
            event.location?.toLowerCase().includes(locationTerm.split(",")[0])
          ) {
            similarScore += 40;
          }

          // Find events with similar keywords
          if (query) {
            searchTerms.forEach((term) => {
              if (
                event.title?.toLowerCase().includes(term) ||
                event.category?.toLowerCase().includes(term)
              ) {
                similarScore += 30;
              }
            });
          }

          if (similarScore > 0) {
            similarEvents.push({
              ...event,
              searchScore: similarScore,
              matchReasons: ["Similar event you might like"],
            });
          }
        });

        if (similarEvents.length > 0) {
          setSearchResults(
            similarEvents.sort((a, b) => b.searchScore - a.searchScore),
          );
          setNoResultsFound(false);
        } else {
          setSearchResults([]);
        }
      } else {
        setSearchResults(sortedResults);
      }

      setIsSearching(false);
      return sortedResults;
    },
    [],
  );

  const clearSearch = () => {
    setSearchQuery("");
    setSearchLocation("");
    setSearchCategory("All Categories");
    setSearchResults([]);
    setNoResultsFound(false);
  };

  const value = {
    searchQuery,
    setSearchQuery,
    searchLocation,
    setSearchLocation,
    searchCategory,
    setSearchCategory,
    searchResults,
    setSearchResults,
    isSearching,
    noResultsFound,
    performSearch,
    clearSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
};
