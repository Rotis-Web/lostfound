"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./ContactInfo.module.scss";
import { toast } from "react-toastify";

interface ContactInfoProps {
  isOpen: boolean;
  onClose: () => void;
  email?: string;
  phone?: string;
}

const ContactInfo: React.FC<ContactInfoProps> = ({
  isOpen,
  onClose,
  email,
  phone,
}) => {
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [captchaError, setCaptchaError] = useState("");

  const [captchaQuestion, setCaptchaQuestion] = useState(() =>
    generateCaptcha()
  );
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaAttempts, setCaptchaAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTime, setBlockTime] = useState(0);

  function generateCaptcha() {
    const types = ["math", "text", "logic", "sequence"];
    const type = types[Math.floor(Math.random() * types.length)];

    switch (type) {
      case "math":
        const operations = ["+", "-", "*"];
        const op = operations[Math.floor(Math.random() * operations.length)];
        let a, b, answer;

        if (op === "+") {
          a = Math.floor(Math.random() * 20) + 1;
          b = Math.floor(Math.random() * 20) + 1;
          answer = a + b;
        } else if (op === "-") {
          a = Math.floor(Math.random() * 20) + 10;
          b = Math.floor(Math.random() * 10) + 1;
          answer = a - b;
        } else {
          a = Math.floor(Math.random() * 10) + 1;
          b = Math.floor(Math.random() * 10) + 1;
          answer = a * b;
        }

        return {
          type: "math",
          question: `Cât face ${a} ${op} ${b}?`,
          answer: answer.toString(),
          placeholder: "Introdu numărul",
        };

      case "text":
        const textQuestions = [
          {
            question: "Ce culoare se formează din roșu și albastru?",
            answer: "mov",
          },
          { question: "Care este capitala României?", answer: "bucuresti" },
          { question: "Câte luni are un an?", answer: "12" },
          { question: "Care este primul număr par?", answer: "2" },
          { question: "În ce anotimp cad frunzele?", answer: "toamna" },
          { question: "Câte zile are o săptămână?", answer: "7" },
          { question: 'Ce animal face "miau"?', answer: "pisica" },
          { question: "Care este culoarea soarelui?", answer: "galben" },
        ];

        const textQ =
          textQuestions[Math.floor(Math.random() * textQuestions.length)];
        return {
          type: "text",
          question: textQ.question,
          answer: textQ.answer.toLowerCase(),
          placeholder: "Introdu răspunsul",
        };

      case "logic":
        const logicQuestions = [
          {
            question: "Dacă azi este marți, ce zi va fi mâine?",
            answer: "miercuri",
          },
          { question: 'Care este opusul cuvântului "mare"?', answer: "mic" },
          { question: "Câte laturi are un triunghi?", answer: "3" },
          { question: "Ce vine după numărul 9?", answer: "10" },
          {
            question: "Completează: primăvară, vara, toamnă, ...",
            answer: "iarna",
          },
        ];

        const logicQ =
          logicQuestions[Math.floor(Math.random() * logicQuestions.length)];
        return {
          type: "logic",
          question: logicQ.question,
          answer: logicQ.answer.toLowerCase(),
          placeholder: "Introdu răspunsul",
        };

      case "sequence":
        const sequences = [
          { question: "Continuă secvența: 2, 4, 6, 8, ...", answer: "10" },
          { question: "Continuă secvența: 1, 3, 5, 7, ...", answer: "9" },
          { question: "Continuă secvența: 5, 10, 15, 20, ...", answer: "25" },
          { question: "Ce număr lipsește: 1, 2, _, 4, 5", answer: "3" },
          { question: "Continuă secvența: A, B, C, D, ...", answer: "e" },
        ];

        const seqQ = sequences[Math.floor(Math.random() * sequences.length)];
        return {
          type: "sequence",
          question: seqQ.question,
          answer: seqQ.answer.toLowerCase(),
          placeholder: "Introdu răspunsul",
        };

      default:
        return generateCaptcha();
    }
  }

  React.useEffect(() => {
    if (isBlocked && blockTime > 0) {
      const timer = setInterval(() => {
        setBlockTime((prev) => {
          if (prev <= 1) {
            setIsBlocked(false);
            setCaptchaAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTime]);

  React.useEffect(() => {
    setCaptchaLoading(true);
    setCaptchaError("");
    setTimeout(() => {
      setCaptchaLoading(false);
    }, 500);
  }, []);

  const handleCaptchaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isBlocked) {
      setCaptchaError(
        `Prea multe încercări eșuate. Încercă din nou în ${blockTime} secunde.`
      );
      return;
    }

    setCaptchaLoading(true);
    setCaptchaError("");

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const userAnswer = captchaInput.toLowerCase().trim();
    const correctAnswer = captchaQuestion.answer.toLowerCase().trim();

    if (userAnswer === correctAnswer) {
      setCaptchaVerified(true);
      setCaptchaAttempts(0);
    } else {
      const newAttempts = captchaAttempts + 1;
      setCaptchaAttempts(newAttempts);

      if (newAttempts >= 3) {
        setIsBlocked(true);
        setBlockTime(30);
        setCaptchaError("Prea multe încercări eșuate.");
        setTimeout(() => {
          setCaptchaError("");
        }, 30000);
        const unblockTime = Date.now() + 30 * 1000;
        localStorage.setItem("captchaBlockedUntil", unblockTime.toString());
      } else {
        setCaptchaError(
          `Răspuns incorect. Mai ai ${3 - newAttempts} încercări.`
        );
      }

      setCaptchaQuestion(generateCaptcha());
      setCaptchaInput("");
    }

    setCaptchaLoading(false);
  };

  React.useEffect(() => {
    const blockedUntil = localStorage.getItem("captchaBlockedUntil");
    if (blockedUntil) {
      const blockedUntilTime = parseInt(blockedUntil, 10);
      const now = Date.now();
      if (now < blockedUntilTime) {
        setIsBlocked(true);
        setBlockTime(Math.floor((blockedUntilTime - now) / 1000));
      } else {
        localStorage.removeItem("captchaBlockedUntil");
      }
    }
  }, []);

  const handleClose = () => {
    setCaptchaVerified(false);
    setCaptchaInput("");
    setCaptchaError("");
    setCaptchaAttempts(0);
    setCaptchaQuestion(generateCaptcha());
    onClose();
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Textul a fost copiat!");
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Informații de contact</h2>
          <button className={styles.closebutton} onClick={handleClose}>
            <Image
              src="/icons/close.svg"
              alt="Close"
              width={24}
              height={24}
              draggable={false}
            />
          </button>
        </div>

        <div className={styles.content}>
          {!captchaVerified ? (
            <div className={styles.captchasection}>
              <p className={styles.description}>
                Te rugăm să completezi captcha-ul de mai jos:
              </p>

              <form
                onSubmit={handleCaptchaSubmit}
                className={styles.captchaform}
              >
                <div
                  className={`${styles.captchaquestion} ${
                    styles[captchaQuestion.type]
                  }`}
                >
                  <span>{captchaQuestion.question}</span>
                </div>

                <input
                  type="text"
                  name="captcha"
                  id="captcha"
                  value={captchaInput}
                  onChange={(e) =>
                    setCaptchaInput(e.target.value.toLowerCase())
                  }
                  placeholder={captchaQuestion.placeholder}
                  className={styles.captchainput}
                  disabled={isBlocked}
                  required
                />

                {captchaError && (
                  <p
                    className={`${styles.error} ${
                      isBlocked ? styles.blocked : ""
                    }`}
                  >
                    {captchaError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={captchaLoading || isBlocked}
                  className={`${styles.verifybutton} ${
                    isBlocked ? styles.blockedbutton : ""
                  }`}
                >
                  {isBlocked
                    ? `Blocat (${blockTime}s)`
                    : captchaLoading
                    ? "Se verifică..."
                    : "Verifică"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCaptchaQuestion(generateCaptcha());
                    setCaptchaInput("");
                    setCaptchaError("");
                  }}
                  className={styles.refreshbutton}
                  disabled={isBlocked}
                >
                  <Image
                    src="/icons/refresh.svg"
                    alt="Refresh"
                    width={16}
                    height={16}
                    draggable={false}
                  />
                  Întrebare nouă
                </button>
              </form>
            </div>
          ) : (
            <div className={styles.contactsection}>
              <div className={styles.successmessage}>
                <Image
                  src="/icons/green-check2.svg"
                  alt="Success"
                  width={24}
                  height={24}
                  draggable={false}
                />
                <p>Captcha verificat cu succes!</p>
              </div>

              <div className={styles.contactinfo}>
                {email && (
                  <div className={styles.contactitem}>
                    <div className={styles.contactlabel}>
                      <Image
                        src="/icons/email.svg"
                        alt="Email"
                        width={20}
                        height={20}
                        draggable={false}
                      />
                      <span>Email:</span>
                    </div>
                    <div className={styles.contactvalue}>
                      <span>{email}</span>
                      <button
                        onClick={() => copyToClipboard(email)}
                        className={styles.copybutton}
                        title="Copiază email"
                      >
                        <Image
                          src="/icons/copy.svg"
                          alt="Copy"
                          width={16}
                          height={16}
                          draggable={false}
                        />
                      </button>
                    </div>
                  </div>
                )}

                {phone && (
                  <div className={styles.contactitem}>
                    <div className={styles.contactlabel}>
                      <Image
                        src="/icons/phone-blue.svg"
                        alt="Phone"
                        width={20}
                        height={20}
                        draggable={false}
                      />
                      <span>Telefon:</span>
                    </div>
                    <div className={styles.contactvalue}>
                      <span>{phone}</span>
                      <button
                        onClick={() => copyToClipboard(phone)}
                        className={styles.copybutton}
                        title="Copiază telefon"
                      >
                        <Image
                          src="/icons/copy.svg"
                          alt="Copy"
                          width={16}
                          height={16}
                          draggable={false}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.note}>
                <p>
                  <strong>Notă:</strong> Te rugăm să folosești aceste informații
                  responsabil și să contactezi persoana doar în legătură cu
                  această postare.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
