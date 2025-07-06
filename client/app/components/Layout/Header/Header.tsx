import styles from "./Header.module.scss";
import Image from "next/image";
import Link from "next/link";
import { ProfileImage } from "../../UI/ProfileImage/ProfileImage";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.box}>
        <Image
          src="/icons/menu.svg"
          alt="Menu Icon"
          width={28}
          height={28}
          style={{ opacity: 0.75 }}
          draggable={false}
          priority
        />
        <Link href="/" className={styles.logo}>
          <Image
            src="/images/lostfound_logo.webp"
            alt="Logo Icon"
            width={75}
            height={45}
            draggable={false}
            priority
          />
        </Link>
      </div>
      <div className={styles.box}>
        <Link href="/create-post">
          <button className={styles.button}>
            <span>+ </span> Postează
          </button>
        </Link>
        <ProfileImage />
      </div>
    </header>
  );
}
