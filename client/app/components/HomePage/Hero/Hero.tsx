import styles from "./Hero.module.scss";
import Image from "next/image";
import Counter from "../Counter/Counter";
import SearchInput from "../SearchInput/SearchInput";

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* <div className={styles.adcontainer}>
        <Image src="/images/publicitate.png" alt="Publicitate" fill />
      </div> */}
      <div className={styles.maincontainer}>
        <div className={styles.text}>
          <div className={styles.slogan}>
            <Image
              src="/images/slogan.webp"
              alt="Logo Icon"
              fill
              sizes="100%"
              priority
            />
          </div>
          <h2>
            Animale și obiecte pierdute în România, regăsite cu ajutorul
            comunității
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
          <SearchInput />
        </div>
      </div>
    </section>
  );
}
