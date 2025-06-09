"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "react-toastify";

type PasswordErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

type AuthError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function ProfilePage() {
  const { user, logout, changePassword } = useAuth();
  const [activePage, setActivePage] = useState("postari");
  const [passwordChangeActive, setPasswordChangeActive] = useState(false);
  const [deleteAccountActive, setDeleteAccountActive] = useState(false);
  const router = useRouter();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleLogout = () => {
    try {
      router.push("/");
      setTimeout(() => {
        logout();
      }, 200);
      toast.success("Te-ai deconectat cu succes");
    } catch (err) {
      console.log(err);
    }
  };

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (user?.lostfoundID) {
      navigator.clipboard.writeText(user.lostfoundID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrors({});
    setPasswordLoading(true);

    try {
      await changePassword(oldPassword, newPassword, confirmPassword);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      toast.success("Parola a fost schimbată cu succes!");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as AuthError;

        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.errors)) {
          const fieldErrors: PasswordErrors = {};
          error.errors.forEach(({ field, message }) => {
            fieldErrors[field as keyof PasswordErrors] = message;
          });
          setPasswordErrors(fieldErrors);
        } else if (error.field && error.message) {
          setPasswordErrors({ [error.field]: error.message });
        } else {
          setPasswordErrors({
            general: error.message || "A apărut o eroare neașteptată",
          });
        }
      } else {
        setPasswordErrors({ general: "Eroare necunoscută" });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <main className={styles.profile}>
      <div className={styles.container}>
        <div className={styles.background}></div>
        <div className={styles.content}>
          <div className={styles.content_items}>
            {user?.profileImage && (
              <div className={styles.image}>
                <Image
                  src={user.profileImage}
                  alt="User Profile Icon"
                  fill
                  sizes="100%"
                  priority
                />
              </div>
            )}
            <h1 className={styles.name}>{user?.name}</h1>
          </div>
        </div>
        <div className={styles.info}>
          <p>{user?.email}</p>
          <div className={styles.id} onClick={handleCopy}>
            ID: {user?.lostfoundID}
            <span className={styles.tooltip}>
              {copied ? "Copiat!" : "Copiază!"}
            </span>
          </div>
        </div>
        <div className={styles.membersince}>
          <p>
            Membru Lost & Found din {""}
            {user?.createdAt
              ? new Date(user.createdAt).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                })
              : ""}
          </p>
        </div>
        <div className={styles.buttoncontainer}>
          <button className={styles.button}>
            <Image
              src="/icons/add-plus.svg"
              alt="Add Post Icon"
              width={20}
              height={20}
            />
            Adaugă postare
          </button>{" "}
          <button
            className={styles.button}
            style={{
              color: "#f57a4e",
              backgroundColor: "transparent",
            }}
            onClick={handleLogout}
          >
            <Image
              src="/icons/exit.svg"
              alt="Exit Icon"
              width={20}
              height={20}
            />{" "}
            Ieși din cont
          </button>
        </div>
        <div className={styles.posts_and_settings}>
          <div className={styles.menu}>
            <button
              onClick={() => {
                setActivePage("postari");
                setPasswordChangeActive(false);
                setDeleteAccountActive(false);
              }}
              className={activePage === "postari" ? styles.active : ""}
            >
              Postări
            </button>
            <button
              onClick={() => setActivePage("setari")}
              className={activePage === "setari" ? styles.active : ""}
            >
              Setări cont
            </button>
          </div>
          {activePage === "postari" && (
            <div
              style={{
                fontSize: "1em",
                fontWeight: "600",
                color: "var(--blue)",
                width: "100%",
                aspectRatio: "12/4",
                position: "relative",
              }}
            >
              <Image
                src="/images/empty_user_posts.png"
                alt="Empty User Posts Image"
                style={{ opacity: 0.5 }}
                fill
                sizes="100%"
                priority
              />
            </div>
          )}
          {activePage === "setari" && (
            <div className={styles.settings_container}>
              <div className={styles.settings}>
                <div
                  className={styles.settingstext}
                  onClick={() => setPasswordChangeActive(!passwordChangeActive)}
                >
                  Schimbare parolă
                  <Image
                    src="/icons/arrow-right.svg"
                    alt="Arrow Right Icon"
                    style={passwordChangeActive ? { rotate: "90deg" } : {}}
                    width={20}
                    height={20}
                  />{" "}
                </div>
                <div
                  className={`${styles.settingsform} ${
                    passwordChangeActive ? styles.active : ""
                  }`}
                >
                  <form onSubmit={handlePasswordChange} className={styles.form}>
                    <div className={styles.inputbox}>
                      <input
                        type="password"
                        placeholder="Parolă veche"
                        value={oldPassword}
                        onChange={(e) => {
                          setOldPassword(e.target.value);
                          setPasswordErrors({
                            ...passwordErrors,
                            oldPassword: undefined,
                            general: undefined,
                          });
                        }}
                        className={
                          passwordErrors.oldPassword ? styles.error : ""
                        }
                      />
                      {passwordErrors.oldPassword && (
                        <span className={styles.errormessage}>
                          {passwordErrors.oldPassword}
                        </span>
                      )}
                    </div>
                    <div className={styles.inputbox}>
                      <input
                        type="password"
                        placeholder="Parolă nouă"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          setPasswordErrors({
                            ...passwordErrors,
                            newPassword: undefined,
                            general: undefined,
                          });
                        }}
                        className={
                          passwordErrors.newPassword ? styles.error : ""
                        }
                      />
                      {passwordErrors.newPassword && (
                        <span className={styles.errormessage}>
                          {passwordErrors.newPassword}
                        </span>
                      )}
                    </div>
                    <div className={styles.inputbox}>
                      <input
                        type="password"
                        placeholder="Confirmă parola"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setPasswordErrors({
                            ...passwordErrors,
                            confirmPassword: undefined,
                            general: undefined,
                          });
                        }}
                        className={
                          passwordErrors.confirmPassword ? styles.error : ""
                        }
                      />
                      {passwordErrors.confirmPassword && (
                        <span className={styles.errormessage}>
                          {passwordErrors.confirmPassword}
                        </span>
                      )}
                    </div>
                    {passwordErrors.general && (
                      <div className={styles.errorgeneral}>
                        <Image
                          src="/icons/error.svg"
                          alt="Error Icon"
                          width={15}
                          height={15}
                        />
                        <span>{passwordErrors.general}</span>
                      </div>
                    )}
                    <button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? "Se salvează..." : "Salvează"}
                    </button>
                  </form>
                </div>
              </div>
              <div className={styles.settings}>
                <div className={styles.settingstext}>
                  Termeni și condiții
                  <Image
                    src="/icons/arrow-right.svg"
                    alt="Arrow Right Icon"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className={styles.settings}>
                <div className={styles.settingstext}>
                  Securitatea datelor
                  <Image
                    src="/icons/arrow-right.svg"
                    alt="Arrow Right Icon"
                    width={20}
                    height={20}
                  />
                </div>
              </div>
              <div className={styles.settings}>
                <div className={styles.settingstext}>
                  Setări cookies
                  <Image
                    src="/icons/arrow-right.svg"
                    alt="Arrow Right Icon"
                    width={20}
                    height={20}
                  />
                </div>
              </div>{" "}
              <div
                className={styles.settings}
                style={{
                  color: "red",
                  border: "1px solid rgba(255, 0, 0, 0.5)",
                  opacity: "0.7",
                }}
              >
                <div
                  className={styles.settingstext}
                  onClick={() => setDeleteAccountActive(!deleteAccountActive)}
                >
                  Ștergere cont
                  <Image
                    src="/icons/arrow-right-red.svg"
                    alt="Red Arrow Right Icon"
                    style={deleteAccountActive ? { rotate: "90deg" } : {}}
                    width={20}
                    height={20}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
