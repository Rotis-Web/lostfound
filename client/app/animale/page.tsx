import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function Animale() {
  return (
    <div className={styles.animale}>
      <div className={styles.container}>
        <div className={styles.buttonbox}>
          <Link href="/obiecte" className={styles.button}>
            Obiecte
          </Link>
          <button className={`${styles.button} ${styles.active}`}>
            Animale
          </button>
        </div>
        <div className={styles.adcontainer}>
          <Image src="/images/publicitate.png" alt="Lost & Found Ad" fill />
        </div>
      </div>
    </div>
  );
}
