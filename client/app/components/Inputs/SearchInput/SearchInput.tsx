"use client";

import styles from "./SearchInput.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

interface SearchInputProps {
  query?: string;
  setQuery?: (query: string) => void;
  locationQuery?: string;
  setLocationQuery?: (location: string) => void;
  selectedCoords?: { lat: number; lon: number } | null;
  setSelectedCoords?: (coords: { lat: number; lon: number } | null) => void;
  distanceSelected?: number;
  setDistanceSelected?: (distance: number) => void;
  periodSelected?: number | null;
  setPeriodSelected?: (period: number | null) => void;
  hideSubmitButton?: boolean;
  onSubmit?: () => void;
  category?: string;
  postsCount?: number;
}

export default function SearchInput({
  query: propQuery,
  setQuery: propSetQuery,
  locationQuery: propLocationQuery,
  setLocationQuery: propSetLocationQuery,
  selectedCoords: propSelectedCoords,
  setSelectedCoords: propSetSelectedCoords,
  distanceSelected: propDistanceSelected,
  setDistanceSelected: propSetDistanceSelected,
  periodSelected: propPeriodSelected,
  setPeriodSelected: propSetPeriodSelected,
  hideSubmitButton = false,
  onSubmit,
  category,
  postsCount = 1021,
}: SearchInputProps) {
  const router = useRouter();

  const [internalQuery, setInternalQuery] = useState("");
  const [internalLocationQuery, setInternalLocationQuery] = useState("");
  const [internalSelectedCoords, setInternalSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [internalDistanceSelected, setInternalDistanceSelected] = useState(1);
  const [internalPeriodSelected, setInternalPeriodSelected] = useState<
    number | null
  >(null);

  const query = propQuery !== undefined ? propQuery : internalQuery;
  const setQuery = propSetQuery || setInternalQuery;
  const locationQuery =
    propLocationQuery !== undefined ? propLocationQuery : internalLocationQuery;
  const setLocationQuery = propSetLocationQuery || setInternalLocationQuery;
  const selectedCoords =
    propSelectedCoords !== undefined
      ? propSelectedCoords
      : internalSelectedCoords;
  const setSelectedCoords = propSetSelectedCoords || setInternalSelectedCoords;
  const distanceSelected =
    propDistanceSelected !== undefined
      ? propDistanceSelected
      : internalDistanceSelected;
  const setDistanceSelected =
    propSetDistanceSelected || setInternalDistanceSelected;
  const periodSelected =
    propPeriodSelected !== undefined
      ? propPeriodSelected
      : internalPeriodSelected;
  const setPeriodSelected = propSetPeriodSelected || setInternalPeriodSelected;

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [hasSelected, setHasSelected] = useState(false);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);

  const userHasEditedLocation = useRef(false);

  const distanceOptions = [1, 2, 5, 10, 20, 30, 50];
  const periodOptions = [null, 1, 2, 6, 12];
  const periods = [
    { id: null, name: "Orice perioadă" },
    { id: 1, name: "Ultima lună" },
    { id: 2, name: "Ultimele 2 luni" },
    { id: 6, name: "Ultimele 6 luni" },
    { id: 12, name: "Ultimele 12 luni" },
  ];

  const distanceSelectRef = useRef<HTMLDivElement>(null);
  const periodSelectRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const handleOutsideClick = useCallback((event: MouseEvent) => {
    if (
      distanceSelectRef.current &&
      !distanceSelectRef.current.contains(event.target as Node)
    ) {
      setDistanceOpen(false);
    }
    if (
      periodSelectRef.current &&
      !periodSelectRef.current.contains(event.target as Node)
    ) {
      setPeriodOpen(false);
    }
    if (
      searchRef.current &&
      !searchRef.current.contains(event.target as Node)
    ) {
      setSuggestions([]);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const fetchSuggestions = useCallback(async () => {
    if (!userHasEditedLocation.current) return;
    if (!locationQuery || locationQuery.length <= 1) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/geo/search?q=${encodeURIComponent(
          locationQuery
        )}&limit=10`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || `Eroare ${res.status}`);
        return;
      }

      const data = await res.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Failed to fetch location suggestions:", err);
      toast.error("Eroare la încărcarea sugestiilor de locație");
    }
  }, [locationQuery]);

  useEffect(() => {
    if (hasSelected) return;

    const delayDebounce = setTimeout(() => {
      if (locationQuery.length > 1) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [locationQuery, fetchSuggestions, hasSelected]);

  function highlightMatch(text: string, query: string) {
    if (!query) return text;

    const normalizeChar = (char: string) => {
      const map: Record<string, string> = {
        ș: "s",
        Ș: "S",
        ț: "t",
        Ț: "T",
        ă: "a",
        Ă: "A",
        â: "a",
        Â: "A",
        î: "i",
        Î: "I",
      };
      return map[char] || char;
    };

    const normalizeString = (str: string) =>
      str.split("").map(normalizeChar).join("").toLowerCase();

    const normalizedText = normalizeString(text);
    const normalizedQuery = normalizeString(query);

    const matchIndex = normalizedText.indexOf(normalizedQuery);
    if (matchIndex === -1) return text;

    let actualStart = -1;
    let actualEnd = -1;
    for (let i = 0, n = 0; i < text.length; i++) {
      const norm = normalizeChar(text[i]).toLowerCase();
      if (n === matchIndex) actualStart = i;
      if (n === matchIndex + normalizedQuery.length - 1) {
        actualEnd = i + 1;
        break;
      }
      if (norm) n++;
    }

    if (actualStart === -1 || actualEnd === -1) return text;

    return (
      <>
        {text.slice(0, actualStart)}
        <span style={{ color: "var(--yellow)" }}>
          {text.slice(actualStart, actualEnd)}
        </span>
        {text.slice(actualEnd)}
      </>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (onSubmit) {
      onSubmit();
    } else {
      const searchParams = new URLSearchParams();

      if (query) searchParams.set("query", query);
      if (locationQuery) searchParams.set("location", locationQuery);
      if (selectedCoords) {
        searchParams.set("lat", selectedCoords.lat.toString());
        searchParams.set("lon", selectedCoords.lon.toString());

        if (distanceSelected) {
          searchParams.set("radius", distanceSelected.toString());
        }
      }
      if (periodSelected) searchParams.set("period", periodSelected.toString());
      if (category) searchParams.set("category", category);

      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleClearQuery = () => {
    setQuery("");
  };

  const handleClearLocation = () => {
    setLocationQuery("");
    setSelectedCoords(null);
    setHasSelected(false);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    setLocationQuery(suggestion.display_name);
    setSelectedCoords({
      lat: parseFloat(suggestion.lat),
      lon: parseFloat(suggestion.lon),
    });
    setSuggestions([]);
    setHasSelected(true);
  };

  const handleDistanceSelect = (distance: number) => {
    setDistanceSelected(distance);
    setDistanceOpen(false);
  };

  const handlePeriodSelect = (period: number | null) => {
    setPeriodSelected(period);
    setPeriodOpen(false);
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <section
        className={styles.container}
        aria-label="Formular de căutare anunțuri"
      >
        <div className={styles.inputbox}>
          <label className={styles.hidden} htmlFor="query">
            Ce anume cauți?
          </label>
          <input
            type="text"
            name="query"
            id="query"
            placeholder="Ce anume cauți?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ paddingRight: query ? "38px" : "13px" }}
            aria-label="Ce anume cauți?"
          />
          {query && (
            <span
              className={styles.clear}
              onClick={handleClearQuery}
              style={{ right: "15px" }}
              role="button"
              aria-label="Șterge textul de căutare"
            >
              ✕
            </span>
          )}
        </div>

        <div className={styles.inputbox} ref={searchRef}>
          <Image
            src="/icons/location_pin.svg"
            alt="Pictogramă locație pentru câmpul de localitate"
            width={25}
            height={25}
            className={styles.icon}
            draggable={false}
          />
          {locationQuery && (
            <span
              className={styles.clear}
              onClick={handleClearLocation}
              style={{ right: "115px" }}
              role="button"
              aria-label="Șterge locația"
            >
              ✕
            </span>
          )}
          <label className={styles.hidden} htmlFor="location">
            În ce loc cauți?
          </label>
          <input
            type="text"
            name="location"
            id="location"
            placeholder="În ce loc cauți?"
            value={locationQuery}
            onChange={(e) => {
              userHasEditedLocation.current = true;
              setLocationQuery(e.target.value);
              setHasSelected(false);
            }}
            style={{ paddingRight: "138px", paddingLeft: "42px" }}
            aria-label="În ce loc cauți?"
          />
          <ul
            className={`${styles.suggestionlist} ${
              suggestions.length && !hasSelected ? "" : styles.hidden
            }`}
            role="listbox"
            aria-live="polite"
          >
            {suggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                role="option"
                aria-selected={false}
              >
                {highlightMatch(suggestion.display_name, locationQuery)}
              </li>
            ))}
          </ul>

          <div className={styles.select_wrapper} ref={distanceSelectRef}>
            <div
              className={styles.select}
              onClick={() => setDistanceOpen(!distanceOpen)}
              role="button"
              aria-label="Selectează distanța"
            >
              <div className={styles.selected}>
                <p> + {distanceSelected} km </p>
                <span>{distanceOpen ? "▲" : "▼"}</span>
              </div>
              {distanceOpen && (
                <ul className={styles.options} role="listbox">
                  {distanceOptions.map((option) => (
                    <li
                      key={option}
                      onClick={() => handleDistanceSelect(option)}
                      className={`${
                        option === distanceSelected ? styles.selectedoption : ""
                      }`}
                      role="option"
                      aria-selected={option === distanceSelected}
                    >
                      + {option} km
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className={styles.inputbox}>
          <Image
            src="/icons/calendar.svg"
            alt="Pictogramă calendar pentru selectarea perioadei"
            width={25}
            height={25}
            className={styles.icon}
            draggable={false}
          />
          <label className={styles.hidden} htmlFor="period">
            Perioada
          </label>
          <input
            type="text"
            name="period"
            id="period"
            placeholder="Perioada"
            disabled={true}
            style={{ paddingLeft: "42px" }}
            aria-label="Perioada"
          />

          <div
            className={styles.select_wrapper}
            style={{ width: "50%" }}
            ref={periodSelectRef}
          >
            <div
              className={styles.select}
              onClick={() => {
                setPeriodOpen(!periodOpen);
                setDistanceOpen(false);
              }}
              role="button"
              aria-label="Selectează perioada"
            >
              <div className={styles.selected}>
                <p>{periods.find((p) => p.id === periodSelected)?.name}</p>
                <span>{periodOpen ? "▲" : "▼"}</span>
              </div>
              {periodOpen && (
                <ul className={styles.options} role="listbox">
                  {periodOptions.map((option: number | null) => (
                    <li
                      key={option}
                      onClick={() => handlePeriodSelect(option)}
                      className={`${
                        option === periodSelected ? styles.selectedoption : ""
                      }`}
                      role="option"
                      aria-selected={option === periodSelected}
                    >
                      {periods.find((p) => p.id === option)?.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {!hideSubmitButton && (
          <button type="submit" aria-label="Caută în anunțuri">
            Vezi {postsCount} postări
          </button>
        )}
      </section>
    </form>
  );
}
