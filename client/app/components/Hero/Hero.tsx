import styles from "./Hero.module.scss";
import Image from "next/image";
import Counter from "../Counter/Counter";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* <div className={styles.adcontainer}>
        <Image src="/images/publicitate.png" alt="Publicitate" fill />
      </div> */}
      <div className={styles.maincontainer}>
        <div className={styles.text}>
          <div className={styles.slogan}>
            <Image src="/images/slogan.webp" alt="Logo Icon" fill priority />
          </div>
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
                sizes="100%"
                priority
              />
            </div>
            <Counter end={370} duration={3000} />
            <p>Cazuri încheiate cu succes</p>
          </div>
        </div>
        <div className={styles.input}>
          <div className={styles.adcontainer}>
            <Image src="/images/publicitate.png" alt="Publicitate" fill />
          </div>
          <input type="text" placeholder="Ce anume cauti?" />
          <input type="text" placeholder="Alege locatia..." />
          <input type="text" placeholder="Alege perioada..." />
          <button type="submit">Vezi 1021 raportări</button>
        </div>
      </div>
    </section>
  );
}
