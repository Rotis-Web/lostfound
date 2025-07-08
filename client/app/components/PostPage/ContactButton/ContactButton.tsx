"use client";

import React, { useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const ContactInfo = dynamic(
  () => import("@/app/components/PostPage/ContactInfo/ContactInfo"),
  { ssr: false }
);

interface ContactButtonProps {
  postId: string;
  email?: string;
  phone?: string;
  className?: string;
}

const ContactButton: React.FC<ContactButtonProps> = ({
  email,
  phone,
  className,
}) => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  return (
    <>
      <button className={className} onClick={handleContactClick}>
        <Image
          src="/icons/phone.svg"
          alt="Phone Icon"
          width={22}
          height={22}
          draggable={false}
        />
        Contactează
      </button>

      <ContactInfo
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        email={email}
        phone={phone}
      />
    </>
  );
};

export default ContactButton;
