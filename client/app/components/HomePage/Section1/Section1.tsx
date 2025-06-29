import styles from "./Section1.module.scss";
import Image from "next/image";

export default function Section1() {
  return (
    <section className={styles.section1}>
      <div className={styles.container}>
        <div className={styles.box}>
          <Image
            src="/images/pros1.webp"
            alt="Găsește rapid oriunde în România"
            fill
            sizes="100%"
            priority
          />
        </div>
        <div className={styles.box}>
          <Image
            src="/images/pros3.webp"
            alt="#1 cea mai mare bază de date"
            fill
            sizes="100%"
            priority
          />
        </div>
        <div className={styles.box}>
          <Image
            src="/images/pros2.webp"
            alt="Postează gratuit și noi te vom ajuta"
            fill
            sizes="100%"
            priority
          />
        </div>
      </div>
    </section>
  );
}
