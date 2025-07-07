"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  ReactNode,
} from "react";
import { Post } from "../types/Post";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

interface SearchFilters {
  query?: string;
  category?: string;
  status?: string[];
  location?: {
    lat: number;
    lon: number;
    radius: number;
  };
  period?: number;
}

interface SearchResponse {
  code: string;
  posts: Post[];
  count: number;
  totalCount: number;
  hasMore: boolean;
  promotedCount: number;
  filters: SearchFilters;
}

interface SearchContextType {
  searchPosts: (
    filters: SearchFilters,
    skip?: number
  ) => Promise<SearchResponse>;
  getCategories: () => Promise<string[]>;
  searchResults: Post[];
  searchFilters: SearchFilters;
  setSearchFilters: (filters: SearchFilters) => void;
  loading: boolean;
  totalCount: number;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error("useSearch must be used within a SearchProvider");
  }
  return context;
};

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Post[]>([]);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({});
  const [totalCount, setTotalCount] = useState<number>(0);

  const searchPosts = useCallback(
    async (
      filters: SearchFilters,
      skip: number = 0
    ): Promise<SearchResponse> => {
      setLoading(true);

      try {
        const params = new URLSearchParams();

        if (filters.query) params.append("query", filters.query);
        if (filters.category) params.append("category", filters.category);
        if (filters.status && filters.status.length > 0) {
          params.append("status", filters.status.join(","));
        }
        if (filters.location) {
          params.append("lat", filters.location.lat.toString());
          params.append("lon", filters.location.lon.toString());
          params.append("radius", filters.location.radius.toString());
        }
        if (filters.period) params.append("period", filters.period.toString());

        params.append("skip", skip.toString());
        params.append("limit", "12");

        const res = await fetch(`${API_URL}/search?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        const responseData = await res.json();

        if (!res.ok) {
          if (
            responseData?.code === "VALIDATION_ERROR" &&
            responseData.errors?.length
          ) {
            const messages = responseData.errors.map(
              (e: { message: string }) => `${e.message}`
            );

            throw new Error(messages);
          }

          throw new Error(
            responseData.message || `Search failed: ${res.status}`
          );
        }

        // Always replace results for pagination (no appending)
        setSearchResults(responseData.posts);
        setTotalCount(responseData.totalCount);
        setLoading(false);

        return responseData;
      } catch (error) {
        setLoading(false);
        console.error("Error searching posts:", error);
        throw error;
      }
    },
    []
  );

  const getCategories = useCallback(async (): Promise<string[]> => {
    try {
      const res = await fetch(`${API_URL}/search/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch categories: ${res.status}`);
      }

      const responseData = await res.json();
      return responseData.categories || [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      return [];
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchResults([]);
    setSearchFilters({});
    setTotalCount(0);
  }, []);

  return (
    <SearchContext.Provider
      value={{
        searchPosts,
        getCategories,
        searchResults,
        searchFilters,
        setSearchFilters,
        loading,
        totalCount,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};
