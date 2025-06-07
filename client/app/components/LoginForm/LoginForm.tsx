"use client";

import styles from "./LoginForm.module.scss";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginForm() {
  const { login, logout, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      await login(email, password);
      // Clear form and errors on success if you want
      setEmail("");
      setPassword("");
    } catch (err: any) {
      console.log({ err });
      // Expecting err to have shape { message, field, errors? }
      if (err?.code === "VALIDATION_ERROR" && Array.isArray(err.errors)) {
        const fieldErrors: FieldErrors = {};
        err.errors.forEach((error: { field: string; message: string }) => {
          fieldErrors[error.field as keyof FieldErrors] = error.message;
        });
        setErrors(fieldErrors);
      } else if (err?.field && err?.message) {
        setErrors({ [err.field]: err.message });
      } else {
        setErrors({ general: err.message || "An unexpected error occurred" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {errors.general && (
        <div
          style={{
            background: "#ffe5e5",
            color: "#c00",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "1rem",
          }}
        >
          {errors.general}
        </div>
      )}

      <input
        type="email"
        value={email}
        placeholder="Email"
        onChange={(e) => {
          setEmail(e.target.value);
          setErrors({ ...errors, email: undefined });
        }}
        required
      />
      {errors.email && (
        <p style={{ color: "green", marginTop: "4px" }}>{errors.email}</p>
      )}

      <input
        type="password"
        value={password}
        placeholder="Password"
        onChange={(e) => {
          setPassword(e.target.value);
          setErrors({ ...errors, password: undefined });
        }}
        required
      />
      {errors.password && (
        <p style={{ color: "red", marginTop: "4px" }}>{errors.password}</p>
      )}

      <button onClick={handleSubmit} disabled={loading}>
        {loading ? "Logging in..." : "Login"}
      </button>

      <button onClick={logout} style={{ marginLeft: "1rem" }}>
        Logout
      </button>

      {user && <p>Logged in as {user.email}</p>}
    </div>
  );
}
