"use client";

import styles from "./SearchPage.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "../../../context/SearchContext";
import Image from "next/image";
import SearchInput from "../Inputs/SearchInput/SearchInput";
import PostCard from "../UI/PostCard/PostCard";
import { toast } from "react-toastify";

interface SearchPageProps {
  category?: string;
}
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

const normalizeCategory = (raw?: string) =>
  raw ? raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase() : undefined;

export default function SearchPage({ category }: SearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchPosts, searchResults, loading, hasMore, totalCount } =
    useSearch();

  const [query, setQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [distanceSelected, setDistanceSelected] = useState(1);
  const [periodSelected, setPeriodSelected] = useState<number | null>(null);
  const [statusFilters, setStatusFilters] = useState<string[]>([
    "lost",
    "found",
  ]);
  const [isInitializing, setIsInitializing] = useState(true);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);

  const normalizedCategory = normalizeCategory(category);

  const updateURL = useCallback(
    (filters: SearchFilters) => {
      const params = new URLSearchParams();

      if (filters.query) params.set("query", filters.query);
      if (filters.location) {
        params.set("location", locationQuery);
        params.set("lat", filters.location.lat.toString());
        params.set("lon", filters.location.lon.toString());
        params.set("radius", filters.location.radius.toString());
      }
      if (filters.period) params.set("period", filters.period.toString());
      if (filters.status && filters.status.length > 0) {
        params.set("status", filters.status.join(","));
      }

      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.push(newURL, { scroll: false });
    },
    [locationQuery, router]
  );

  const performSearch = useCallback(
    async (shouldUpdateURL = true) => {
      const filters: SearchFilters = {};

      if (query.trim()) filters.query = query.trim();
      if (category) filters.category = normalizedCategory;
      if (statusFilters.length > 0 && statusFilters.length < 2) {
        filters.status = statusFilters;
      }
      if (selectedCoords) {
        filters.location = {
          lat: selectedCoords.lat,
          lon: selectedCoords.lon,
          radius: distanceSelected,
        };
      }
      if (periodSelected) filters.period = periodSelected;

      try {
        await searchPosts(filters);
        if (shouldUpdateURL) {
          updateURL(filters);
        }
      } catch (err) {
        const error = err as Error;
        console.error("Search failed:", error);
        toast.error(error.message || "Something went wrong. Please try again.");
      }
    },
    [
      query,
      normalizedCategory,
      statusFilters,
      selectedCoords,
      distanceSelected,
      periodSelected,
      searchPosts,
      updateURL,
      category,
    ]
  );

  useEffect(() => {
    if (isInitialized.current) return;

    const urlQuery = searchParams.get("query") || "";
    const urlLocation = searchParams.get("location") || "";
    const urlLat = searchParams.get("lat");
    const urlLon = searchParams.get("lon");
    const urlRadius = searchParams.get("radius");
    const urlPeriod = searchParams.get("period");
    const urlStatus = searchParams.get("status");

    setQuery(urlQuery);
    setLocationQuery(urlLocation);

    if (urlLat && urlLon) {
      setSelectedCoords({
        lat: parseFloat(urlLat),
        lon: parseFloat(urlLon),
      });
    }

    if (urlRadius) {
      setDistanceSelected(parseInt(urlRadius));
    }

    if (urlPeriod) {
      setPeriodSelected(parseInt(urlPeriod));
    }

    if (urlStatus) {
      setStatusFilters(urlStatus.split(","));
    }

    isInitialized.current = true;

    const performInitialSearch = async () => {
      const filters: SearchFilters = {};

      if (urlQuery.trim()) filters.query = urlQuery.trim();
      if (category) filters.category = normalizedCategory;
      if (urlStatus) {
        const statusArray = urlStatus.split(",");
        if (statusArray.length > 0 && statusArray.length < 2) {
          filters.status = statusArray;
        }
      } else if (["lost", "found"].length > 0 && ["lost", "found"].length < 2) {
        filters.status = ["lost", "found"];
      }

      if (urlLat && urlLon) {
        filters.location = {
          lat: parseFloat(urlLat),
          lon: parseFloat(urlLon),
          radius: urlRadius ? parseInt(urlRadius) : 1,
        };
      }

      if (urlPeriod) filters.period = parseInt(urlPeriod);

      try {
        await searchPosts(filters);
      } catch (error) {
        console.error("Initial search failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    performInitialSearch();
  }, [searchParams, category, normalizedCategory, searchPosts]);

  const debouncedSearch = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      performSearch(true);
    }, 500);
  }, [performSearch]);

  useEffect(() => {
    if (isInitialized.current) {
      debouncedSearch();
    }
  }, [
    query,
    statusFilters,
    selectedCoords,
    distanceSelected,
    periodSelected,
    debouncedSearch,
  ]);

  useEffect(() => {
    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
    };
  }, []);

  const handleStatusToggle = (status: "lost" | "found") => {
    setStatusFilters((prev) => {
      if (prev.includes(status)) {
        return prev.filter((s) => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const loadMore = async () => {
    if (!loading && hasMore) {
      const filters: SearchFilters = {};

      if (query.trim()) filters.query = query.trim();
      if (category) filters.category = normalizedCategory;
      if (statusFilters.length > 0 && statusFilters.length < 2) {
        filters.status = statusFilters;
      }
      if (selectedCoords) {
        filters.location = {
          lat: selectedCoords.lat,
          lon: selectedCoords.lon,
          radius: distanceSelected,
        };
      }
      if (periodSelected) filters.period = periodSelected;

      try {
        await searchPosts(filters, searchResults.length);
      } catch (error) {
        console.error("Load more failed:", error);
      }
    }
  };

  return (
    <main className={styles.searchpage}>
      <section className={styles.container}>
        <div className={styles.searchheader}>
          {category && (
            <h1 className={styles.categorytitle}>
              Căutare în categoria: {category}
            </h1>
          )}
          <div className={styles.searchinputwrapper}>
            <SearchInput
              query={query}
              setQuery={setQuery}
              locationQuery={locationQuery}
              setLocationQuery={setLocationQuery}
              selectedCoords={selectedCoords}
              setSelectedCoords={setSelectedCoords}
              distanceSelected={distanceSelected}
              setDistanceSelected={setDistanceSelected}
              periodSelected={periodSelected}
              setPeriodSelected={setPeriodSelected}
              hideSubmitButton={true}
            />{" "}
            <div className={styles.statusfilters}>
              <button
                className={`${styles.statusbutton} ${
                  statusFilters.includes("lost") ? styles.active : ""
                }`}
                onClick={() => handleStatusToggle("lost")}
              >
                Pierdut{" "}
                {statusFilters.includes("lost") && (
                  <div className={styles.checkicon}>
                    <Image
                      src="/icons/white-check.svg"
                      alt="Check Icon"
                      width={22}
                      height={22}
                      draggable={false}
                    />
                  </div>
                )}
              </button>
              <button
                className={`${styles.statusbutton} ${
                  statusFilters.includes("found") ? styles.active : ""
                }`}
                onClick={() => handleStatusToggle("found")}
              >
                Găsit{" "}
                {statusFilters.includes("found") && (
                  <div className={styles.checkicon}>
                    <Image
                      src="/icons/white-check.svg"
                      alt="Check Icon"
                      width={22}
                      height={22}
                      draggable={false}
                    />
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className={styles.searchresults}>
          {isInitializing ? (
            <div className={styles.loading}>
              <Image
                src="/gifs/loading.gif"
                alt="Loader Gif"
                width={130}
                height={130}
                draggable={false}
              />
            </div>
          ) : loading && searchResults.length === 0 ? (
            <div className={styles.loading}>
              <Image
                src="/gifs/loading.gif"
                alt="Loader Gif"
                width={130}
                height={130}
                draggable={false}
              />
            </div>
          ) : (
            <>
              <div
                className={styles.resultsheader}
                style={{ textAlign: totalCount === 0 ? "center" : "left" }}
              >
                <h2>
                  {totalCount === 0 && "Nu s-au găsit rezultate"}
                  {totalCount === 1 && "1 rezultat"}
                  {totalCount > 1 && `${totalCount} rezultate`}
                </h2>
              </div>

              <div className={styles.resultscontainer}>
                {searchResults.map((post, idx) => (
                  <PostCard key={post._id} post={post} priority={idx < 4} />
                ))}
              </div>

              {hasMore && (
                <div className={styles.loadmore}>
                  <button
                    onClick={loadMore}
                    disabled={loading}
                    className={styles.loadmorebutton}
                  >
                    {loading ? "Se încarcă..." : "Încarcă mai multe"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
