"use client";

import styles from "./page.module.scss";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Image from "next/image";

type ForgotPasswordErrors = {
  code?: string;
  message?: string;
};

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  const { forgotPassword, loading } = useAuth();

  const handleEmailSubmit = async () => {
    try {
      const message = await forgotPassword(email);
      setEmail("");
      toast.info(message);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as ForgotPasswordErrors;
        if (error.code && error.message) {
          toast.error(error.message);
        } else {
          toast.error("A aparut o eroare neasteptata");
        }
      }
    }
  };

  return (
    <main className={styles.forgotpassword}>
      <div className={styles.container}>
        <h1>Ai uitat parola?</h1>
        <p>
          Vă rugăm sa introduceți adresa de email asociată contului mai jos. Vă
          vom trimite un link pentru a reseta parola.
        </p>
        <div className={styles.inputbox}>
          <Image
            src="/icons/email.svg"
            alt="Email icon"
            width={25}
            height={25}
          />
          <input
            type="text"
            placeholder="Introduceți adresa de email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button onClick={handleEmailSubmit}>
          {loading ? "Se trimite..." : "Trimite"}
        </button>
      </div>
    </main>
  );
}
