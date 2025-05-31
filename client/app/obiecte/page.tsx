import styles from "./page.module.scss";
import Image from "next/image";
import Link from "next/link";

export default function Obiecte() {
  return (
    <div className={styles.obiecte}>
      <div className={styles.container}>
        <div className={styles.buttonbox}>
          <button className={`${styles.button} ${styles.active}`}>
            Obiecte
          </button>
          <Link href="/animale" className={styles.button}>
            Animale
          </Link>
        </div>
        <div className={styles.adcontainer}>
          <Image src="/images/publicitate.png" alt="Lost & Found Ad" fill />
        </div>
      </div>
    </div>
  );
}
