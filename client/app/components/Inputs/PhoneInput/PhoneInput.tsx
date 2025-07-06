"use client";

import styles from "./PhoneInput.module.scss";
import { useState, useEffect, useRef } from "react";

type CountryCode = {
  code: string;
  prefix: string;
  country: string;
  flag: string;
};

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

const countryCodes: CountryCode[] = [
  { code: "RO", prefix: "+40", country: "România", flag: "🇷🇴" },
  { code: "MD", prefix: "+373", country: "Republica Moldova", flag: "🇲🇩" },
  { code: "IT", prefix: "+39", country: "Italia", flag: "🇮🇹" },
  { code: "ES", prefix: "+34", country: "Spania", flag: "🇪🇸" },
  { code: "DE", prefix: "+49", country: "Germania", flag: "🇩🇪" },
  { code: "FR", prefix: "+33", country: "Franța", flag: "🇫🇷" },
  { code: "GB", prefix: "+44", country: "Regatul Unit", flag: "🇬🇧" },
  {
    code: "US",
    prefix: "+1",
    country: "Statele Unite ale Americii",
    flag: "🇺🇸",
  },
  { code: "CA", prefix: "+1", country: "Canada", flag: "🇨🇦" },
  { code: "HU", prefix: "+36", country: "Ungaria", flag: "🇭🇺" },
  { code: "AT", prefix: "+43", country: "Austria", flag: "🇦🇹" },
  { code: "BE", prefix: "+32", country: "Belgia", flag: "🇧🇪" },
  { code: "NL", prefix: "+31", country: "Țările de Jos", flag: "🇳🇱" },
  { code: "CH", prefix: "+41", country: "Elveția", flag: "🇨🇭" },
  { code: "SE", prefix: "+46", country: "Suedia", flag: "🇸🇪" },
  { code: "NO", prefix: "+47", country: "Norvegia", flag: "🇳🇴" },
  { code: "DK", prefix: "+45", country: "Danemarca", flag: "🇩🇰" },
  { code: "FI", prefix: "+358", country: "Finlanda", flag: "🇫🇮" },
  { code: "IE", prefix: "+353", country: "Irlanda", flag: "🇮🇪" },
  { code: "GR", prefix: "+30", country: "Grecia", flag: "🇬🇷" },
  { code: "CY", prefix: "+357", country: "Cipru", flag: "🇨🇾" },
  { code: "LU", prefix: "+352", country: "Luxemburg", flag: "🇱🇺" },
  { code: "MT", prefix: "+356", country: "Malta", flag: "🇲🇹" },
  { code: "IS", prefix: "+354", country: "Islanda", flag: "🇮🇸" },
  { code: "BG", prefix: "+359", country: "Bulgaria", flag: "🇧🇬" },
  { code: "RS", prefix: "+381", country: "Serbia", flag: "🇷🇸" },
  { code: "UA", prefix: "+380", country: "Ucraina", flag: "🇺🇦" },
  { code: "AU", prefix: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "NZ", prefix: "+64", country: "Noua Zeelandă", flag: "🇳🇿" },
  { code: "AE", prefix: "+971", country: "Emiratele Arabe Unite", flag: "🇦🇪" },
  { code: "QA", prefix: "+974", country: "Qatar", flag: "🇶🇦" },
  { code: "IL", prefix: "+972", country: "Israel", flag: "🇮🇱" },
  { code: "TR", prefix: "+90", country: "Turcia", flag: "🇹🇷" },
];

interface PhoneInputProps {
  onPhoneChange: (phone: string | null) => void;
  errors?: string;
  clearError: (field: keyof FieldErrors) => void;
  initialPhone?: string | null;
  disabled?: boolean;
}

export default function PhoneInput({
  onPhoneChange,
  errors,
  clearError,
  initialPhone,
  disabled,
}: PhoneInputProps) {
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(
    countryCodes[0]
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryDropdownOpen, setCountryDropdownOpen] = useState(false);
  const [filteredCountries, setFilteredCountries] =
    useState<CountryCode[]>(countryCodes);

  const countryDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPhone) {
      const matchingCountry = countryCodes.find((c) =>
        initialPhone.startsWith(c.prefix)
      );
      if (matchingCountry) {
        setSelectedCountry(matchingCountry);
        setPhoneNumber(initialPhone.replace(matchingCountry.prefix, ""));
      } else {
        setPhoneNumber(initialPhone);
      }
    }
  }, [initialPhone]);

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
  }, [selectedCountry, phoneNumber, onPhoneChange, clearError]);

  const handleCountrySelect = (country: CountryCode) => {
    if (disabled) return;
    setSelectedCountry(country);
    setCountryDropdownOpen(false);
    setFilteredCountries(countryCodes);
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
          Numărul de telefon
          <span style={{ color: "rgb(255, 215, 0)" }}> *</span>
          <span
            className={`${errors ? styles.error : ""} ${errors && styles.info}`}
            style={{ marginLeft: "10px", opacity: 1 }}
          >
            {errors}
          </span>
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
                    disabled={disabled}
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
            <label htmlFor="phone" className={styles.hidden}>
              Număr de telefon
            </label>
            <input
              type="tel"
              name="phone"
              id="phone"
              autoComplete="tel"
              className={`${styles.phonenumberinput} ${
                errors ? styles.error : ""
              }`}
              placeholder="Introduceți numărul de telefon"
              value={phoneNumber}
              onChange={(e) => {
                const onlyNumbers = e.target.value.replace(/\D/g, "");
                setPhoneNumber(onlyNumbers);
                clearError("phone");
              }}
              aria-required="true"
            />
            {phoneNumber && (
              <button
                className={styles.clear}
                onClick={() => {
                  if (disabled) return;
                  setPhoneNumber("");
                  onPhoneChange(null);
                }}
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
