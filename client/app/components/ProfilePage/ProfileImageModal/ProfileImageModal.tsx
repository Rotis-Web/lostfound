"use client";

import { useState, useEffect, ChangeEvent } from "react";
import styles from "./ProfileImageModal.module.scss";
import Image from "next/image";

interface ChangeProfileImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File) => void;
  isUploading: boolean;
  currentImage?: string;
}

export default function ProfileImageModal({
  isOpen,
  onClose,
  onConfirm,
  isUploading,
  currentImage = "",
}: ChangeProfileImageModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = () => {
    if (!isUploading) onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleConfirm = () => {
    if (selectedFile) onConfirm(selectedFile);
    setSelectedFile(null);
  };

  const isSaveDisabled = !selectedFile || isUploading;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Modifică imaginea de profil</h2>
        </header>

        <div className={styles.container}>
          {currentImage && (
            <div className={styles.preview}>
              <p className={styles.label}>Imagine curentă</p>
              <Image
                src={currentImage}
                alt="Avatar curent"
                width={110}
                height={110}
                className={styles.avatar}
              />
            </div>
          )}

          {previewUrl && (
            <div className={styles.preview}>
              <p className={styles.label}>Imagine nouă</p>
              <Image
                src={previewUrl}
                alt="Previzualizare avatar"
                width={110}
                height={110}
                className={styles.avatar}
              />
            </div>
          )}

          <label htmlFor="imageInput" className={styles.filelabel}>
            Alege o imagine (JPEG, JPG, PNG, WebP, maximum 5 MB)
            <input
              id="imageInput"
              name="imageInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className={styles.fileinput}
              aria-required="true"
            />
          </label>
        </div>

        <footer className={styles.footer}>
          <button
            type="button"
            onClick={() => {
              onClose();
              setSelectedFile(null);
            }}
            disabled={isUploading}
            className={styles.cancelbtn}
          >
            Anulează
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSaveDisabled}
            className={styles.savebtn}
          >
            {isUploading ? "Se încarcă…" : "Salvează"}
          </button>
        </footer>
      </div>
    </div>
  );
}
