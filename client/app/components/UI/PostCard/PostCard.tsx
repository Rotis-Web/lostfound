import styles from "./PostCard.module.scss";
import Image from "next/image";
import { Post } from "@/types/Post";
import ImageSlider from "../ImageSlider/ImageSlider";
import PostCardWrapper from "../../Utils/PostCardWrapper";
import dynamic from "next/dynamic";

const SaveButton = dynamic(
  () => import("@/app/components/UI/SaveButton/SaveButton"),
  { ssr: false }
);

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
}

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

export default function PostCard({
  post,
  priority = false,
}: {
  post: Post;
  priority?: boolean;
}) {
  return (
    <PostCardWrapper postId={post._id}>
      <div className={styles.postimage}>
        {post.images && post.images.length > 1 ? (
          <ImageSlider
            images={post.images}
            title={post.title}
            priority={priority}
          />
        ) : (
          post.images && (
            <Image
              src={post.images[0]}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ objectFit: "cover" }}
              priority={priority}
            />
          )
        )}
        {post.promoted.isActive && (
          <div className={styles.promotedbadge}>Promovat</div>
        )}
        {post.reward !== undefined && post.reward > 0 && (
          <div className={styles.rewardbadge}>Recompensă {post.reward} RON</div>
        )}
      </div>
      <div className={styles.postcontent}>
        <div className={styles.postheader}>
          <span
            className={styles.status}
            style={{ backgroundColor: getStatusColor(post.status) }}
          >
            {post.status === "lost" && "Pierdut"}
            {post.status === "found" && "Găsit"}
            {post.status === "solved" && "Rezolvat"}
          </span>
          <span className={styles.category}>{post.category}</span>
        </div>
        <h3 className={styles.posttitle}>{truncateText(post.title, 68)}</h3>
        {post.content && (
          <p className={styles.postdescription}>
            {truncateText(post.content, 80)}
          </p>
        )}
        <div className={styles.postmeta}>
          <span className={styles.location}>
            <span> 📍 </span>
            {truncateText(post.location, 40)}
          </span>
          {post.lastSeen && (
            <span className={styles.date}>
              {new Date(post.lastSeen).toLocaleDateString("ro-RO", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className={styles.poststats}>
          <span className={styles.views}>
            <Image src="/icons/eye.svg" alt="Eye Icon" width={15} height={15} />{" "}
            {post.views.toLocaleString("ro-RO")}
          </span>
          <span className={styles.postid}>{post.lostfoundID}</span>
        </div>

        <SaveButton postId={post._id} className={styles.savebutton} />
      </div>
    </PostCardWrapper>
  );
}
