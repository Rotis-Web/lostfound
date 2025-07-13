"use client";

import { useState } from "react";
import styles from "./MarkSolvedModal.module.scss";
import Image from "next/image";

interface MarkSolvedModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId?: string) => void;
  postTitle: string;
  isUpdating: boolean;
  error?: string;
}

export default function MarkSolvedModal({
  isOpen,
  onClose,
  onConfirm,
  postTitle,
  isUpdating,
  error,
}: MarkSolvedModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const [memberId, setMemberId] = useState("");
  const requiredText = "CAZ REZOLVAT";

  const handleConfirm = () => {
    if (confirmationText === requiredText) {
      onConfirm(memberId.trim() || undefined);
    }
  };

  const handleClose = () => {
    setConfirmationText("");
    setMemberId("");
    onClose();
  };

  const isConfirmDisabled =
    confirmationText !== requiredText ||
    isUpdating ||
    (memberId && !/^#[a-zA-Z0-9]+$/.test(memberId.trim()));

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
              draggable={false}
            />
            <p>Marchezi definitiv această postare ca fiind rezolvată.</p>
          </div>
          <div className={styles.postinfo}>
            <p>Postarea:</p>
            <p className={styles.posttitle}>{postTitle}</p>
          </div>
          <div className={styles.confirmationsection}>
            <label htmlFor="memberIdInput">
              Ați fost ajutat de un membru Lost & Found? Tasțati ID-ul mai jos:
            </label>
            <input
              id="memberIdInput"
              name="memberIdInput"
              type="text"
              value={memberId}
              onChange={(e) => setMemberId(e.target.value)}
              placeholder="Ex: #12aHG"
              className={styles.confirmationinput}
              disabled={isUpdating}
              aria-required="false"
            />
            {memberId.length > 1 &&
              !/^#[a-zA-Z1-9]{1,5}$/.test(memberId.trim()) && (
                <p
                  style={{
                    color: "#ff4444",
                    fontSize: "12px",
                    marginTop: "4px",
                  }}
                >
                  ID-ul trebuie să înceapă cu # urmat de litere și cifre (ex:
                  #12aHG)
                </p>
              )}
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
          {error && <div className={styles.membererror}>{error}</div>}
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
            disabled={isConfirmDisabled || isUpdating || error !== undefined}
          >
            {isUpdating ? "Se marchează…" : "Confirmă rezolvarea"}
          </button>
        </div>
      </div>
    </div>
  );
}
