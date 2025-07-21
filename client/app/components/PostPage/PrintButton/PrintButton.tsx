"use client";

import React from "react";
import Image from "next/image";
import { Post } from "@/types/Post";
import { jsPDF } from "jspdf";
import { toast } from "react-toastify";
import QRCode from "qrcode";

interface PrintButtonProps {
  post: Post;
  className?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ post, className }) => {
  const generatePDF = async () => {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.width;
    const pageHeight = pdf.internal.pageSize.height;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const centerX = pageWidth / 2;

    const sections = {
      header: { height: 30 },
      status: { height: 20 },
      image: { height: 95 },
      title: { height: 22 },
      location: { height: 26 },
      contact: { height: 42 },
      footer: { height: 14 },
      spacing: 6,
    };

    let yPosition = 0;

    const getStatusColor = (status: string) => {
      switch (status) {
        case "lost":
          return { r: 255, g: 107, b: 107 };
        case "found":
          return { r: 51, g: 154, b: 240 };
        case "solved":
          return { r: 81, g: 225, b: 136 };
        default:
          return { r: 134, g: 142, b: 150 };
      }
    };

    const getStatusText = (status: string) => {
      switch (status) {
        case "lost":
          return "PIERDUT";
        case "found":
          return "GASIT";
        case "solved":
          return "REZOLVAT";
        default:
          return "NECUNOSCUT";
      }
    };

    const romanianToAscii = (text: string): string => {
      const replacements: { [key: string]: string } = {
        ă: "a",
        â: "a",
        î: "i",
        ș: "s",
        ț: "t",
        Ă: "A",
        Â: "A",
        Î: "I",
        Ș: "S",
        Ț: "T",
        "📞": "",
        "👤": "",
        "📧": "",
        "📱": "",
        "💰": "",
      };
      return text.replace(
        /[ăâîșțĂÂÎȘȚ📞👤📧📱💰]/g,
        (match) => replacements[match] || match
      );
    };

    const locationText =
      post.location?.length > 50
        ? post.location.slice(0, 50) + "…"
        : post.location;

    const addCenteredText = (
      text: string,
      y: number,
      options: {
        fontSize?: number;
        fontStyle?: "normal" | "bold";
        color?: [number, number, number];
        maxWidth?: number;
      } = {}
    ) => {
      const {
        fontSize = 12,
        fontStyle = "normal",
        color = [43, 43, 43],
      } = options;

      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", fontStyle);
      pdf.setTextColor(color[0], color[1], color[2]);

      const processedText = romanianToAscii(text);
      const textWidth = pdf.getTextWidth(processedText);
      const x = centerX - textWidth / 2;

      pdf.text(processedText, x, y);
      return processedText;
    };

    const addCenteredMultilineText = (
      text: string,
      y: number,
      options: {
        fontSize?: number;
        fontStyle?: "normal" | "bold";
        color?: [number, number, number];
        lineHeight?: number;
        maxWidth?: number;
      } = {}
    ): number => {
      const {
        fontSize = 12,
        fontStyle = "normal",
        color = [43, 43, 43],
        lineHeight = 6,
        maxWidth = contentWidth,
      } = options;

      pdf.setFontSize(fontSize);
      pdf.setFont("helvetica", fontStyle);
      pdf.setTextColor(color[0], color[1], color[2]);

      const processedText = romanianToAscii(text);
      const lines = pdf.splitTextToSize(processedText, maxWidth);

      let currentY = y;
      lines.forEach((line: string) => {
        const lineWidth = pdf.getTextWidth(line);
        const x = centerX - lineWidth / 2;
        pdf.text(line, x, currentY);
        currentY += lineHeight;
      });

      return currentY;
    };

    try {
      yPosition = 0;

      const logoBase64 = await loadImageAsBase64("/images/lostfound_logo.webp");

      const logoWidth = 32;
      const logoHeight = 19;
      const logoX = 3;
      const logoY = yPosition + 5;

      pdf.addImage(logoBase64, "PNG", logoX, logoY, logoWidth, logoHeight);

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(44, 62, 96);

      const headerText = "www.lostfound.ro";
      const textWidth = pdf.getTextWidth(headerText);
      const textX = pageWidth - textWidth - 10;
      const textY = 23;
      pdf.text(headerText, textX, textY);

      yPosition += 7;

      const statusColor = getStatusColor(post.status);
      const statusText = getStatusText(post.status);

      const badgeWidth = 60;
      const badgeHeight = 18;
      const statusX = centerX - badgeWidth / 2;

      // Status badge
      pdf.setFillColor(statusColor.r, statusColor.g, statusColor.b);
      pdf.roundedRect(statusX, yPosition, badgeWidth, badgeHeight, 3, 3, "F");

      pdf.setFontSize(20);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 255, 255);
      const statusWidth = pdf.getTextWidth(statusText);
      pdf.text(
        statusText,
        statusX + (badgeWidth - statusWidth) / 2,
        yPosition + 11.5
      );

      yPosition += sections.status.height + sections.spacing + 5;

      if (post.images && post.images.length > 0) {
        try {
          const imageData = await loadImageAsBase64(post.images[0]);

          const maxImageWidth = 176;
          const maxImageHeight = 99;

          const img = document.createElement("img");
          img.src = imageData;

          await new Promise((resolve, reject) => {
            img.onload = () => {
              const widthRatio = maxImageWidth / img.width;
              const heightRatio = maxImageHeight / img.height;
              const scale = Math.min(widthRatio, heightRatio);

              const imageWidth = img.width * scale;
              const imageHeight = img.height * scale;

              const x = centerX - imageWidth / 2;

              const y = yPosition;

              pdf.setFillColor(255, 255, 255);
              pdf.roundedRect(
                x - 4,
                y - 4,
                imageWidth + 8,
                imageHeight + 8,
                5,
                5,
                "F"
              );

              // Add the image scaled and centered
              pdf.addImage(imageData, "JPEG", x, y, imageWidth, imageHeight);

              // Update yPosition to leave space below image for next content
              yPosition += imageHeight + sections.spacing + 13;

              resolve(null);
            };
            img.onerror = reject;
          });
        } catch (error) {
          console.warn("Could not load image for PDF:", error);
        }
      }

      // SECTION 4: TITLE
      yPosition = addCenteredMultilineText(post.title, yPosition, {
        fontSize: 23,
        fontStyle: "bold",
        color: [44, 62, 96],
        lineHeight: 10,
        maxWidth: contentWidth,
      });
      yPosition += sections.spacing - 3;

      // SECTION 5: LOCATION AND DATE - IMPROVED LAYOUT
      const lastSeenDate = post.lastSeen
        ? new Date(post.lastSeen).toLocaleDateString("ro-RO", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })
        : "Nu este specificata";

      const locationBoxHeight = 28;
      const locationBoxY = yPosition;

      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(
        margin,
        locationBoxY,
        contentWidth,
        locationBoxHeight,
        4,
        4,
        "F"
      );

      addCenteredText(`Locatie: ${locationText}`, locationBoxY + 12, {
        fontSize: 14,
        fontStyle: "bold",
        color: [44, 62, 96],
      });

      const dateLabel =
        post.status === "lost" ? "Ultima data vazut/a" : "Data gasirii";
      addCenteredText(`${dateLabel}: ${lastSeenDate}`, locationBoxY + 22, {
        fontSize: 14,
        color: [80, 80, 80],
      });

      yPosition += sections.location.height + sections.spacing;

      const contactQrBoxHeight = 38;
      const contactQrBoxY = yPosition;

      const contactBoxWidth = (contentWidth - 8) / 1.8;
      const contactBoxX = margin;

      pdf.setFillColor(248, 250, 252);
      pdf.roundedRect(
        contactBoxX,
        contactQrBoxY,
        contactBoxWidth,
        contactQrBoxHeight,
        3,
        3,
        "F"
      );

      pdf.setFontSize(16);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(255, 215, 0);
      const contactHeaderText = "CONTACT";
      const contactHeaderWidth = pdf.getTextWidth(contactHeaderText);
      pdf.text(
        contactHeaderText,
        contactBoxX + (contactBoxWidth - contactHeaderWidth) / 2,
        contactQrBoxY + 8
      );

      pdf.setFontSize(13);
      pdf.setTextColor(44, 62, 96);

      const contactName = romanianToAscii(post.name || "Utilizator");
      const contactEmail = post.email || "email@example.com";
      const contactPhone = post.phone || "+40 XXX XXX XXX";

      const nameWidth = pdf.getTextWidth(contactName);
      pdf.text(
        contactName,
        contactBoxX + (contactBoxWidth - nameWidth) / 2,
        contactQrBoxY + 17
      );

      const emailWidth = pdf.getTextWidth(contactEmail);
      pdf.text(
        contactEmail,
        contactBoxX + (contactBoxWidth - emailWidth) / 2,
        contactQrBoxY + 26
      );

      const phoneWidth = pdf.getTextWidth(contactPhone);
      pdf.text(
        contactPhone,
        contactBoxX + (contactBoxWidth - phoneWidth) / 2,
        contactQrBoxY + 35
      );

      // Right side - QR Code - OPTIMIZED SIZING
      const qrBoxWidth = contentWidth - contactBoxWidth - 8;
      const qrBoxX = margin + contactBoxWidth + 8;

      const qrSize = 32;
      const qrX = qrBoxX + (qrBoxWidth - qrSize) / 2;
      const qrY = contactQrBoxY + 3;

      const websiteLink = `https://lostfound.ro/post/${post._id}`;
      const qrCodeDataURL = await QRCode.toDataURL(websiteLink, {
        width: 64,
        margin: 1,
        color: {
          dark: "#2c3e60",
          light: "#ffffff",
        },
      });

      pdf.addImage(qrCodeDataURL, "PNG", qrX, qrY, qrSize, qrSize);

      pdf.setFontSize(7);
      pdf.setTextColor(44, 62, 96);
      const qrLabelText = "Scaneaza pentru detalii";
      const qrLabelWidth = pdf.getTextWidth(qrLabelText);
      pdf.text(
        qrLabelText,
        qrBoxX + (qrBoxWidth - qrLabelWidth) / 2,
        contactQrBoxY + qrSize + 7
      );

      yPosition += contactQrBoxHeight + sections.spacing;

      // SECTION 7: REWARD SECTION (if reward exists) - SMALLER
      if (post.reward && post.reward > 0) {
        const rewardBoxHeight = 20; // Reduced
        const rewardBoxY = yPosition;

        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(
          margin,
          rewardBoxY,
          contentWidth,
          rewardBoxHeight,
          4,
          4,
          "F"
        );

        pdf.setDrawColor(255, 193, 7);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(
          margin,
          rewardBoxY,
          contentWidth,
          rewardBoxHeight,
          4,
          4,
          "S"
        );

        addCenteredText(`RECOMPENSA: ${post.reward} RON`, rewardBoxY + 13, {
          fontSize: 18,
          fontStyle: "bold",
          color: [184, 134, 11],
        });

        yPosition += rewardBoxHeight + sections.spacing;
      }

      const footerY = pageHeight - sections.footer.height;

      // Footer background
      pdf.setFillColor(44, 62, 96);
      pdf.rect(0, footerY, pageWidth, sections.footer.height, "F");

      // Yellow accent line
      pdf.setFillColor(255, 215, 0);
      pdf.rect(0, footerY, pageWidth, 1.5, "F");

      const footerText = `lostfound.ro | ${new Date().toLocaleDateString(
        "ro-RO"
      )} | ID: ${post.lostfoundID}`;
      addCenteredText(footerText, footerY + 9.5, {
        fontSize: 10,
        color: [255, 255, 255],
      });

      pdf.save(`postare-${post.lostfoundID}.pdf`);

      toast.success("PDF generat cu succes!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error(
        "A aparut o eroare la generarea PDF-ului. Va rugam sa incercati din nou."
      );
    }
  };

  const loadImageAsBase64 = (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const dataURL = canvas.toDataURL("image/jpeg", 0.8);
        resolve(dataURL);
      };

      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = imageUrl;
    });
  };

  return (
    <button onClick={generatePDF} className={className} title="Printează PDF">
      <Image
        src="/icons/print.svg"
        alt="Print Icon"
        width={23}
        height={23}
        draggable={false}
      />
      <p>Printează</p>
    </button>
  );
};

export default PrintButton;
