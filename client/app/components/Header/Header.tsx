import styles from "./Header.module.scss";
import Image from "next/image";
import { ProfileImage } from "../ProfileImage/ProfileImage";

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
        />
        <Image
          src="/images/lostfound_logo.webp"
          alt="Logo Icon"
          width={75}
          height={45}
        />
      </div>
      <div className={styles.box}>
        <button className={styles.button}>Raportează</button>
        <ProfileImage />
      </div>
    </header>
  );
}
