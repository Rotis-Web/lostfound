"use client";

import styles from "./SearchInput.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import { toast } from "react-toastify";

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

export default function SearchInput() {
  const [query, setQuery] = useState("");

  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCoords, setSelectedCoords] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const [hasSelected, setHasSelected] = useState(false);

  const [distanceSelected, setDistanceSelected] = useState(1);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const distanceOptions = [1, 2, 5, 10, 20, 30, 50];

  const [periodSelected, setPeriodSelected] = useState<number | null>(null);
  const [periodOpen, setPeriodOpen] = useState(false);
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

  const handleOutsideClick = (event: MouseEvent) => {
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
  };

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const fetchSuggestions = useCallback(async () => {
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
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || `Eroare ${res.status}`);
        return;
      }
      setSuggestions(data);
    } catch (err) {
      console.error("Failed to fetch location suggestions:", err);
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

  return (
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
          style={{ paddingRight: "38px" }}
          aria-label="Ce anume cauți?"
        />
        {query && (
          <span
            className={styles.clear}
            onClick={() => setQuery("")}
            style={{ right: "15px" }}
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
        />
        {locationQuery && (
          <span
            className={styles.clear}
            onClick={() => setLocationQuery("")}
            style={{ right: "115px" }}
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
            setLocationQuery(e.target.value);
            setHasSelected(false);
          }}
          style={{ paddingRight: "138px", paddingLeft: "42px" }}
          aria-label="În ce loc cauți?"
        />
        <ul
          className={`${styles.suggestionlist} ${
            suggestions.length ? "" : styles.hidden
          }`}
          role="listbox"
          aria-live="polite"
        >
          {suggestions.map((s, i) => (
            <li
              key={i}
              onClick={() => {
                setLocationQuery(s.display_name);
                setSelectedCoords({
                  lat: parseFloat(s.lat),
                  lon: parseFloat(s.lon),
                });
                setSuggestions([]);
                setHasSelected(true);
              }}
            >
              {highlightMatch(s.display_name, locationQuery)}
            </li>
          ))}
        </ul>
        {/* {selectedCoords && (
          <div>
            <p>lat: {selectedCoords.lat}</p>
            <p>lon: {selectedCoords.lon}</p>
          </div>
        )} */}
        <div className={styles.select_wrapper} ref={distanceSelectRef}>
          <div
            className={styles.select}
            onClick={() => {
              setDistanceOpen(!distanceOpen);
              setPeriodOpen(false);
            }}
          >
            <div className={styles.selected}>
              <p> + {distanceSelected} km </p>
              <span>{distanceOpen ? "▲" : "▼"}</span>
            </div>
            {distanceOpen && (
              <ul className={styles.options}>
                {distanceOptions.map((opt) => (
                  <li
                    key={opt}
                    onClick={() => {
                      setDistanceSelected(opt);
                      setDistanceOpen(false);
                    }}
                    className={`${
                      opt === distanceSelected ? styles.selectedoption : ""
                    }`}
                  >
                    + {opt} km
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
        />
        <label className={styles.hidden} htmlFor="period">
          În ce perioadă cauți?
        </label>
        <input
          type="text"
          name="period"
          id="period"
          placeholder="Perioada"
          disabled={true}
          style={{ paddingLeft: "42px" }}
          aria-label="În ce perioadă cauți?"
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
          >
            <div className={styles.selected}>
              <p>{periods.find((p) => p.id === periodSelected)?.name}</p>
              <span>{periodOpen ? "▲" : "▼"}</span>
            </div>
            {periodOpen && (
              <ul className={styles.options}>
                {periodOptions.map((opt: number | null) => (
                  <li
                    key={opt}
                    onClick={() => {
                      setPeriodSelected(opt);
                      setPeriodOpen(false);
                    }}
                    className={`${
                      opt === periodSelected ? styles.selectedoption : ""
                    }`}
                  >
                    {periods.find((p) => p.id === opt)?.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <button type="submit" aria-label="Caută în anunțuri">
        Vezi 1021 postări
      </button>
    </section>
  );
}
