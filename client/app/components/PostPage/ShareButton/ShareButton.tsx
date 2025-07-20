"use client";

import Image from "next/image";
import { toast } from "react-toastify";

export default function ShareButton({
  postId,
  className,
}: {
  postId: string;
  className?: string;
}) {
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Distribuie postarea",
          url: shareUrl,
        });
      } catch (err) {
        console.error("Eroare la partajare:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Linkul a fost copiat!");
      } catch {
        toast.error("Copierea linkului a eșuat.");
      }
    }
  };

  return (
    <button
      className={className}
      onClick={handleShare}
      title="Distribuie postarea"
    >
      <Image
        src="/icons/share.svg"
        alt="Share Icon"
        width={22}
        height={22}
        draggable={false}
      />
      <p>Distribuie</p>
    </button>
  );
}
