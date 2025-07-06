"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export function ProfileImage() {
  const { user, loading } = useAuth();
  const profileImage = user?.profileImage || "/icons/user-icon.svg";

  if (loading) return <div style={{ width: 30, height: 30 }}></div>;

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
