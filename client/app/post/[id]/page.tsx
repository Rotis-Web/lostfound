import styles from "./page.module.scss";
import { Post } from "@/types/Post";
import { notFound } from "next/navigation";
import { cache } from "react";
import PostGallery from "../../components/PostPage/PostGallery/PostGallery";
import PostMap from "../../components/PostPage/PostMap/PostMapWrapper";
import CommentsHeader from "@/app/components/PostPage/CommentsHeader/CommentsHeader";
import UserLink from "@/app/components/PostPage/UserLink/UserLink";
import Image from "next/image";

import {
  differenceInYears,
  differenceInMonths,
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
} from "date-fns";

interface PageProps {
  params: Promise<{ id: string }>;
}

// export async function generateStaticParams() {
//   const posts = await getAllPosts();

//   if (!posts) {
//     return [];
//   }

//   return posts.map((post: Post) => ({
//     slug: post.slug,
//   }));
// }

// export async function generateMetadata({ params }: PageProps) {
//   const { slug } = await params;
//   const post = await getPost(slug);

//   if (!post) {
//     return notFound();
//   }

//   return {
//     title: post.title,
//   };
// }

async function getPostbyID(id: string): Promise<Post | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/post/${id}`,
      {
        next: { revalidate: 3 },
        /// 300
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: { post: Post } = await response.json();
    return data.post;
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return null;
  }
}

const getPost = cache(getPostbyID);

function getStatusColor(status: string): string {
  switch (status) {
    case "lost":
      return "#ff6b6b";
    case "found":
      return "#339af0";
    case "solved":
      return "#51e188";
    default:
      return "#868e96";
  }
}

function timeAgo(date: Date) {
  const now = new Date();

  const years = differenceInYears(now, date);
  if (years >= 1) {
    return `acum ${years} ${years === 1 ? "an" : "ani"}`;
  }

  const months = differenceInMonths(now, date);
  if (months >= 1) {
    return `acum ${months} ${months === 1 ? "lună" : "luni"}`;
  }

  const days = differenceInDays(now, date);
  if (days >= 1) {
    return `acum ${days} ${days === 1 ? "zi" : "zile"}`;
  }

  const hours = differenceInHours(now, date);
  if (hours >= 1) {
    return `acum ${hours} ${hours === 1 ? "oră" : "ore"}`;
  }

  const minutes = differenceInMinutes(now, date);
  if (minutes >= 1) {
    return `acum ${minutes} ${minutes === 1 ? "minut" : "minute"}`;
  }

  return "chiar acum";
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;

  const post = await getPost(id);
  if (!post) {
    return notFound();
  }
  return (
    <main className={styles.postpage}>
      <section className={styles.container}>
        <div className={styles.main}>
          <div className={styles.imagecontainer}>
            <PostGallery images={post.images} />
          </div>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.buttoncontainer}>
            {post.status != "solved" && (
              <button className={styles.contact}>
                <Image
                  src="/icons/phone.svg"
                  alt="Phone Icon"
                  width={22}
                  height={22}
                  draggable={false}
                />
                Contactează
              </button>
            )}
            <button
              className={`${styles.secbutton} ${
                post.status === "solved" && styles.large
              }`}
            >
              <Image
                src="/icons/share.svg"
                alt="Share Icon"
                width={20}
                height={20}
                draggable={false}
              />
              <p> Distribuie</p>
            </button>
            <button
              className={`${styles.secbutton} ${
                post.status === "solved" && styles.large
              }`}
            >
              <Image
                src="/icons/saved.svg"
                alt="Saved Icon"
                width={20}
                height={20}
                draggable={false}
              />
              <p>Salvează</p>
            </button>
          </div>
          <div className={styles.info}>
            <div className={styles.views}>{post.views} vizualizări</div>
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
          {/* <div className={styles.adcontainer}>
            <Image src="/images/publicitate.png" alt="Publicitate" fill />
          </div> */}
        </div>
        <div className={styles.content}>
          <div className={styles.author}>
            <p>Postat de</p>
            {post.author && post.author.profileImage ? (
              <>
                <Image
                  src={post.author.profileImage}
                  alt="Profile Icon"
                  width={25}
                  height={25}
                />
                <UserLink name={post.author.name} id={post.author._id} />
              </>
            ) : (
              <>
                <Image
                  src={"/icons/user-icon.svg"}
                  alt="Profile Icon"
                  width={25}
                  height={25}
                />
                <b className={styles.deleted}>Utilizator șters</b>
              </>
            )}
            <span>{timeAgo(post.createdAt)} </span>
          </div>{" "}
          <p className={styles.description}>
            {post.content} Lorem ipsum dolor sit amet, consectetur adipisicing
            elit. Ipsum, perferendis iure quos minus error consequuntur facilis
            aliquid vel inventore, distinctio laborum culpa beatae nemo voluptas
            repellat reprehenderit fugit? Aliquam, sit?
          </p>{" "}
          <div className={styles.detailbox}>
            <p>LostFound ID</p>
            <span className={styles.id}>{post.lostfoundID}</span>
          </div>
          <div className={styles.detailbox}>
            <p>Stare</p>
            <span
              className={styles.status}
              style={{ backgroundColor: getStatusColor(post.status) }}
            >
              {post.status === "lost" && "Pierdut"}
              {post.status === "found" && "Găsit"}
              {post.status === "solved" && "Rezolvat"}
            </span>
          </div>
          <div className={styles.detailbox}>
            <p>Categorie</p>
            <span className={styles.category}>{post.category}</span>
          </div>
          {post.reward !== undefined && post.reward > 0 && (
            <div className={styles.detailbox}>
              <p>Recompensă</p>
              <span className={styles.reward}>{post.reward} RON</span>
            </div>
          )}
          {post.lastSeen !== null && post.lastSeen !== undefined && (
            <div className={styles.detailbox}>
              <p>
                {post.status === "lost"
                  ? "Ultima dată văzut/ă"
                  : "Data găsirii"}
              </p>
              <span className={styles.lastseen}>
                {new Date(post.lastSeen).toLocaleString("ro-RO", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          )}
          <div className={styles.detailbox} style={{ borderBottom: "none" }}>
            <p>Locație</p>
            <span className={styles.location}>{post.location}</span>
          </div>
          <PostMap
            location={{
              lat: post.locationCoordinates.coordinates[1],
              lng: post.locationCoordinates.coordinates[0],
              radius: post.circleRadius,
              name: post.location,
            }}
          />
        </div>
      </section>
      <section className={styles.commentswrapper}>
        <CommentsHeader post={post} />
        {post.comments.length > 0 && (
          <div className={styles.comments}>
            {post.comments
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((comment) => (
                <div className={styles.comment} key={comment._id}>
                  <div className={styles.commentinfo}>
                    <div className={styles.author}>
                      <Image
                        src={
                          comment.author?.profileImage || "/icons/user-icon.svg"
                        }
                        alt="Profile Icon"
                        width={25}
                        height={25}
                      />
                      {comment.author ? (
                        <UserLink
                          name={comment.author.name}
                          id={comment.author._id}
                        />
                      ) : (
                        <b className={styles.deleted}>Utilizator șters</b>
                      )}
                    </div>
                    <p>{timeAgo(comment.createdAt)}</p>
                  </div>
                  <p>
                    {comment.content} Lorem ipsum dolor sit amet consectetur
                    adipisicing elit. Illo eius quis numquam modi, harum
                    incidunt maiores atque velit inventore minus vel corporis
                    recusandae magni ea! Quam et temporibus velit deleniti!
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </main>
  );
}
