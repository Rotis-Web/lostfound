"use client";

import styles from "./page.module.scss";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Loader from "../components/Loader/Loader";
import UserPosts from "../components/UserPosts/UserPosts";
import { usePosts } from "@/context/PostsContext";

type PasswordErrors = {
  oldPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
};

type DeleteAccountErrors = {
  password?: string;
  confirmationText?: string;
  dataSecurityConfirmed?: string;
  general?: string;
};

type AuthError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function ProfilePage() {
  const { user, logout, changePassword, deleteAccount, loading } = useAuth();
  const [activePage, setActivePage] = useState("postari");
  const [passwordChangeActive, setPasswordChangeActive] = useState(false);
  const [deleteAccountActive, setDeleteAccountActive] = useState(false);
  const router = useRouter();
  const { setUserPosts } = usePosts();

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({});
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [deletePassword, setDeletePassword] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [dataSecurityConfirmed, setDataSecurityConfirmed] = useState(false);
  const [deleteAccountErrors, setDeleteAccountErrors] =
    useState<DeleteAccountErrors>({});
  const [deleteAccountLoading, setDeleteAccountLoading] = useState(false);

  const isDeleteDisabled =
    !deletePassword ||
    !(confirmationText === "STERGE CONTUL") ||
    !dataSecurityConfirmed ||
    deleteAccountLoading;

  const isPasswordDisabled =
    !oldPassword ||
    !newPassword ||
    !confirmPassword ||
    newPassword !== confirmPassword ||
    passwordLoading;

  useEffect(() => {
    if (!user && !loading) {
      router.replace("/");
    }
  }, [user, loading, router]);

  const handleLogout = () => {
    try {
      router.push("/");
      setTimeout(() => {
        logout();
        setUserPosts([]);
      }, 300);

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

        if (error.code === "TOO_MANY_REQUESTS") {
          toast.error(error.message);
          return;
        }

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

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteAccountErrors({});
    setDeleteAccountLoading(true);

    try {
      await deleteAccount(
        deletePassword,
        confirmationText,
        dataSecurityConfirmed
      );
      router.push("/");
      toast.success("Contul a fost șters cu succes!");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as AuthError;

        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.errors)) {
          const fieldErrors: DeleteAccountErrors = {};
          error.errors.forEach(({ field, message }) => {
            fieldErrors[field as keyof DeleteAccountErrors] = message;
          });
          setDeleteAccountErrors(fieldErrors);
        } else if (error.field && error.message) {
          setDeleteAccountErrors({ [error.field]: error.message });
        } else {
          setDeleteAccountErrors({
            general: error.message || "A apărut o eroare neașteptată",
          });
        }
      } else {
        setDeleteAccountErrors({ general: "Eroare necunoscută" });
      }
    } finally {
      setDeleteAccountLoading(false);
    }
  };

  if (loading || !user) return <Loader />;

  return (
    <main className={styles.profile}>
      <section className={styles.container}>
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
          {activePage === "postari" && <UserPosts />}
          {activePage === "setari" && (
            <section className={styles.settings_container}>
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
                      <label htmlFor="oldPassword" className={styles.hidden}>
                        Parola veche
                      </label>
                      <input
                        type="password"
                        name="oldPassword"
                        id="oldPassword"
                        placeholder="Parola veche"
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
                        aria-required="true"
                      />
                      {passwordErrors.oldPassword && (
                        <span className={styles.errormessage}>
                          {passwordErrors.oldPassword}
                        </span>
                      )}
                    </div>
                    <div className={styles.inputbox}>
                      <label htmlFor="newPassword" className={styles.hidden}>
                        Parola nouă
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        placeholder="Parola nouă"
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
                        aria-required="true"
                      />
                      {passwordErrors.newPassword && (
                        <span className={styles.errormessage}>
                          {passwordErrors.newPassword}
                        </span>
                      )}
                    </div>
                    <div className={styles.inputbox}>
                      <label
                        htmlFor="confirmPassword"
                        className={styles.hidden}
                      >
                        Confirmare parola
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
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
                        aria-required="true"
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
                    <button type="submit" disabled={isPasswordDisabled}>
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
                  Politica de confidențialitate
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
              </div>
              <div
                className={styles.settings}
                style={{
                  color: "#dc2626",
                  // border: "1px solid rgba(255, 0, 0, 0.5)",
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
                <div
                  className={`${styles.settingsform} ${
                    deleteAccountActive ? styles.active : ""
                  }`}
                >
                  <div className={styles.deletewarning}>
                    <p>&#9888;</p>
                    <p>
                      Această acțiune este permanentă și nu poate fi anulată!
                    </p>
                  </div>
                  <form onSubmit={handleDeleteAccount} className={styles.form}>
                    <div className={styles.inputbox}>
                      <label htmlFor="deletePassword" className={styles.hidden}>
                        Parola pentru confirmare
                      </label>
                      <input
                        type="password"
                        name="deletePassword"
                        id="deletePassword"
                        placeholder="Introduceți parola pentru confirmare"
                        value={deletePassword}
                        onChange={(e) => {
                          setDeletePassword(e.target.value);
                          setDeleteAccountErrors({
                            ...deleteAccountErrors,
                            password: undefined,
                            general: undefined,
                          });
                        }}
                        className={
                          deleteAccountErrors.password ? styles.error : ""
                        }
                        aria-required="true"
                      />
                      {deleteAccountErrors.password && (
                        <span className={styles.errormessage}>
                          {deleteAccountErrors.password}
                        </span>
                      )}
                    </div>
                    <div className={styles.inputbox}>
                      <label
                        htmlFor="confirmationText"
                        className={styles.hidden}
                      >
                        Text de confirmare
                      </label>
                      <input
                        type="text"
                        name="confirmationText"
                        id="confirmationText"
                        placeholder="Tastați 'STERGE CONTUL' pentru confirmare"
                        value={confirmationText}
                        onChange={(e) => {
                          setConfirmationText(e.target.value.toUpperCase());
                          setDeleteAccountErrors({
                            ...deleteAccountErrors,
                            confirmationText: undefined,
                            general: undefined,
                          });
                        }}
                        className={
                          deleteAccountErrors.confirmationText
                            ? styles.error
                            : ""
                        }
                        aria-required="true"
                      />
                      {deleteAccountErrors.confirmationText && (
                        <span className={styles.errormessage}>
                          {deleteAccountErrors.confirmationText}
                        </span>
                      )}
                    </div>
                    <div className={styles.checkboxcontainer}>
                      <label className={styles.checkboxlabel}>
                        <label
                          htmlFor="dataSecurityConfirmed"
                          className={styles.hidden}
                        >
                          Confirmare Politica de Confidențialitate
                        </label>
                        <input
                          type="checkbox"
                          name="dataSecurityConfirmed"
                          id="dataSecurityConfirmed"
                          checked={dataSecurityConfirmed}
                          onChange={(e) => {
                            setDataSecurityConfirmed(e.target.checked);
                            setDeleteAccountErrors({
                              ...deleteAccountErrors,
                              dataSecurityConfirmed: undefined,
                              general: undefined,
                            });
                          }}
                          aria-required="true"
                        />
                        <p>
                          Am citit și înțeleg Politica de Confidențialitate și
                          confirm că doresc să îmi șterg contul definitiv.
                        </p>
                      </label>
                      {deleteAccountErrors.dataSecurityConfirmed && (
                        <span className={styles.errorgeneral}>
                          &#x26A0; {deleteAccountErrors.dataSecurityConfirmed}
                        </span>
                      )}
                    </div>
                    {deleteAccountErrors.general && (
                      <div className={styles.errorgeneral}>
                        <Image
                          src="/icons/error.svg"
                          alt="Error Icon"
                          width={15}
                          height={15}
                        />
                        <span>{deleteAccountErrors.general}</span>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isDeleteDisabled}
                      className={styles.deleteButton}
                      style={{ backgroundColor: "#dc2626" }}
                    >
                      {deleteAccountLoading
                        ? "Se șterge..."
                        : "Șterge contul definitiv"}
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
