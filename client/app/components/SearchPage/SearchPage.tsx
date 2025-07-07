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
  page?: string;
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

const POSTS_PER_PAGE = 12;

export default function SearchPage({ category, page }: SearchPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { searchPosts, searchResults, loading, totalCount } = useSearch();

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
  const [currentPage, setCurrentPage] = useState(1);

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const isInitialized = useRef(false);
  const isChangingPageRef = useRef(false);

  const normalizedCategory = normalizeCategory(category);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  // DEBUG: Add logging
  console.log("SearchPage rendered with:", {
    category,
    page,
    currentPage,
    totalPages,
  });

  // Fixed URL building function
  const updateURL = useCallback(
    (filters: SearchFilters, pageNum: number = 1) => {
      console.log("updateURL called with:", { filters, pageNum });

      const params = new URLSearchParams();

      if (filters.query) params.set("query", filters.query);
      if (filters.location) {
        params.set("location", locationQuery);
        params.set("lat", filters.location.lat.toString());
        params.set("lon", filters.location.lon.toString());
        params.set("radius", filters.location.radius.toString());
      }
      if (filters.period) params.set("period", filters.period.toString());
      if (
        filters.status &&
        filters.status.length > 0 &&
        filters.status.length < 2
      ) {
        params.set("status", filters.status.join(","));
      }

      // Fixed URL building logic
      let newURL = "/search";

      if (category) {
        newURL += `/${category}`;
      }

      if (pageNum > 1) {
        newURL += `/${pageNum}`;
      }

      if (params.toString()) {
        newURL += `?${params.toString()}`;
      }

      console.log("Navigating to:", newURL);
      router.push(newURL, { scroll: false });
    },
    [locationQuery, router, category]
  );

  const performSearch = useCallback(
    async (pageNum: number = 1, shouldUpdateURL = true) => {
      console.log("performSearch called with:", { pageNum, shouldUpdateURL });

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

      const skip = (pageNum - 1) * POSTS_PER_PAGE;
      console.log("Search filters:", filters);
      console.log("Skip value:", skip);

      try {
        const result = await searchPosts(filters, skip);
        console.log("Search result:", result);

        setCurrentPage(pageNum);
        if (shouldUpdateURL) {
          updateURL(filters, pageNum);
        }
      } catch (err) {
        const error = err as Error;
        console.error("Căutarea a eșuat:", error);
        toast.error(error.message || "A apărut o eroare neașteptată");
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

  // Initialize from URL parameters
  useEffect(() => {
    if (isInitialized.current) return;

    console.log("Initializing from URL params:", {
      searchParams: Object.fromEntries(searchParams.entries()),
      page,
    });

    // Prevent filter changes during initialization
    isChangingPageRef.current = true;

    const urlQuery = searchParams.get("query") || "";
    const urlLocation = searchParams.get("location") || "";
    const urlLat = searchParams.get("lat");
    const urlLon = searchParams.get("lon");
    const urlRadius = searchParams.get("radius");
    const urlPeriod = searchParams.get("period");
    const urlStatus = searchParams.get("status");

    // Extract page number from URL - Fixed logic
    let pageFromUrl = 1;
    if (page) {
      const pageMatch = page.match(/^p?(\d+)$/);
      if (pageMatch) {
        pageFromUrl = parseInt(pageMatch[1]);
      }
    }
    const validPage = pageFromUrl > 0 ? pageFromUrl : 1;

    console.log("Parsed page from URL:", { page, pageFromUrl, validPage });

    setQuery(urlQuery);
    setLocationQuery(urlLocation);
    setCurrentPage(validPage);

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

      const skip = (validPage - 1) * POSTS_PER_PAGE;

      console.log("Initial search with:", { filters, skip, validPage });

      try {
        await searchPosts(filters, skip);
      } catch (error) {
        console.error("Initial search failed:", error);
      } finally {
        setIsInitializing(false);
        // Allow filter changes after initialization
        setTimeout(() => {
          isChangingPageRef.current = false;
        }, 100);
      }
    };

    performInitialSearch();
  }, [searchParams, category, normalizedCategory, searchPosts, page]);

  const debouncedSearch = useCallback(() => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      console.log("Debounced search triggered");

      // If we're on page 1, perform search directly
      if (currentPage === 1) {
        console.log("On page 1, performing direct search");
        performSearch(1, true);
      } else {
        // If we're on another page, just update URL to page 1
        // This will trigger navigation and re-initialization
        console.log("On page", currentPage, "redirecting to page 1");
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

        updateURL(filters, 1);
      }
    }, 500);
  }, [
    query,
    statusFilters,
    selectedCoords,
    distanceSelected,
    periodSelected,
    currentPage,
    performSearch,
    updateURL,
    category,
    normalizedCategory,
  ]);

  useEffect(() => {
    if (isInitialized.current && !isChangingPageRef.current) {
      console.log("Filter changed, triggering debounced search");
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

  const goToPage = (pageNum: number) => {
    if (pageNum === currentPage || pageNum < 1 || pageNum > totalPages) return;

    // Build filters from the *current* UI state
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

    // Update the URL → triggers a remount → only ONE fetch in the new page
    updateURL(filters, pageNum);
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const showEllipsis = totalPages > 7;

    if (showEllipsis) {
      // Show first page
      buttons.push(
        <button
          key={1}
          onClick={() => goToPage(1)}
          className={`${styles.pageButton} ${
            currentPage === 1 ? styles.active : ""
          }`}
        >
          1
        </button>
      );

      // Show ellipsis if needed
      if (currentPage > 4) {
        buttons.push(
          <span key="ellipsis1" className={styles.ellipsis}>
            ...
          </span>
        );
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`${styles.pageButton} ${
              currentPage === i ? styles.active : ""
            }`}
          >
            {i}
          </button>
        );
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 3) {
        buttons.push(
          <span key="ellipsis2" className={styles.ellipsis}>
            ...
          </span>
        );
      }

      // Show last page
      if (totalPages > 1) {
        buttons.push(
          <button
            key={totalPages}
            onClick={() => goToPage(totalPages)}
            className={`${styles.pageButton} ${
              currentPage === totalPages ? styles.active : ""
            }`}
          >
            {totalPages}
          </button>
        );
      }
    } else {
      // Show all pages if total pages <= 7
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button
            key={i}
            onClick={() => goToPage(i)}
            className={`${styles.pageButton} ${
              currentPage === i ? styles.active : ""
            }`}
          >
            {i}
          </button>
        );
      }
    }

    return buttons;
  };

  // if (isInitializing || loading || !searchResults) {
  //   return <Loader />;
  // }

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
            />
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
                {totalCount > 0 && (
                  <p className={styles.pageInfo}>
                    Pagina {currentPage} din {totalPages}
                  </p>
                )}
              </div>

              <div className={styles.resultscontainer}>
                {searchResults.map((post, idx) => (
                  <PostCard key={post._id} post={post} priority={idx < 4} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!hasPrevPage || loading}
                    className={`${styles.paginationButton} ${styles.prevNext}`}
                  >
                    ← Anterior
                  </button>

                  <div className={styles.pageNumbers}>
                    {renderPaginationButtons()}
                  </div>

                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!hasNextPage || loading}
                    className={`${styles.paginationButton} ${styles.prevNext}`}
                  >
                    Următor →
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
