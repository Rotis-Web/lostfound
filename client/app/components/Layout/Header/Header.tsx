import styles from "./Header.module.scss";
import Image from "next/image";
import Link from "next/link";
import { ProfileImage } from "../../UI/ProfileImage/ProfileImage";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.box}>
          {/* <Image src="/icons/menu.svg" alt="Menu Icon" width={28} height={28} /> */}
          <Link href="/" className={styles.logo}>
            <Image
              src="/images/test-logo.webp"
              alt="Logo Icon"
              width={90}
              height={55}
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
                width={25}
                height={25}
                draggable={false}
              />
              Despre noi
            </Link>
            <Link href="/search" className={styles.link}>
              <Image
                src="/icons/search-yellow.svg"
                alt="Yellow Search Icon"
                width={19}
                height={19}
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
    </header>
  );
}
