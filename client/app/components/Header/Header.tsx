import styles from "./Header.module.scss";
import Image from "next/image";

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
        <Image
          src="/icons/user_profile.svg"
          alt="User Profile Icon"
          width={30}
          height={30}
          style={{ opacity: 0.75 }}
        />
      </div>
    </header>
  );
}
