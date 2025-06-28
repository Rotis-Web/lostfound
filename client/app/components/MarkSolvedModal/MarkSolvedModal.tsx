"use client";

import { useState } from "react";
import styles from "./MarkSolvedModal.module.scss";
import Image from "next/image";

interface MarkSolvedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  postTitle: string;
  isUpdating: boolean;
}

export default function MarkSolvedModal({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isUpdating,
}: MarkSolvedModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const requiredText = "CAZ REZOLVAT";

  const handleConfirm = () => {
    if (confirmationText === requiredText) {
      onConfirm();
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    onClose();
  };

  const isConfirmDisabled = confirmationText !== requiredText || isUpdating;

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.content}>
          <div className={styles.info}>
            <Image
              src="/icons/cyan-info.svg"
              alt="Info Icon"
              width={18}
              height={18}
            />
            <p>Marchezi definitiv această postare ca rezolvată.</p>
          </div>

          <div className={styles.postinfo}>
            <p>Postarea:</p>
            <p className={styles.posttitle}>{postTitle}</p>
          </div>

          <div className={styles.confirmationsection}>
            <label htmlFor="solveConfirmationInput">
              Pentru a confirma tastați <strong>{requiredText}</strong> mai jos:
            </label>
            <input
              id="solveConfirmationInput"
              name="solveConfirmationInput"
              type="text"
              value={confirmationText}
              onChange={(e) =>
                setConfirmationText(e.target.value.toUpperCase())
              }
              placeholder="Tastați CAZ REZOLVAT"
              className={styles.confirmationinput}
              disabled={isUpdating}
              aria-required="true"
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={styles.cancelbutton}
            onClick={handleClose}
            disabled={isUpdating}
          >
            Anulează
          </button>
          <button
            className={styles.solvebutton}
            onClick={handleConfirm}
            disabled={isConfirmDisabled}
          >
            {isUpdating ? "Se marchează…" : "Confirmă rezolvat"}
          </button>
        </div>
      </div>
    </div>
  );
}
