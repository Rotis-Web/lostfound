"use client";

import { useAuth } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

export function ProfileImage() {
  const { user, loading } = useAuth();
  const profileImage = user?.profileImage || "/icons/user_profile.svg";

  if (loading) return <div style={{ width: 30, height: 30 }}></div>;

  return (
    <Link href={user ? "/profile" : "/login"}>
      <Image
        src={profileImage}
        alt="User Profile Icon"
        width={33}
        height={33}
        style={{ borderRadius: "50%" }}
        priority
      />
    </Link>
  );
}
