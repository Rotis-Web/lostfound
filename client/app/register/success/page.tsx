"use client";

import { useEffect, useState } from "react";

import styles from "./page.module.scss";

export default function RegisterSuccess() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("registeredEmail");
    setEmail(storedEmail);
  }, []);

  return (
    <main className={styles.success}>
      <section className={styles.container}>
        <div className={styles.p1}>
          <h1>Mulțumim pentru înregistrare!</h1>

          <p>Te rugăm să verifici email-ul de confirmare la adresa</p>
          {email && <a href={`mailto:${email}`}>{email}</a>}
          <ul>
            <li>
              Dacă nu ai primit email-ul, te rugăm sa verifici secțiunea spam.
            </li>
            <li>Verifică dacă adresa folosită este corectă</li>
            <li>
              Dacă nu puteți rezolva problema, contactează-ne la adresa{" "}
              <a href="mailto:suport@lostfound.ro">suport@lostfound.ro</a>
            </li>
          </ul>
        </div>
        <div className={styles.image}></div>
      </section>
    </main>
  );
}
