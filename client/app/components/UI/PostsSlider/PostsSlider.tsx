"use client";

import styles from "./PostsSlider.module.scss";
import { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { useRef } from "react";
import { Post } from "@/types/Post";
import PostCard from "../../UI/PostCard/PostCard";

export default function PostsSlider({
  posts,
  uniqueId,
}: {
  posts: Post[];
  uniqueId: string;
}) {
  const swiperRef = useRef<SwiperType>(null);

  return (
    <div className={styles.sliderwrapper}>
      <div className={styles.header}>
        <h2>{uniqueId === "1" ? "Pierdute recent" : "Găsite recent"}</h2>
        <div className={styles.sliderbuttons}>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className={styles.navbutton}
          >
            &#171;
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className={styles.navbutton}
          >
            &#187;
          </button>
        </div>
      </div>
      <Swiper
        modules={[Navigation, FreeMode]}
        spaceBetween={16}
        slidesPerView="auto"
        freeMode={true}
        grabCursor={true}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        navigation={false}
        loop={false}
        watchSlidesProgress={true}
        breakpoints={{
          320: {
            spaceBetween: 12,
          },
          768: {
            spaceBetween: 16,
          },
          1200: {
            spaceBetween: 20,
          },
        }}
      >
        {posts.length > 0
          ? posts.map((post) => (
              <SwiperSlide key={post._id} className={styles.slide}>
                <PostCard post={post} priority={true} />
              </SwiperSlide>
            ))
          : Array.from({ length: 6 }, (_, i) => (
              <SwiperSlide
                key={`placeholder-${uniqueId}-${i}`}
                className={styles.slide}
              >
                <div className={styles.anunt}>
                  <div className={styles.noPostsMessage}>
                    Nu există postări disponibile
                  </div>
                </div>
              </SwiperSlide>
            ))}
      </Swiper>
    </div>
  );
}
