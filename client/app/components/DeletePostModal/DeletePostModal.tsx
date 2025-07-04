"use client";

import { useState } from "react";
import styles from "./DeletePostModal.module.scss";

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
  isDeleting: boolean;
}

export default function DeletePostModal({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isDeleting,
}: DeleteModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const requiredText = "STERGE POSTAREA";

  const handleConfirm = () => {
    if (confirmationText === requiredText) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  const isConfirmDisabled = confirmationText !== requiredText || isDeleting;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.warning}>
            <p>&#9888;</p>
            <p>Această acțiune este permanentă și nu poate fi anulată!</p>
          </div>
          <div className={styles.postinfo}>
            <p>Postarea care va fi ștearsă:</p>
            <p className={styles.posttitle}>{postTitle}</p>
          </div>
          <div className={styles.confirmationsection}>
            <label htmlFor="confirmationinput">
              Pentru a confirma ștergerea, tastați{" "}
              <strong>{requiredText}</strong> în câmpul de mai jos:
            </label>
            <input
              id="confirmationinput"
              name="confirmationinput"
              type="text"
              value={confirmationText}
              onChange={(e) =>
                setConfirmationText(e.target.value.toUpperCase())
              }
              placeholder="Tastați STERGE POSTAREA"
              className={styles.confirmationinput}
              disabled={isDeleting}
              aria-required="true"
            />
          </div>
          <div className={styles.postinfo}>
            <p>
              A fost de ajutor? Nu șterge postarea – marcheaz-o ca
              <strong style={{ color: "#51e188" }}> rezolvată !</strong>
            </p>
          </div>
        </div>
        <div className={styles.footer}>
          <button
            className={styles.cancelbutton}
            onClick={handleClose}
            disabled={isDeleting}
          >
            Anulează
          </button>
          <button
            className={styles.deletebutton}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isDeleting ? "Se șterge..." : "Șterge postarea"}
          </button>
        </div>
      </div>
    </div>
  );
}
