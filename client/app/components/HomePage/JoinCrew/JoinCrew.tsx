import styles from "./JoinCrew.module.scss";
import Image from "next/image";

export default function JoinCrew() {
  return (
    <section className={styles.joincrew}>
      <div className={styles.image}>
        <Image
          src="/images/crew.webp"
          alt="Crew"
          fill
          sizes="100%"
          draggable={false}
        />
      </div>
      <form className={styles.form}>
        <h2>Te rugăm sa te aliniă cu comunitatea noastră</h2>
        <p>Dacă ai nevoie de ajutor, te rugăm sa ne contactezi la adresa</p>
        <a href="mailto:suport@lostfound.ro">suport@lostfound.ro</a>
      </form>
    </section>
  );
}
