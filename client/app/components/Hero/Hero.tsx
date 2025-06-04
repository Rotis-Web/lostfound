import styles from "./Hero.module.scss";
import Image from "next/image";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* <div className={styles.adcontainer}>
        <Image src="/images/publicitate.png" alt="Publicitate" fill />
      </div> */}
      <div className={styles.maincontainer}>
        <div className={styles.text}>
          <h1>Împreuna redăm speranța</h1>
          <h2>
            Cea mai mare comunitate din România dedicată animalelor și
            obiectelor pierdute
          </h2>
          <div className={styles.countbox}>
            <div className={styles.image}>
              <Image
                src="/images/oameni_fericiti.webp"
                alt="Oameni Fericiti"
                fill
                priority
              />
            </div>
            <span>20.172</span>
            <p>Cazuri încheiate cu succes</p>
          </div>
        </div>
        <div className={styles.input}>
          <input type="text" placeholder="Ce anume cauti?" />
          <input type="text" placeholder="Alege locatia..." />
          <input type="text" placeholder="Alege perioada..." />
          <button type="submit">Vezi 1021 raportări</button>
        </div>
      </div>
    </section>
  );
}
