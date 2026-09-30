"use client";

import styles from "./page.module.scss";
import Image from "next/image";

// CreatePostForm leaves the new post's ID in sessionStorage under
// "createdPostID"; nothing on this page links to it yet.
export default function SuccessPage() {
  return (
    <main className={styles.successpage}>
      <section className={styles.container}>
        <div className={styles.image}>
          <Image
            src="/icons/success.svg"
            alt="Success Icon"
            fill
            sizes="100%"
            priority
            draggable={false}
          />
        </div>
        <h1>Postarea a fost creată cu succes!</h1>
        <p>
          Pentru orice întrebare, vă rugăm să ne contactați la adresa de email{" "}
          <a href="mailto:suport@lostfound.ro"> suport@lostfound.ro</a>
        </p>
        <button type="button" className={styles.button}>
          Promovează postarea
          <Image
            src="/icons/arrow-right-white.svg"
            alt="Pictogramă sageată dreapta"
            width={23}
            height={23}
            priority
            draggable={false}
          />
        </button>
        <h3>Nu, mulțumesc</h3>
      </section>
    </main>
  );
}
