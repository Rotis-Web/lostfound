import styles from "./AnunturiPromovate.module.scss";
import PostCard from "../../UI/PostCard/PostCard";
import AdContainer from "../../UI/AdContainer/AdContainer";
import { Post } from "@/types/Post";

interface ApiResponse {
  code: string;
  posts: Post[];
  count: number;
  totalCount: number;
  hasMore: boolean;
  promotedCount: number;
}

async function fetchLatestPosts(): Promise<Post[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/post/latest?limit=12`,
      {
        next: { revalidate: 3 },
        /// 300
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiResponse = await response.json();
    return data.posts || [];
  } catch (error) {
    console.error("Error fetching latest posts:", error);
    return [];
  }
}

export default async function AnunturiPromovate() {
  const posts = await fetchLatestPosts();

  const firstHalf = posts.slice(0, 6);
  const secondHalf = posts.slice(6, 12);

  return (
    <section className={styles.anunturipromovate}>
      <h2>Ultimele postări</h2>

      <div className={styles.anunturi}>
        {firstHalf.length > 0
          ? firstHalf.map((post) => <PostCard key={post._id} post={post} />)
          : Array.from({ length: 6 }, (_, i) => (
              <div className={styles.anunt} key={`placeholder-1-${i}`}>
                <div className={styles.noPostsMessage}>
                  Nu există postări disponibile
                </div>
              </div>
            ))}
      </div>

      <AdContainer />

      <div className={styles.anunturi}>
        {secondHalf.length > 0
          ? secondHalf.map((post) => <PostCard key={post._id} post={post} />)
          : Array.from({ length: 6 }, (_, i) => (
              <div className={styles.anunt} key={`placeholder-2-${i}`}>
                <div className={styles.noPostsMessage}>
                  Nu există postări disponibile
                </div>
              </div>
            ))}
      </div>

      <AdContainer />
    </section>
  );
}
