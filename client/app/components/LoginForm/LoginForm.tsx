"use client";

import styles from "./LoginForm.module.scss";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-toastify";

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

type AuthError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function LoginForm() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      router.push("/");
      toast.success("Te-ai logat cu succes!");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as AuthError;

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
      <div className={styles.login_form}>
        <h1>Bine ați venit!</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputbox}>
            <input
              type="text"
              value={email}
              placeholder="Introduceți adresa de email"
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({ ...errors, email: undefined, general: undefined });
              }}
              className={` ${
                errors.email || errors.general ? styles.error : ""
              }`}
            />
            {errors.email && (
              <span className={styles.errormessage}>{errors.email}</span>
            )}
          </div>
          <div className={styles.inputbox}>
            <input
              type="password"
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
            />
            {errors.password && (
              <span className={styles.errormessage}>{errors.password}</span>
            )}
          </div>
          <div className={styles.forgot_password_div}>
            <Link href="/forgot-password">
              <p className={styles.forgot_password}>Ai uitat parola?</p>
            </Link>
            <div className={styles.errorgeneral}>
              {errors.general && (
                <>
                  <Image
                    src="/icons/error.svg"
                    alt="Error Icon"
                    width={15}
                    height={15}
                  />
                  <span>{errors.general}</span>
                </>
              )}
            </div>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Intră în cont"}
          </button>
        </form>
        <div className={styles.login_options}>
          <hr></hr>
          <p> Sau conectează-te cu </p>
          <hr></hr>
        </div>
        <div className={styles.social_login}>
          <div className={styles.social}>
            <Image
              src="/icons/google.svg"
              alt="Google Icon"
              width={35}
              height={35}
            />
            <p>Google</p>
          </div>
          <div className={styles.social}>
            <Image
              src="/icons/facebook.svg"
              alt="Facebook Icon"
              width={45}
              height={45}
            />
            <p>Facebook</p>
          </div>
        </div>
        <div className={styles.signup}>
          <p>
            Nu aveți cont?
            <Link href="/register" className={styles.signup_link}>
              Creare cont
            </Link>
          </p>
        </div>
      </div>
      <div className={styles.login_image}>
        <Image
          src="/images/signin_image.avif"
          alt="Login Image"
          fill
          sizes="100%"
          priority
        />
      </div>
    </section>
  );
}
