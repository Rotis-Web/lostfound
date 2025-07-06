"use client";

import styles from "./MapInput.module.scss";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Circle,
} from "react-leaflet";
import L, { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import { toast } from "react-toastify";

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  content?: string;
  category?: string;
  images?: string;
  location?: string;
  general?: string;
};

const romaniaBounds: LatLngBounds = L.latLngBounds([43.5, 20.2], [48.3, 29.7]);

const customIcon = L.icon({
  iconUrl: "/icons/marker.svg",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

interface MapLocationInputProps {
  onLocationChange: (location: LocationData | null) => void;
  errors?: string;
  clearError: (field: keyof FieldErrors) => void;
  initialLocation?: LocationData | null;
  disabled?: boolean;
}

function ClickableMap({
  onClick,
}: {
  onClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      if (romaniaBounds.contains(e.latlng)) {
        onClick(lat, lng);
      }
    },
  });
  return null;
}

export default function MapInput({
  onLocationChange,
  errors,
  clearError,
  initialLocation,
  disabled,
}: MapLocationInputProps) {
  const [locationQuery, setLocationQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [markerPosition, setMarkerPosition] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [selectedRadius, setSelectedRadius] = useState(0);
  const [radiusOpen, setRadiusOpen] = useState(false);
  const [hasSelected, setHasSelected] = useState(false);
  const [locationName, setLocationName] = useState("");

  const radiusOptions = [0, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10];
  const mapRef = useRef<L.Map>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const radiusSelectRef = useRef<HTMLDivElement>(null);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (!initializedRef.current && initialLocation) {
      initializedRef.current = true;
      const { name, lat, lng, radius } = initialLocation;
      setMarkerPosition({ lat, lng });
      setLocationName(name);
      setLocationQuery(name);
      setSelectedRadius(radius);
      setHasSelected(true);
      if (mapRef.current) {
        mapRef.current.setView([lat, lng], 12);
      }
    }
  }, [initialLocation]);

  const handleOutsideClick = (event: MouseEvent) => {
    if (
      radiusSelectRef.current &&
      !radiusSelectRef.current.contains(event.target as Node)
    ) {
      setRadiusOpen(false);
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

  const fetchLocationName = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/geo/reverse?lat=${lat}&lon=${lng}`,
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
        return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
      }

      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch (err) {
      console.error("Failed to fetch location name:", err);
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  useEffect(() => {
    if (hasSelected) return;

    const delayDebounce = setTimeout(() => {
      if (locationQuery.length > 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [locationQuery, fetchSuggestions, hasSelected]);

  useEffect(() => {
    if (markerPosition && locationName) {
      const locationData: LocationData = {
        name: locationName,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
        radius: selectedRadius,
      };
      onLocationChange(locationData);
    } else {
      onLocationChange(null);
    }
  }, [markerPosition, locationName, selectedRadius, onLocationChange]);

  const handleMapClick = async (lat: number, lng: number) => {
    if (disabled) return;
    setMarkerPosition({ lat, lng });
    const name = await fetchLocationName(lat, lng);
    setLocationName(name);
    setLocationQuery(name);
    setHasSelected(true);
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: Suggestion) => {
    if (disabled) return;
    const lat = parseFloat(suggestion.lat);
    const lng = parseFloat(suggestion.lon);

    setMarkerPosition({ lat, lng });
    setLocationName(suggestion.display_name);
    setLocationQuery(suggestion.display_name);
    setHasSelected(true);
    setSuggestions([]);

    if (mapRef.current) {
      mapRef.current.setView([lat, lng], 12);
    }
  };

  const clearLocation = () => {
    if (disabled) return;
    setLocationQuery("");
    setMarkerPosition(null);
    setLocationName("");
    setHasSelected(false);
    setSuggestions([]);
  };

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
        <span style={{ color: "rgb(255, 215, 0)" }}>
          {text.slice(actualStart, actualEnd)}
        </span>
        {text.slice(actualEnd)}
      </>
    );
  }

  return (
    <div className={styles.mapinput}>
      <div className={styles.searchbox}>
        <p className={styles.infotext}>
          Locație <span style={{ color: "rgb(255, 215, 0)" }}> *</span>
          <span
            className={`${errors ? styles.error : ""} ${errors && styles.info}`}
            style={{ marginLeft: "10px", opacity: 1 }}
          >
            {errors}
          </span>
        </p>
        <div className={styles.searchwrapper}>
          <label htmlFor="location" className={styles.hidden}>
            Locație
          </label>
          <input
            type="text"
            name="location"
            id="location"
            className={`${styles.locationinput} ${
              errors ? styles.inputerror : ""
            }`}
            placeholder="Căutați o locație în România sau faceți clic pe hartă"
            value={locationQuery}
            onChange={(e) => {
              setLocationQuery(e.target.value);
              setHasSelected(false);
              clearError("location");
            }}
            aria-required="true"
            disabled={disabled}
          />
          {locationQuery && (
            <button
              className={styles.clear}
              onClick={() => {
                if (disabled) return;
                clearLocation();
              }}
              type="button"
            >
              ✕
            </button>
          )}
          <div className={styles.radiusselect} ref={radiusSelectRef}>
            <button
              className={styles.radiusbutton}
              onClick={() => setRadiusOpen(!radiusOpen)}
              type="button"
            >
              <p>
                {selectedRadius >= 1
                  ? `+ ${selectedRadius} km`
                  : `+ ${selectedRadius * 1000} m`}
              </p>
              <span>{radiusOpen ? "▲" : "▼"}</span>
            </button>
            {radiusOpen && (
              <div className={styles.radiusoptions}>
                {radiusOptions.map((opt) => (
                  <div
                    key={opt}
                    className={`${styles.radiusoption} ${
                      opt === selectedRadius ? styles.selected : ""
                    }`}
                    onClick={() => {
                      if (disabled) return;
                      setSelectedRadius(opt);
                      setRadiusOpen(false);
                    }}
                  >
                    {opt >= 1 ? `+ ${opt} km` : `+ ${opt * 1000} m`}
                  </div>
                ))}
              </div>
            )}
          </div>
          {suggestions.length > 0 && (
            <div className={styles.suggestions} ref={searchRef}>
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={styles.suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {highlightMatch(suggestion.display_name, locationQuery)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.map}>
        <MapContainer
          ref={mapRef}
          center={[45.9432, 24.9668]}
          zoom={6}
          minZoom={6}
          maxZoom={18}
          maxBounds={romaniaBounds}
          maxBoundsViscosity={1.0}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
          />
          <ClickableMap onClick={handleMapClick} />
          {markerPosition && (
            <>
              <Marker
                position={[markerPosition.lat, markerPosition.lng]}
                icon={customIcon}
              />
              <Circle
                center={[markerPosition.lat, markerPosition.lng]}
                radius={selectedRadius * 1000}
                pathOptions={{
                  color: "rgb(255, 215, 0)",
                  fillColor: "rgb(255, 215, 0)",
                  fillOpacity: 0.1,
                  weight: 2,
                }}
              />
            </>
          )}
        </MapContainer>
      </div>

      {markerPosition && locationName && (
        <div className={styles.selectedlocation}>
          <strong>Locația selectată:</strong>
          {locationName}
          <br />
          <small>
            Coordonate: {markerPosition.lat.toFixed(5)},{" "}
            {markerPosition.lng.toFixed(5)} | Raza: {selectedRadius} km
          </small>
        </div>
      )}
    </div>
  );
}
