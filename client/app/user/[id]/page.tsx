import styles from "./page.module.scss";
import { notFound } from "next/navigation";
import { User } from "@/types/User";
import { Post } from "@/types/Post";
import { cache } from "react";
import Image from "next/image";
import PostCard from "@/app/components/UI/PostCard/PostCard";

interface PageProps {
  params: Promise<{ id: string }>;
}

interface getUserResponse {
  user: User;
  posts: Post[];
}

async function getUserByID(id: string): Promise<getUserResponse | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/user/public-profile/${id}`,
      {
        next: { revalidate: 3 },
        /// 300
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { user: User; posts: Post[] | [] } = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return null;
  }
}

const getUser = cache(getUserByID);

export default async function UserProfile({ params }: PageProps) {
  const { id } = await params;

  const data = await getUser(id);
  const user = data?.user;
  const posts = data?.posts;
  if (!user) {
    return notFound();
  }
  return (
    <main className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.profileimage}>
          <Image
            src={user.profileImage}
            alt={`Profile image of ${user.name}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority
          />
        </div>
        <h1 className={styles.name}>{user.name}</h1>
        <p className={styles.membersince}>
          Membru Lost & Found din{" "}
          {user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString("ro-RO", {
                year: "numeric",
                month: "long",
              })
            : ""}
        </p>
        <div className={styles.info}>
          <div className={styles.id}>ID: {user?.lostfoundID}</div>{" "}
          <div className={styles.report}>
            <Image
              src="/icons/report.svg"
              alt="Report Icon"
              width={16}
              height={16}
              draggable={false}
            />
            Raportează
          </div>
        </div>
        {posts && (
          <div className={styles.posts}>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
