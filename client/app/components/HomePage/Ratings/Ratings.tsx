"use client";

import styles from "./Ratings.module.scss";
import { Swiper as SwiperType } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/free-mode";
import { useRef } from "react";
import UserLink from "../../PostPage/UserLink/UserLink";
import Image from "next/image";

export default function Ratings() {
  const swiperRef = useRef<SwiperType>(null);

  return (
    <section className={styles.ratings}>
      <div className={styles.sliderwrapper}>
        <div className={styles.header}>
          <h2>Testimoniale</h2>
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
          <SwiperSlide className={styles.slide}>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#FFD700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.169L12 18.897l-7.334 3.864 1.4-8.169L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}
              </div>
              <div className={styles.text}>
                Cățelușa mea a dispărut din curte, dar cineva a postat-o aici și
                am reușit s-o aducem acasă în aceeași zi. Nici nu știu cum să vă
                mulțumesc!
              </div>
              <div className={styles.author}>
                <Image
                  src={
                    "https://res.cloudinary.com/dqyq1oiwi/image/upload/v1751818489/lost-found-posts/1751818487318-profile_img.png.jpg"
                  }
                  alt="Profile Icon"
                  width={35}
                  height={35}
                />
                <div className={styles.link}>
                  <UserLink
                    name={"Alexandru Rotar"}
                    id={"6849dca355e2fe5fda38a979"}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className={styles.slide}>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#FFD700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.169L12 18.897l-7.334 3.864 1.4-8.169L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}
              </div>
              <div className={styles.text}>
                Fiica mea și-a uitat rucsacul la școală. Cineva l-a găsit și a
                folosit platforma să ne anunțe. L-am luat înapoi chiar în
                aceeași zi. Mulțumim mult!
              </div>
              <div className={styles.author}>
                <Image
                  src={
                    "https://ui-avatars.com/api/?name=Matei%20Codrean&background=random&bold=true"
                  }
                  alt="Profile Icon"
                  width={35}
                  height={35}
                />
                <div className={styles.link}>
                  <UserLink
                    name={"Matei Codrean"}
                    id={"684b3adb8d31bfffe96f3c4f"}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>{" "}
          <SwiperSlide className={styles.slide}>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 4 }).map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#FFD700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.169L12 18.897l-7.334 3.864 1.4-8.169L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}{" "}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="none"
                  stroke="#FFD700"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                </svg>
              </div>
              <div className={styles.text}>
                Am reușit să găsim motanul nostru cu ajutorul unei postări de pe
                platformă. A durat puțin până am găsit anunțul, dar în final
                totul a decurs bine.
              </div>
              <div className={styles.author}>
                <Image
                  src={
                    "https://res.cloudinary.com/dqyq1oiwi/image/upload/v1752422312/lost-found-posts/1752422311066-image_2025-07-13_185829324.png.jpg"
                  }
                  alt="Profile Icon"
                  width={35}
                  height={35}
                />
                <div className={styles.link}>
                  <UserLink
                    name={"Corina Alexandru"}
                    id={"6873d712558f3279090e980c"}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className={styles.slide}>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#FFD700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.169L12 18.897l-7.334 3.864 1.4-8.169L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}
              </div>
              <div className={styles.text}>
                Mi-am găsit ochelarii pierduți printr-o postare de aici. Totul a
                decurs ușor, iar site-ul e foarte clar. Mulțumesc celor
                implicați!
              </div>
              <div className={styles.author}>
                <Image
                  src={
                    "https://res.cloudinary.com/dqyq1oiwi/image/upload/v1752423042/lost-found-posts/1752423041569-image_2025-07-13_191036601.png.jpg"
                  }
                  alt="Profile Icon"
                  width={35}
                  height={35}
                />
                <div className={styles.link}>
                  <UserLink
                    name={"Vladut Popa"}
                    id={"6873d874558f3279090e9851"}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
          <SwiperSlide className={styles.slide}>
            <div className={styles.rating}>
              <div className={styles.stars}>
                {Array.from({ length: 5 }).map((_, index) => (
                  <svg
                    key={index}
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="#FFD700"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.782 1.4 8.169L12 18.897l-7.334 3.864 1.4-8.169L.132 9.21l8.2-1.192z" />
                  </svg>
                ))}
              </div>
              <div className={styles.text}>
                Mi-am uitat telefonul într-un taxi, iar persoana care l-a găsit
                l-a adăugat pe platformă. M-a contactat și l-am recuperat rapid.
                Totul a mers perfect!
              </div>
              <div className={styles.author}>
                <Image
                  src={
                    "https://ui-avatars.com/api/?name=Violeta%20Almasan&background=random&bold=true"
                  }
                  alt="Profile Icon"
                  width={35}
                  height={35}
                />
                <div className={styles.link}>
                  <UserLink
                    name={"Violeta Almasan"}
                    id={"6873d8f4558f3279090e9874"}
                  />
                </div>
              </div>
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </section>
  );
}
