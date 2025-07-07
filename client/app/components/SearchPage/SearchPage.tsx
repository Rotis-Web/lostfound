"use client";

import styles from "./SearchPage.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSearch } from "../../../context/SearchContext";
import Image from "next/image";
import SearchInput from "../Inputs/SearchInput/SearchInput";
import PostCard from "../UI/PostCard/PostCard";
import AdContainer from "../UI/AdContainer/AdContainer";
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

  const normalizedCategory = normalizeCategory(
    decodeURIComponent(category as string)
  );
  console.log("Normalized category:", normalizedCategory);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / POSTS_PER_PAGE);
  // const hasNextPage = currentPage < totalPages;
  // const hasPrevPage = currentPage > 1;

  console.log("SearchPage rendered with:", {
    category,
    page,
    currentPage,
    totalPages,
  });

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

    updateURL(filters, pageNum);
  };

  const renderPaginationButtons = () => {
    const pages = new Set<number>();
    const add = (p: number) => {
      if (p >= 1 && p <= totalPages) pages.add(p);
    };

    // extremities + current
    add(1);
    add(totalPages);
    add(currentPage);

    // neighbours
    add(currentPage - 1);
    add(currentPage + 1);

    // near‑start block
    if (currentPage <= 2) {
      add(2);
      add(3);
      add(totalPages - 1); // only added if it exists (≥ 1 and ≤ totalPages)
    }

    // near‑end block
    if (currentPage >= totalPages - 1) {
      add(totalPages - 3);
      add(totalPages - 2);
      add(totalPages - 1);
    }

    // 5. Turn the set into a sorted array
    const sorted = Array.from(pages).sort((a, b) => a - b);

    /* 6. Convert to buttons + ellipses ----------------------------------- */
    const items: (number | "...")[] = [];
    sorted.forEach((p, idx) => {
      if (idx && p - sorted[idx - 1] > 1) items.push("...");
      items.push(p);
    });

    return items.map((el, idx) =>
      el === "..." ? (
        <span key={`ellipsis-${idx}`} className={styles.ellipsis}>
          …
        </span>
      ) : (
        <button
          key={el}
          onClick={() => goToPage(el as number)}
          className={`${styles.pagebutton} ${
            currentPage === el ? styles.active : ""
          }`}
        >
          {el}
        </button>
      )
    );
  };

  // if (isInitializing || loading || !searchResults) {
  //   return <Loader />;
  // }

  return (
    <main className={styles.searchpage}>
      <section className={styles.container}>
        <div className={styles.searchheader}>
          <div className={styles.searchinputwrapper}>
            {category && (
              <div className={styles.categoryheader}>
                <Image
                  src={`/images/${category}-header.webp`}
                  alt={`${category} header`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  draggable={false}
                  priority
                />{" "}
              </div>
            )}
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
                  <p className={styles.pageinfo}>
                    Pagina {currentPage} din {totalPages}
                  </p>
                )}
              </div>

              <div className={styles.resultscontainer}>
                {(() => {
                  const items = [];
                  const postsPerPage = 12;
                  const isFullPage = searchResults.length === postsPerPage;

                  if (isFullPage) {
                    // For full pages (12 posts), show: 6 posts -> ad -> 6 posts -> ad

                    // First 6 posts
                    for (let i = 0; i < 6; i++) {
                      if (searchResults[i]) {
                        items.push(
                          <PostCard
                            key={searchResults[i]._id}
                            post={searchResults[i]}
                            priority={i < 4}
                          />
                        );
                      }
                    }

                    // First ad container
                    items.push(<AdContainer key="ad-1" />);

                    // Next 6 posts
                    for (let i = 6; i < 12; i++) {
                      if (searchResults[i]) {
                        items.push(
                          <PostCard
                            key={searchResults[i]._id}
                            post={searchResults[i]}
                            priority={false}
                          />
                        );
                      }
                    }

                    // Second ad container
                    items.push(<AdContainer key="ad-2" />);
                  } else {
                    // For non-full pages, show posts normally without ads
                    searchResults.forEach((post, idx) => {
                      items.push(
                        <PostCard
                          key={post._id}
                          post={post}
                          priority={idx < 4}
                        />
                      );
                    });
                  }

                  return items;
                })()}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  {/* <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={!hasPrevPage || loading}
                    className={`${styles.paginationbutton} ${styles.prevnext}`}
                  >
                    ← Anterior
                  </button> */}

                  <div className={styles.pagenumbers}>
                    {renderPaginationButtons()}
                  </div>

                  {/* <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={!hasNextPage || loading}
                    className={`${styles.paginationbutton} ${styles.prevnext}`}
                  >
                    Următor →
                  </button> */}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </main>
  );
}
