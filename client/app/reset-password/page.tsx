"use client";

import styles from "./page.module.scss";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import Image from "next/image";

type FieldErrors = {
  password?: string;
  confirmPassword?: string;
  token?: string;
  general?: string;
};

type ResetPasswordErrors = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const token = searchParams.get("token");

      if (!token) {
        setErrors({
          general: "Tokenul de resetare lipsește din link.",
        });
        setLoading(false);
        return;
      }

      await resetPassword(token, password, confirmPassword);
      toast.success(
        "Parola a fost resetată cu succes! Vei fi redirecționat..."
      );
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as ResetPasswordErrors;

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
    <main className={styles.resetpassword}>
      <div className={styles.container}>
        <h1>Resetare parolă</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputbox}>
            <Image
              src="/icons/password.svg"
              alt="Password icon"
              width={25}
              height={25}
              draggable={false}
            />
            <label htmlFor="password" className={styles.hidden}>
              Parola nouă
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Parola nouă"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors({
                  ...errors,
                  password: undefined,
                  general: undefined,
                });
              }}
              className={`${
                errors.password || errors.general ? styles.error : ""
              }`}
              aria-required="true"
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
              placeholder="Confirmă parola"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setErrors({
                  ...errors,
                  confirmPassword: undefined,
                  general: undefined,
                });
              }}
              className={`${
                errors.confirmPassword || errors.general ? styles.error : ""
              }`}
              aria-required="true"
            />
            {errors.confirmPassword && (
              <span className={styles.errormessage}>
                {errors.confirmPassword}
              </span>
            )}
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Se procesează..." : "Resetare parolă"}
          </button>
          {errors.general && (
            <div className={styles.errorgeneral}>
              <span>&#x26A0; {errors.general}</span>
            </div>
          )}
        </form>
      </div>
    </main>
  );
}
