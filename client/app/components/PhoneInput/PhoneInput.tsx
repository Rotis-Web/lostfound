"use client";

import styles from "./PhoneInput.module.scss";
import { useState, useEffect, useRef } from "react";

type CountryCode = {
  code: string;
  prefix: string;
  country: string;
  flag: string;
};

const countryCodes: CountryCode[] = [
  { code: "RO", prefix: "+40", country: "Romania", flag: "🇷🇴" },
  { code: "US", prefix: "+1", country: "United States", flag: "🇺🇸" },
  { code: "GB", prefix: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "DE", prefix: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "FR", prefix: "+33", country: "France", flag: "🇫🇷" },
  { code: "IT", prefix: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "ES", prefix: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "HU", prefix: "+36", country: "Hungary", flag: "🇭🇺" },
  { code: "BG", prefix: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "RS", prefix: "+381", country: "Serbia", flag: "🇷🇸" },
];

interface PhoneInputProps {
  onPhoneChange: (phone: string | null) => void;
  placeholder?: string;
  required?: boolean;
}

export default function PhoneInput({ onPhoneChange }: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] =
    useState<CountryCode[]>(countryCodes);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setCountryDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (phoneNumber.trim()) {
      const fullPhoneNumber = `${selectedCountry.prefix}${phoneNumber}`;
      onPhoneChange(fullPhoneNumber);
    } else {
      onPhoneChange(null);
    }
  }, [selectedCountry, phoneNumber, onPhoneChange]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
    setFilteredCountries(countryCodes);
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d\s\-\(\)]/g, "");
    setPhoneNumber(value);
  };

  const filterCountries = (searchTerm: string) => {
    if (!searchTerm) {
      setFilteredCountries(countryCodes);
      return;
    }

    const filtered = countryCodes.filter(
      (country) =>
        country.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.prefix.includes(searchTerm)
    );
    setFilteredCountries(filtered);
  };

  return (
    <div className={styles.phoneinput}>
      <div className={styles.inputbox}>
        <p className={styles.infotext}>
          Telefon <span style={{ color: "rgb(255, 215, 0)" }}> *</span>
        </p>
        <div className={styles.inputwrapper}>
          <div className={styles.countryselect} ref={countryDropdownRef}>
            <button
              className={styles.countrybutton}
              onClick={() => setCountryDropdownOpen(!countryDropdownOpen)}
              type="button"
            >
              <span className={styles.text}>{selectedCountry.code}</span>
              <span className={styles.text}>{selectedCountry.prefix}</span>
              <span className={styles.arrow}>
                {countryDropdownOpen ? "▲" : "▼"}
              </span>
            </button>

            {countryDropdownOpen && (
              <div className={styles.countryoptions}>
                <div className={styles.countrysearch}>
                  <input
                    type="text"
                    placeholder="Căutați țara..."
                    onChange={(e) => filterCountries(e.target.value)}
                    className={styles.countrysearchinput}
                  />
                </div>
                <div className={styles.countrylist}>
                  {filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      className={`${styles.countryoption} ${
                        selectedCountry.code === country.code
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <span className={styles.flag}>{country.flag}</span>
                      <span className={styles.countryname}>
                        {country.country}
                      </span>
                      <span className={styles.prefix}>{country.prefix}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className={styles.phoneinputwrapper}>
            <input
              type="tel"
              className={styles.phonenumberinput}
              placeholder="Introduceți numărul de telefon"
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
            />
            {phoneNumber && (
              <button
                className={styles.clear}
                onClick={() => setPhoneNumber("")}
                type="button"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
