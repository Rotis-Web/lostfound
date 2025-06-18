"use client";

import styles from "./SearchInput.module.scss";
import { useState } from "react";
import Image from "next/image";

export default function SearchInput() {
  const [distanceSelected, setDistanceSelected] = useState(1);
  const [distanceOpen, setDistanceOpen] = useState(false);
  const distanceOptions = [1, 2, 5, 10];

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

  return (
    <div className={styles.container}>
      <input type="text" placeholder="Ce anume cauți?" />
      <div className={styles.inputbox}>
        <Image
          src="/icons/location_pin.svg"
          alt="Location Pin Icon"
          width={27}
          height={27}
        />
        <input type="text" placeholder="În ce loc cauți?" />
        <div className={styles.select_wrapper}>
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
                {distanceOptions
                  .filter((opt) => opt !== distanceSelected)
                  .map((opt) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setDistanceSelected(opt);
                        setDistanceOpen(false);
                      }}
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
          alt="Calendar Icon"
          width={27}
          height={27}
        />
        <input type="text" placeholder="Perioada" disabled={true} />
        <div className={styles.select_wrapper} style={{ width: "170px" }}>
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
                {periodOptions
                  .filter((opt: number | null) => opt !== periodSelected)
                  .map((opt: number | null) => (
                    <li
                      key={opt}
                      onClick={() => {
                        setPeriodSelected(opt);
                        setPeriodOpen(false);
                      }}
                    >
                      {periods.find((p) => p.id === opt)?.name}
                    </li>
                  ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      <button type="submit">Vezi 1021 postări</button>
    </div>
  );
}
