"use client";

import styles from "./Header.module.scss";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ProfileImage } from "../../UI/ProfileImage/ProfileImage";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.overlay}>
        <div className={styles.box}>
          <button
            className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label="Toggle menu"
            type="button"
          >
            <svg viewBox="0 0 32 32">
              <path
                className={`${styles.line} ${styles.linetopbottom}`}
                d="M27 10 13 10C10.8 10 9 8.2 9 6 9 3.5 10.8 2 13 2 15.2 2 17 3.8 17 6L17 26C17 28.2 18.8 30 21 30 23.2 30 25 28.2 25 26 25 23.8 23.2 22 21 22L7 22"
              ></path>
              <path className={styles.line} d="M7 16 27 16"></path>
            </svg>
          </button>

          <Link href="/" className={styles.logo}>
            <Image
              src="/images/test-logo.webp"
              alt="Logo Icon"
              width={95}
              height={60}
              draggable={false}
              priority
            />
          </Link>
        </div>
        <div className={styles.box}>
          <div className={styles.links}>
            <Link href="/" className={styles.link}>
              <Image
                src="/icons/about.svg"
                alt="About Icon"
                width={20}
                height={20}
                draggable={false}
                style={{ marginRight: "3px" }}
              />
              Despre noi
            </Link>
            <Link href="/" className={styles.link}>
              <Image
                src="/icons/notebook.svg"
                alt="Notebook Icon"
                width={23}
                height={23}
                draggable={false}
              />
              Blog & Noutăți
            </Link>
            <Link href="/search" className={styles.link}>
              <Image
                src="/icons/search-yellow.svg"
                alt="Yellow Search Icon"
                width={21}
                height={21}
                draggable={false}
              />
              Caută anunțuri
            </Link>
            <Link href="/search" className={styles.link}>
              <Image
                src="/icons/yellow-heart.svg"
                alt="Yellow Heart Icon"
                width={20}
                height={20}
                draggable={false}
              />
              Cazuri fericite
            </Link>
            <Link href="/search" className={styles.link}>
              <Image
                src="/badges/crew-badge.webp"
                alt="Lost & Found Crew Badge"
                width={30}
                height={30}
                draggable={false}
              />
              Lost & Found Crew
            </Link>
          </div>
          <Link href="/create-post">
            <button className={styles.button}>
              <span>+ </span> Postează
            </button>
          </Link>
          <ProfileImage />
        </div>
      </div>

      <div
        className={`${styles.extendedmenu} ${isOpen ? styles.open : ""}`}
        ref={menuRef}
      >
        <div className={styles.menuitem}>
          <Link href="/" className={styles.link} onClick={closeMenu}>
            <Image
              src="/icons/about.svg"
              alt="About Icon"
              width={22}
              height={22}
              draggable={false}
            />
            Despre noi
          </Link>
        </div>
        <div className={styles.menuitem}>
          <Link href="/" className={styles.link} onClick={closeMenu}>
            <Image
              src="/icons/notebook.svg"
              alt="Notebook Icon"
              width={25}
              height={25}
              draggable={false}
            />
            Blog & Noutăți
          </Link>
        </div>
        <div className={styles.menuitem}>
          <Link href="/search" className={styles.link} onClick={closeMenu}>
            <Image
              src="/icons/search-yellow.svg"
              alt="Yellow Search Icon"
              width={23}
              height={23}
              draggable={false}
            />
            Caută anunțuri
          </Link>
        </div>
        <div className={styles.menuitem}>
          <Link href="/search" className={styles.link} onClick={closeMenu}>
            <Image
              src="/icons/yellow-heart.svg"
              alt="Yellow Heart Icon"
              width={22}
              height={22}
              draggable={false}
            />
            Cazuri fericite
          </Link>
        </div>
        <div className={styles.menuitem}>
          <Link href="/search" className={styles.link} onClick={closeMenu}>
            <Image
              src="/badges/crew-badge.webp"
              alt="Lost & Found Crew Badge"
              width={32}
              height={32}
              draggable={false}
            />
            Lost & Found Crew
          </Link>
        </div>
      </div>
    </header>
  );
}
