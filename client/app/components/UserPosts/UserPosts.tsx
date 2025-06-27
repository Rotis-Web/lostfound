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
import DeletePostModal from "../DeletePostModal/DeletePostModal";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface Post {
  _id: string;
  author: string;
  lostfoundID: string;
  title: string;
  content: string;
  tags?: string[];
  images: string[];
  status: "found" | "lost" | "solved";
  name: string;
  email: string;
  phone: string;
  category: string;
  lastSeen?: Date;
  location: string;
  locationCoordinates: { type: "Point"; coordinates: [number, number] };
  circleRadius: number;
  promoted: {
    isActive: boolean;
    expiresAt?: Date;
  };
  reward?: number;
  views: number;
  comments: string[];
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}

interface DeletePostResponse {
  code: string;
  message: string;
}

export default function UserPosts() {
  const { userPosts, getUserPosts, deletePost, loading } = usePosts() as {
    userPosts: Post[];
    getUserPosts: () => void;
    deletePost: (postId: string) => Promise<DeletePostResponse>;
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
                <p style={{ margin: "0 5px" }}>|</p>
                <Image
                  src="/icons/eye.svg"
                  alt="Pictogramă vizualizări"
                  width={16}
                  height={16}
                />
                <p>{post.views.toLocaleString("ro-RO")}</p>
              </div>
              <button type="button">Promovează</button>
            </div>
            <div className={styles.post}>
              <div className={styles.images}>
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
                          sizes="100%"
                          priority={i === 0}
                        />
                      </figure>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
              <div className={styles.postinfo}>
                <div className={styles.postcontent}>
                  <h2>{post.title}</h2>
                  <div className={styles.box} style={{ height: "30px" }}>
                    <Image
                      src="/icons/location_pin.svg"
                      alt="Pictogramă locație"
                      width={16}
                      height={16}
                    />
                    <p>{post.location}</p>
                  </div>
                  <div className={styles.box} style={{ marginBottom: "5px" }}>
                    <Image
                      src="/icons/calendar.svg"
                      alt="Pictogramă calendar"
                      width={16}
                      height={16}
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
                    style={{ borderRight: "1px solid #c4c4c4" }}
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
                    />
                  </button>
                  <Link
                    href={`/edit-post/${post._id}`}
                    className={styles.button}
                    style={{ borderRight: "1px solid #c4c4c4" }}
                  >
                    Editează
                    <Image
                      src="/icons/edit.svg"
                      alt="Pictogramă editare"
                      width={13}
                      height={13}
                    />
                  </Link>
                  <button type="button" className={styles.button}>
                    Caz rezolvat
                    <Image
                      src="/icons/check.svg"
                      alt="Pictogramă rezolvat"
                      width={14}
                      height={14}
                    />
                  </button>
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
    </>
  );
}
