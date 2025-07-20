"use client";

import styles from "./ProfilePage.module.scss";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { usePosts } from "@/context/PostsContext";
import Loader from "@/app/components/Layout/Loader/Loader";

const UserPosts = dynamic(() => import("../UserPosts/UserPosts"), {
  ssr: false,
});
const UserSettings = dynamic(() => import("../UserSettings/UserSettings"), {
  ssr: false,
  loading: () => (
    <div className={styles.loader}>
      <Image
        src="/gifs/loading.gif"
        alt="Loader Gif"
        width={130}
        height={130}
        unoptimized
        draggable={false}
      />
    </div>
  ),
});
const SavedPosts = dynamic(() => import("../SavedPosts/SavedPosts"), {
  ssr: false,
  loading: () => (
    <div className={styles.loader}>
      <Image
        src="/gifs/loading.gif"
        alt="Loader Gif"
        width={130}
        height={130}
        unoptimized
        draggable={false}
      />
    </div>
  ),
});
const ProfileImageModal = dynamic(
  () => import("../ProfileImageModal/ProfileImageModal"),
  { ssr: false }
);

export default function ProfilePage() {
  const { user, logout, changeProfileImage, loading } = useAuth();
  const [activePage, setActivePage] = useState("postari");

  const router = useRouter();
  const { setUserPosts } = usePosts();

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    try {
      router.push("/");
      setTimeout(() => {
        logout();
        setUserPosts([]);
      }, 300);

      toast.success("Te-ai deconectat cu succes");
    } catch (err) {
      console.log(err);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.lostfoundID) {
      navigator.clipboard.writeText(user.lostfoundID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const handleAvatarClick = () => {
    setImageModalOpen(true);
  };

  const handleImageConfirm = async (file: File) => {
    setImageUploading(true);
    try {
      await changeProfileImage(file);
      toast.success("Imaginea de profil a fost actualizată!");
    } catch (err: unknown) {
      const msg =
        typeof err === "object" && err && "message" in err
          ? err.message || "Eroare la actualizarea imaginii"
          : "Eroare la actualizarea imaginii";
      toast.error(msg as string);
    } finally {
      setImageUploading(false);
      setImageModalOpen(false);
    }
  };

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  if (loading || !user) return <Loader />;

  return (
    <>
      <main className={styles.profile}>
        <section className={styles.container}>
          <div className={styles.background}></div>
          <div className={styles.content}>
            <div className={styles.content_items}>
              {user.profileImage && (
                <div className={styles.image}>
                  <Image
                    src={user.profileImage}
                    alt="Pictogramă de profil"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                    className={styles.profileimage}
                  />
                  <span
                    className={styles.changehint}
                    onClick={handleAvatarClick}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ")
                        handleAvatarClick();
                    }}
                    title="Modifică imaginea de profil"
                  >
                    <div className={styles.changeimg}>
                      <Image
                        src="/icons/edit.svg"
                        alt="Edit Icon"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        draggable={false}
                      />
                    </div>
                  </span>
                </div>
              )}
              <h1 className={styles.name}>{user?.name}</h1>
            </div>
          </div>
          <div className={styles.info}>
            <p>{user?.email}</p>
            <div className={styles.id} onClick={handleCopy}>
              ID: {user?.lostfoundID}
              <span className={styles.tooltip}>
                {copied ? "Copiat!" : "Copiază!"}
              </span>
            </div>
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
          {user.badges.length > 0 && (
            <div className={styles.badges}>
              {user.badges.map((badge, index) => (
                <div
                  className={styles.badge}
                  key={index}
                  title={
                    badge.includes("crew")
                      ? "Membru Crew"
                      : "Ajutător de nădejde"
                  }
                >
                  <Image
                    src={badge}
                    alt="Badge Icon"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    draggable={false}
                    priority
                  />
                </div>
              ))}
            </div>
          )}
          <div className={styles.buttoncontainer}>
            <Link href="/create-post">
              <button className={styles.button}>
                <Image
                  src="/icons/add-plus.svg"
                  alt="Add Post Icon"
                  width={20}
                  height={20}
                  draggable={false}
                />
                Adaugă postare
              </button>
            </Link>
            <button
              className={styles.button}
              style={{
                color: "#f57a4e",
                backgroundColor: "transparent",
              }}
              onClick={handleLogout}
            >
              <Image
                src="/icons/exit.svg"
                alt="Exit Icon"
                width={20}
                height={20}
                draggable={false}
              />{" "}
              Ieși din cont
            </button>
          </div>
          <div className={styles.posts_and_settings}>
            <div className={styles.menu}>
              <button
                onClick={() => {
                  setActivePage("postari");
                }}
                className={activePage === "postari" ? styles.active : ""}
              >
                Postări
              </button>
              <button
                onClick={() => setActivePage("setari")}
                className={activePage === "setari" ? styles.active : ""}
              >
                Setări cont
              </button>{" "}
              <button
                onClick={() => setActivePage("salvate")}
                className={activePage === "salvate" ? styles.active : ""}
              >
                Salvate
              </button>
            </div>

            {activePage === "postari" && <UserPosts />}
            {activePage === "setari" && <UserSettings />}
            {activePage === "salvate" && <SavedPosts />}
          </div>
        </section>
      </main>
      <ProfileImageModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onConfirm={handleImageConfirm}
        isUploading={imageUploading}
        currentImage={user.profileImage}
      />
    </>
  );
}
