"use client";

import styles from "./UserPosts.module.scss";
import { useEffect, useState } from "react";
import { usePosts } from "@/context/PostsContext";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/scss";
import "swiper/scss/navigation";
import "swiper/scss/pagination";
import { Pagination } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Post } from "@/types/Post";

const DeletePostModal = dynamic(
  () => import("../DeletePostModal/DeletePostModal"),
  { ssr: false }
);

const MarkSolvedModal = dynamic(
  () => import("../MarkSolvedModal/MarkSolvedModal"),
  { ssr: false }
);

interface DeletePostResponse {
  code: string;
  message: string;
}

interface MarkPostSolvedResponse {
  code: string;
  message: string;
  post: Post;
  badgeUpdate?: {
    success: boolean;
    message: string;
  };
}

export default function UserPosts() {
  const { userPosts, getUserPosts, deletePost, markPostSolved, loading } =
    usePosts() as {
      userPosts: Post[];
      getUserPosts: () => void;
      deletePost: (postId: string) => Promise<DeletePostResponse>;
      markPostSolved: (
        postId: string,
        memberId?: string
      ) => Promise<MarkPostSolvedResponse>;
      loading: boolean;
    };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!user || authLoading) return router.push("/");
    getUserPosts();
  }, [getUserPosts, router, user, authLoading]);

  const handleDeleteClick = (post: Post) => {
    setPostToDelete(post);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      await deletePost(postToDelete._id);
      setDeleteModalOpen(false);
      setPostToDelete(null);
      toast.success("Postarea a fost ștearsă cu succes");
    } catch (error: unknown) {
      console.error("Error deleting post:", error);
      toast.error("Eroare la ștergerea postării");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setPostToDelete(null);
  };

  const [solveOpen, setSolveOpen] = useState(false);
  const [postSolved, setPostSolved] = useState<Post | null>(null);
  const [solveError, setSolveError] = useState<string>("");

  const handleSolveClick = (p: Post) => {
    setPostSolved(p);
    setSolveOpen(true);
    setSolveError("");
  };

  const confirmSolve = async (memberId?: string) => {
    if (!postSolved) return;

    try {
      const response = await markPostSolved(postSolved._id, memberId);

      if (response.badgeUpdate && !response.badgeUpdate.success) {
        setSolveError(response.badgeUpdate.message);
        return;
      }

      if (response.badgeUpdate && response.badgeUpdate.success) {
        toast.success(`Postarea a fost marcată ca rezolvată! `);
        toast.success(response.badgeUpdate.message);
      } else {
        toast.success("Postarea a fost marcată ca rezolvată!");
      }

      setSolveOpen(false);
      setSolveError("");
    } catch (err: unknown) {
      const error = err as MarkPostSolvedResponse & { code?: string };

      setSolveError(
        error.message || "Eroare la marcarea postării ca rezolvată"
      );
    }
  };

  const handleSolveClose = () => {
    setSolveOpen(false);
    setSolveError("");
  };

  if (loading)
    return (
      <div className={styles.loader}>
        <Image
          src="/gifs/loading.gif"
          alt="Loader Gif"
          width={130}
          height={130}
          unoptimized
          draggable={false}
        />
        .
      </div>
    );

  if (userPosts.length === 0) {
    return (
      <div className={styles.emptyposts}>
        Aici vor apărea postările dumneavoastră
      </div>
    );
  }

  return (
    <>
      <section className={styles.userposts}>
        {userPosts.map((post) => (
          <div key={post._id} className={styles.postcontainer}>
            <div className={styles.postheader}>
              <div className={styles.infobox}>
                <div className={styles.id}>
                  ID: <p>{post.lostfoundID}</p>
                </div>
                <p style={{ margin: "0 6px" }}>|</p>
                <Image
                  src="/icons/eye.svg"
                  alt="Pictogramă vizualizări"
                  width={19}
                  height={19}
                  draggable={false}
                />
                <p>{post.views.toLocaleString("ro-RO")}</p>
              </div>
              {post.status === "solved" && (
                <div className={styles.solved}>
                  Caz rezolvat
                  <Image
                    src="/icons/white-check.svg"
                    alt="Pictogramă rezolvat"
                    width={16}
                    height={16}
                    draggable={false}
                  />
                </div>
              )}
              {post.promoted.isActive && post.status != "solved" ? (
                <div className={styles.promoted}>Promovat</div>
              ) : (
                post.status != "solved" && (
                  <button type="button">Promovează</button>
                )
              )}
            </div>
            {post.promoted.isActive && (
              <div className={styles.promotedinfo}>
                {post.promoted.expiresAt && (
                  <p>
                    Promovarea expiră pe{" "}
                    {new Date(post.promoted.expiresAt).toLocaleString("ro-RO", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                )}
                <button type="button">
                  Extinde promovarea{" "}
                  <Image
                    src="/icons/arrow-right.svg"
                    alt="Pictogramă sageata dreapta"
                    width={13}
                    height={13}
                    draggable={false}
                  />
                </button>
              </div>
            )}
            <div className={styles.post}>
              <Link href={`/post/${post._id}`} className={styles.images}>
                <Swiper
                  modules={[Pagination]}
                  spaceBetween={0}
                  slidesPerView={1}
                  pagination={{ clickable: true }}
                >
                  {post.images.map((image, i) => (
                    <SwiperSlide key={i}>
                      <figure className={styles.slide}>
                        <Image
                          src={image}
                          alt={`Imagine ${i}`}
                          fill
                          className={styles.image}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          priority={i === 0}
                        />
                      </figure>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </Link>
              <div className={styles.postinfo}>
                <div className={styles.postcontent}>
                  <Link href={`/post/${post._id}`}>
                    <h2>{post.title}</h2>
                  </Link>
                  <div className={styles.box} style={{ height: "30px" }}>
                    <Image
                      src="/icons/location_pin.svg"
                      alt="Pictogramă locație"
                      width={16}
                      height={16}
                      draggable={false}
                    />
                    <p>{post.location}</p>
                  </div>
                  <div className={styles.box} style={{ marginBottom: "5px" }}>
                    <Image
                      src="/icons/calendar.svg"
                      alt="Pictogramă calendar"
                      width={16}
                      height={16}
                      draggable={false}
                    />
                    {post.lastSeen ? (
                      <p>
                        {new Date(post.lastSeen).toLocaleString("ro-RO", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    ) : (
                      <p style={{ marginLeft: "5px" }}>--</p>
                    )}
                  </div>
                  <div className={styles.box}>
                    <p>Stare:</p>
                    {post.status === "found" && <p>Gasit</p>}
                    {post.status === "lost" && <p>Pierdut</p>}
                    {post.status === "solved" && <p>Rezolvat</p>}
                    <p>|</p>
                    <p>Categorie:</p>
                    <p>{post.category}</p>
                  </div>
                  {post.status === "lost" && post.reward !== 0 && (
                    <div className={styles.box}>
                      <p>Recompensă:</p>
                      <p>{post.reward} RON</p>
                    </div>
                  )}
                  <div className={styles.box}>
                    <p>Contact:</p>
                    <p>{post.name}</p>
                  </div>
                  <div className={styles.box}>
                    <p>{post.phone}</p>
                    <p>|</p>
                    <p>{post.email}</p>
                  </div>
                  <div className={styles.box}>
                    <p>Data postării:</p>
                    <p>{new Date(post.createdAt).toLocaleString("ro-RO")}</p>
                  </div>
                </div>
                <div className={styles.buttoncontainer}>
                  <button
                    type="button"
                    style={{
                      borderRight:
                        post.status === "solved" ? "none" : "1px solid #c4c4c4",
                    }}
                    onClick={() => handleDeleteClick(post)}
                    disabled={loading}
                    className={styles.button}
                  >
                    Șterge
                    <Image
                      src="/icons/delete.svg"
                      alt="Pictogramă ștergere"
                      width={14}
                      height={14}
                      draggable={false}
                    />
                  </button>
                  {post.status !== "solved" && (
                    <Link
                      href={`/edit-post/${post._id}`}
                      className={styles.button}
                      style={{
                        borderRight: "1px solid #c4c4c4",
                      }}
                    >
                      Editează
                      <Image
                        src="/icons/edit.svg"
                        alt="Pictogramă editare"
                        width={13}
                        height={13}
                        draggable={false}
                      />
                    </Link>
                  )}
                  {post.status !== "solved" && (
                    <button
                      type="button"
                      className={styles.button}
                      onClick={() => handleSolveClick(post)}
                    >
                      Caz rezolvat
                      <Image
                        src="/icons/check.svg"
                        alt="Pictogramă rezolvat"
                        width={14}
                        height={14}
                        draggable={false}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <DeletePostModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        postTitle={postToDelete?.title || ""}
        isDeleting={isDeleting}
      />
      <MarkSolvedModal
        isOpen={solveOpen}
        onClose={handleSolveClose}
        onConfirm={confirmSolve}
        postTitle={postSolved?.title || ""}
        isUpdating={loading}
        error={solveError}
      />
    </>
  );
}
