// app/verify/page.tsx
"use client";

import styles from "./page.module.scss";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Image from "next/image";

const VerifyPage = () => {
  const { verifyEmail } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setMessage("Tokenul de verificare lipsește din link.");
      return;
    }

    let hasVerified = false;

    const verify = async () => {
      if (hasVerified) return;
      hasVerified = true;

      try {
        await verifyEmail(token);
        setStatus("success");
        setMessage(
          "Email-ul a fost verificat cu succes! Vei fi redirecționat..."
        );
        setTimeout(() => router.push("/"), 2500);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Verificarea a eșuat.");
      }
    };

    verify();
  }, [searchParams, router, verifyEmail]);

  return (
    <main className={styles.container}>
      {status === "verifying" && (
        <div className={styles.box}>
          {" "}
          <Image
            src="/gifs/loading.gif"
            alt="Loading Gif"
            width={150}
            height={150}
            priority
          />
          <p>Se verifică tokenul...</p>
        </div>
      )}
      {status === "success" && (
        <div className={styles.box}>
          {" "}
          <Image
            src="/gifs/success.gif"
            alt="Success Gif"
            width={150}
            height={150}
            priority
          />
          <p className="text-green-600">{message}</p>
        </div>
      )}
      {status === "error" && (
        <div className={styles.box}>
          {" "}
          <Image
            src="/gifs/error.gif"
            alt="Error Image"
            width={150}
            height={150}
            priority
          />
          <p className="text-red-600">{message}</p>
        </div>
      )}
    </main>
  );
};

export default VerifyPage;
