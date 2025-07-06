"use client";

import styles from "./RegisterForm.module.scss";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";
import Link from "next/link";

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  general?: string;
};

type AuthError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function RegisterForm() {
  const { register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Parolele nu se potrivesc" });
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password);
      sessionStorage.setItem("registeredEmail", email);
      router.push("/register/success");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as AuthError;

        if (error.code === "TOO_MANY_REGISTRATION_ATTEMPTS") {
          toast.error(error.message);
          return;
        }

        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.errors)) {
          const fieldErrors: FieldErrors = {};
          error.errors.forEach(({ field, message }) => {
            fieldErrors[field as keyof FieldErrors] = message;
          });
          setErrors(fieldErrors);
        } else if (error.field && error.message) {
          setErrors({ [error.field]: error.message });
        } else {
          setErrors({
            general: error.message || "A apărut o eroare neașteptată",
          });
        }
      } else {
        setErrors({ general: "Eroare necunoscută" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles.container}>
      <div className={styles.register_form}>
        <h1>Creare cont</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputbox}>
            <Image
              src="/icons/name.svg"
              alt="Name icon"
              width={25}
              height={25}
              draggable={false}
            />
            <label htmlFor="name" className={styles.hidden}>
              Nume
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={name}
              autoComplete="true"
              placeholder="Introduceți numele complet"
              onChange={(e) => {
                setName(e.target.value);
                setErrors({ ...errors, name: undefined, general: undefined });
              }}
              className={` ${
                errors.name || errors.general ? styles.error : ""
              }`}
              aria-required="true"
              disabled={loading}
            />
            {errors.name && (
              <span className={styles.errormessage}>{errors.name}</span>
            )}
          </div>

          <div className={styles.inputbox}>
            <Image
              src="/icons/email.svg"
              alt="Email icon"
              width={25}
              height={25}
              draggable={false}
            />
            <label htmlFor="email" className={styles.hidden}>
              Email
            </label>
            <input
              type="text"
              name="email"
              id="email"
              value={email}
              autoComplete="true"
              placeholder="Introduceți adresa de email"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined, general: undefined });
              }}
              className={` ${
                errors.email || errors.general ? styles.error : ""
              }`}
              aria-required="true"
              disabled={loading}
            />
            {errors.email && (
              <span className={styles.errormessage}>{errors.email}</span>
            )}
          </div>

          <div className={styles.inputbox}>
            <Image
              src="/icons/password.svg"
              alt="Password icon"
              width={25}
              height={25}
              draggable={false}
            />
            <label htmlFor="password" className={styles.hidden}>
              Parola
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={password}
              placeholder="Introduceți parola"
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({
                  ...errors,
                  password: undefined,
                  general: undefined,
                });
              }}
              className={` ${
                errors.password || errors.general ? styles.error : ""
              }`}
              aria-required="true"
              disabled={loading}
            />
            {errors.password && (
              <span className={styles.errormessage}>{errors.password}</span>
            )}
          </div>

          <div className={styles.inputbox}>
            <Image
              src="/icons/password.svg"
              alt="Password icon"
              width={25}
              height={25}
              draggable={false}
            />
            <label htmlFor="confirmPassword" className={styles.hidden}>
              Confirmare parolă
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              value={confirmPassword}
              placeholder="Confirmați parola"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({
                  ...errors,
                  confirmPassword: undefined,
                  general: undefined,
                });
              }}
              className={` ${
                errors.confirmPassword || errors.general ? styles.error : ""
              }`}
              aria-required="true"
              disabled={loading}
            />
            {errors.confirmPassword && (
              <span className={styles.errormessage}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <div className={styles.errorgeneral}>
            {errors.general && (
              <>
                <Image
                  src="/icons/error.svg"
                  alt="Error Icon"
                  width={15}
                  height={15}
                  draggable={false}
                />
                <span>{errors.general}</span>
              </>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Se încarcă..." : "Creează cont"}
          </button>
        </form>

        <div className={styles.login_options}>
          <hr />
          <p> Sau înregistrează-te cu </p>
          <hr />
        </div>

        <div className={styles.social_login}>
          <div className={styles.social}>
            <Image
              src="/icons/google.svg"
              alt="Google Icon"
              width={35}
              height={35}
              draggable={false}
            />
            <p>Google</p>
          </div>
          <div className={styles.social}>
            <Image
              src="/icons/facebook.svg"
              alt="Facebook Icon"
              width={45}
              height={45}
              draggable={false}
            />
            <p>Facebook</p>
          </div>
        </div>

        <div className={styles.login}>
          <p>
            Ai deja un cont?
            <Link href="/login" className={styles.login_link}>
              Intră în cont
            </Link>
          </p>
        </div>
      </div>

      <div className={styles.register_image}>
        <Image
          src="/images/register_image.webp"
          alt="Register Image"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          priority
          draggable={false}
        />
      </div>
    </section>
  );
}
