"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export function ProfileImage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          width: 35,
          height: 35,
          borderRadius: "50%",
          background: "#eee",
        }}
      />
    );
  }

  if (loading) {
    return (
      <div
        style={{
          width: 35,
          height: 35,
          borderRadius: "50%",
          background: "#eee",
        }}
      />
    );
  }

  const profileImage = user?.profileImage || "/icons/user-icon.svg";

  return (
    <Link href={user ? "/profile" : "/login"}>
      <Image
        src={profileImage}
        alt="User Profile Icon"
        width={35}
        height={35}
        style={{
          borderRadius: "50%",
          objectFit: "cover",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        }}
        priority
      />
    </Link>
  );
}
