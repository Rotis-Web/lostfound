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
      <div className={styles.box}>
        <h3>
          <span className={styles.yellow}>lost</span> &{" "}
          <span className={styles.yellow}>found</span> Crew este o echipă de
          voluntari, iubitori de animale, oameni dornici să îi ajute pe cei
          aflați în nevoie.
        </h3>
        <br></br>
        {/* <h3>
          Alătură-te celor peste 100 de membri ai echipei noastre și fii gata să
          oferi ajutor!
        </h3> */}
        <h3>
          Echipa noastră crește în fiecare zi, iar oameni ca tine sunt mereu
          bineveniți să se alăture!
        </h3>
        <br></br>
        <h3>
          Vei fi notificat în momentul în care apare un anunț în zona ta.
          Împreună putem face lumea un loc mai bun.
        </h3>
        <div className={styles.buttonbox}>
          <button>Alătură-te acum</button>
        </div>
      </div>
    </section>
  );
}
