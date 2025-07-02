"use client";

import { useState, useEffect, useCallback } from "react";
import styles from "./PostGallery.module.scss";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import Image from "next/image";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

export default function PostGallery({ images }: { images: string[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [mouseStart, setMouseStart] = useState<number | null>(null);
  const [mouseEnd, setMouseEnd] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [dragStartTime, setDragStartTime] = useState<number>(0);

  const minSwipeDistance = 50;
  const maxClickTime = 200;

  const openModal = (index: number) => {
    setActiveImageIndex(index);
    setIsModalOpen(true);
    setIsZoomed(false);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsZoomed(false);
  };

  const selectImage = (index: number) => {
    setActiveImageIndex(index);
    setIsZoomed(false);
  };

  const toggleZoom = useCallback(() => {
    setIsZoomed(!isZoomed);
  }, [isZoomed]);

  const nextImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const prevImage = useCallback(() => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    setIsZoomed(false);
  }, [images.length]);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setMouseEnd(null);
    setMouseStart(e.clientX);
    setIsDragging(true);
    setDragStartTime(Date.now());
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setMouseEnd(e.clientX);
  };

  const onMouseUp = useCallback(() => {
    if (!isDragging) return;

    const dragDuration = Date.now() - dragStartTime;
    const dragDistance =
      mouseStart && mouseEnd ? Math.abs(mouseStart - mouseEnd) : 0;

    if (dragDuration < maxClickTime && dragDistance < 10) {
      toggleZoom();
    } else if (mouseStart && mouseEnd) {
      const distance = mouseStart - mouseEnd;
      const isLeftDrag = distance > minSwipeDistance;
      const isRightDrag = distance < -minSwipeDistance;

      if (isLeftDrag && !isZoomed) {
        nextImage();
      } else if (isRightDrag && !isZoomed) {
        prevImage();
      }
    }

    setIsDragging(false);
  }, [
    isDragging,
    mouseStart,
    mouseEnd,
    dragStartTime,
    toggleZoom,
    nextImage,
    prevImage,
    isZoomed,
  ]);

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;

      switch (e.key) {
        case "ArrowLeft":
          prevImage();
          break;
        case "ArrowRight":
          nextImage();
          break;
        case "Escape":
          closeModal();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, prevImage, nextImage]);

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        onMouseUp();
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        setMouseEnd(e.clientX);
      }
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mousemove", handleGlobalMouseMove);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
    };
  }, [isDragging, mouseStart, mouseEnd, onMouseUp]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  return (
    <>
      <div className={styles.images}>
        <Swiper
          modules={[Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
        >
          {images.map((src, i) => (
            <SwiperSlide key={i} className={styles.slide}>
              <figure
                onClick={() => openModal(i)}
                style={{ cursor: "pointer" }}
              >
                <Image
                  src={src}
                  alt={`Imagine ${i}`}
                  fill
                  sizes="100%"
                  priority={i === 0}
                />
              </figure>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {isModalOpen && (
        <div className={styles.modal} onClick={closeModal}>
          <div
            className={styles.modalcontent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closebutton}
              onClick={closeModal}
              aria-label="Close modal"
            >
              ×
            </button>
            <div
              className={`${styles.mainimage} ${isZoomed ? styles.zoomed : ""}`}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseLeave}
              style={{
                cursor: isDragging
                  ? "grabbing"
                  : isZoomed
                  ? "zoom-out"
                  : "zoom-in",
              }}
            >
              <Image
                src={images[activeImageIndex]}
                alt={`Imagine ${activeImageIndex}`}
                fill
                sizes="100vw"
                style={{
                  objectFit: isZoomed ? "contain" : "contain",
                  transition: "transform 0.3s ease",
                  transform: isZoomed ? "scale(2)" : "scale(1)",
                }}
              />
            </div>
            <div className={styles.previewstrip}>
              {images.map((src, i) => (
                <div
                  key={i}
                  className={`${styles.previewitem} ${
                    i === activeImageIndex ? styles.active : styles.inactive
                  }`}
                  onClick={() => selectImage(i)}
                >
                  <Image
                    src={src}
                    alt={`Preview ${i}`}
                    fill
                    sizes="100px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
