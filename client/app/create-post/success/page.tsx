"use client";

import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import Image from "next/image";

export default function SuccessPage() {
  const [postID, setPostID] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("createdPostID");
    setPostID(id);
  }, []);

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
          />
        </div>
        <h1>Postarea a fost creată cu succes!</h1>
        <p>
          Pentru orice întrebare, vă rugăm să ne contactați la adresa de email{" "}
          <a href="mailto:suport@lostfound.ro"> suport@lostfound.ro</a>
        </p>
      </section>
    </main>
  );
}
