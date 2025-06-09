"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <main className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.content}>
          <div className={styles.content_items}>
            {user?.profileImage && (
              <div className={styles.image}>
                <Image
                  src={user.profileImage}
                  alt="User Profile Icon"
                  fill
                  sizes="100%"
                  priority
                />
              </div>
            )}
            <h1 className={styles.name}>{user?.name}</h1>
          </div>
        </div>
        <div className={styles.info}>
          <p>{user?.email}</p>
          <div className={styles.id}>ID: {user?.lostfoundID}</div>
        </div>
        <div className={styles.membersince}>
          <p>
            Membru Lost & Found din {""}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                })
              : ""}
          </p>
        </div>
        <div className={styles.buttoncontainer}>
          <button className={styles.button}>
            <Image
              src="/icons/add-plus.svg"
              alt="Add Post Icon"
              width={20}
              height={20}
            />
            Adaugă postare
          </button>{" "}
          <button
            className={styles.button}
            style={{
              color: "#f57a4e",
              backgroundColor: "transparent",
            }}
          >
            <Image
              src="/icons/exit.svg"
              alt="Exit Icon"
              width={20}
              height={20}
            />{" "}
            Ieși din cont
          </button>
        </div>
        <div className={styles.posts_and_settings}>123</div>
      </div>
    </main>
  );
}
