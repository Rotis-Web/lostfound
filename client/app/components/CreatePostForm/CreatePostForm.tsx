"use client";

import styles from "./CreatePostForm.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Image from "next/image";
import Loader from "../Loader/Loader";
import { categories } from "../HomePage/Categories/Categories";
import dynamic from "next/dynamic";
import PhoneInput from "../PhoneInput/PhoneInput";
import { usePosts } from "@/context/PostsContext";

const MapInput = dynamic(() => import("../MapInput/MapInput"), { ssr: false });

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

type FieldErrors = {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  content?: string;
  reward?: string;
  tags?: string;
  category?: string;
  images?: string;
  location?: string;
  general?: string;
};

type PostError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

export default function CreatePostForm() {
  const { user, loading: authLoading } = useAuth();
  const { createPost, loading: postLoading } = usePosts();
  const router = useRouter();

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [status, setStatus] = useState<string>("pierdut");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");
  const [reward, setReward] = useState<string>("");
  const [lastSeen, setLastSeen] = useState<string>("");
  const [images, setImages] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormDisabled = submitting || postLoading;
  const isProcessing = submitting || postLoading;

  const handleLocationChange = useCallback(
    (locationData: LocationData | null) => {
      if (isFormDisabled) return;
      setLocation(locationData);
      if (locationData && errors.location) {
        setErrors((prev) => ({ ...prev, location: undefined }));
      }
    },
    [errors.location, isFormDisabled]
  );

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFormDisabled) return;

    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      const trimmed = tagInput.trim();

      if (!trimmed) return;

      if (tags.length >= 20) {
        toast.error("Puteți adăuga maximum 20 de etichete.");
        return;
      }

      if (!tags.includes(trimmed)) {
        setTags((prev) => [...prev, trimmed]);
        setTagInput("");
      }
    } else if (e.key === "Backspace" && tagInput === "") {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    if (isFormDisabled) return;
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const clearError = (field: keyof FieldErrors) => {
    if (isFormDisabled) return;
    if (errors[field] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        general: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!name.trim()) {
      newErrors.name = "Numele complet este obligatoriu";
    }

    if (!email.trim()) {
      newErrors.email = "Adresa de email este obligatorie";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Adresa de email nu este validă";
    }

    const phoneRegex = /^\+\d{1,4}\s?\d{4,}$/;
    if (!phone || phone.trim() === "") {
      newErrors.phone = "Numărul de telefon este obligatoriu";
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = "Numărul de telefon nu este valid";
    }
    if (!title.trim()) {
      newErrors.title = "Titlul postării este obligatoriu";
    }

    if (content.trim().length > 1000) {
      newErrors.content = "Conținutul trebuie să aibă cel mult 1000 caractere";
    }

    if (!selectedCategory) {
      newErrors.category = "Categoria este obligatorie";
    }

    if (images.length === 0) {
      newErrors.images = "Cel puțin o imagine este obligatorie";
    }

    if (!location) {
      newErrors.location = "Locația este obligatorie";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isFormDisabled) return;

    setErrors({});

    if (!validateForm()) {
      toast.error("Vă rugăm să completați toate câmpurile obligatorii");
      return;
    }

    if (!user) {
      toast.error("Date lipsă pentru crearea postării");
      return;
    }

    if (!location) {
      setErrors((prev) => ({ ...prev, location: "Locația este obligatorie" }));
      return;
    }

    if (status === "gasit") {
      setReward("");
    }

    setSubmitting(true);

    try {
      const postData = {
        author: user._id || "",
        title,
        content,
        tags: tags.length > 0 ? tags : undefined,
        status: status === "pierdut" ? ("lost" as const) : ("found" as const),
        name,
        email,
        phone,
        category: selectedCategory,
        lastSeen: lastSeen ? new Date(lastSeen) : undefined,
        location: location.name,
        locationCoordinates: {
          type: "Point" as const,
          coordinates: [location.lng, location.lat] as [number, number],
        },
        circleRadius: location.radius * 1000,
        reward: reward ? Number(reward) : undefined,
        images,
      };

      const result = await createPost(postData);

      // Store the post ID and redirect immediately after successful creation
      sessionStorage.setItem("createdPostID", result.postID);

      // Redirect immediately after successful creation
      router.push("/create-post/success");
    } catch (err: unknown) {
      if (typeof err === "object" && err !== null && "message" in err) {
        const error = err as PostError;

        if (error.code === "VALIDATION_ERROR" && Array.isArray(error.errors)) {
          const fieldErrors: FieldErrors = {};
          error.errors.forEach(({ field, message }) => {
            fieldErrors[field as keyof FieldErrors] = message;
          });
          setErrors(fieldErrors);
        } else if (error.field && error.message) {
          setErrors({ [error.field]: error.message });
        } else {
          setErrors({
            general: error.message || "A apărut o eroare neașteptată",
          });
          toast.error(error.message || "A apărut o eroare neașteptată");
        }
      } else {
        setErrors({ general: "Eroare necunoscută" });
        toast.error("Eroare necunoscută");
      }
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (authLoading) return <Loader />;

  return (
    <section className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        {user && (
          <div className={styles.userdata}>
            <h2>Date de contact</h2>
            <div className={styles.userdataform}>
              <div className={styles.inputbox}>
                <p>
                  Numele complet<span className={styles.required}> *</span>{" "}
                  <span
                    className={`${errors.name ? styles.error : ""} ${
                      errors.name && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.name}
                  </span>
                </p>
                <label htmlFor="name" className={styles.hidden}>
                  Nume complet
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  autoComplete="name"
                  placeholder="Introduceți numele complet"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                  className={errors.name ? styles.error : ""}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
                {name && (
                  <button
                    type="button"
                    onClick={() => !isFormDisabled && setName("")}
                    className={styles.clear}
                    disabled={isFormDisabled}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.inputbox}>
                <p>
                  Adresa de email<span className={styles.required}> *</span>{" "}
                  <span
                    className={`${errors.email ? styles.error : ""} ${
                      errors.email && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.email}
                  </span>
                </p>
                <label htmlFor="email" className={styles.hidden}>
                  Adresa de email
                </label>
                <input
                  type="text"
                  name="email"
                  id="email"
                  autoComplete="email"
                  placeholder="Introduceți adresa de email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                  className={errors.email ? styles.error : ""}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
                {email && (
                  <button
                    type="button"
                    onClick={() => !isFormDisabled && setEmail("")}
                    className={styles.clear}
                    disabled={isFormDisabled}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.phonebox}>
                <PhoneInput
                  onPhoneChange={(phone) =>
                    !isFormDisabled && setPhone(phone || "")
                  }
                  clearError={clearError}
                  errors={errors.phone}
                  disabled={isFormDisabled}
                />
              </div>
            </div>
          </div>
        )}
        <div className={styles.postdata}>
          <h2>Datele postării</h2>
          <div className={styles.postdataform}>
            <div className={styles.postdatabox}>
              <div className={styles.status}>
                <h3>
                  Stare
                  <span className={styles.required}> *</span>
                </h3>
                <div className={styles.statusbuttons}>
                  <button
                    type="button"
                    className={`${status === "pierdut" && styles.active}`}
                    onClick={() => {
                      if (isFormDisabled) return;
                      setStatus("pierdut");
                      setReward("");
                    }}
                    style={{ borderRadius: "5px 0 0 5px" }}
                    disabled={isFormDisabled}
                  >
                    Pierdut
                  </button>
                  <button
                    type="button"
                    className={`${status === "gasit" && styles.active}`}
                    onClick={() => {
                      if (isFormDisabled) return;
                      setStatus("gasit");
                      setReward("");
                    }}
                    style={{ borderRadius: "0 5px 5px 0" }}
                    disabled={isFormDisabled}
                  >
                    Găsit
                  </button>
                </div>
              </div>
              <div className={styles.inputbox}>
                <p>
                  Titlul postării<span className={styles.required}> *</span>{" "}
                  <span
                    className={`${errors.title ? styles.error : ""} ${
                      errors.title && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.title}
                  </span>
                </p>
                <label htmlFor="title" className={styles.hidden}>
                  Titlul postării
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  placeholder="Introduceți titlul postării ( ex: Câine pierdut ) "
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    clearError("title");
                  }}
                  className={errors.title ? styles.error : ""}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
                {title && (
                  <button
                    type="button"
                    onClick={() => !isFormDisabled && setTitle("")}
                    className={styles.clear}
                    disabled={isFormDisabled}
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className={styles.inputbox}>
                <p>
                  Conținutul postării{" "}
                  <span
                    className={`${errors.content ? styles.error : ""} ${
                      errors.content && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.content}
                  </span>
                  <span className={styles.charactercount}>
                    {content.length}/1000
                  </span>
                </p>
                <label htmlFor="content" className={styles.hidden}>
                  Conținutul postării
                </label>
                <textarea
                  name="content"
                  id="content"
                  placeholder="Introduceți conținutul postării ( ex: Câinele răspunde la numele Rocky și este foarte prietenos )"
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    clearError("content");
                  }}
                  maxLength={1000}
                  className={errors.content ? styles.error : ""}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
              </div>
              <div className={styles.inputbox}>
                <p>
                  Cuvinte cheie
                  <span className={styles.info}>( maximum 20 )</span>
                </p>
                <div className={styles.taginputwrapper}>
                  <label htmlFor="tags" className={styles.hidden}>
                    Cuvinte cheie
                  </label>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    placeholder="Introduceți cuvinte cheie separate prin spații"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    aria-required="true"
                    disabled={isFormDisabled}
                  />
                  {tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        disabled={isFormDisabled}
                      >
                        &#x2716;
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              {status === "pierdut" && (
                <div className={styles.inputbox}>
                  <p>
                    Recompensă<span className={styles.info}> ( opțional )</span>
                    <span
                      className={`${errors.reward ? styles.error : ""} ${
                        errors.reward && styles.info
                      }`}
                      style={{ marginLeft: "10px", opacity: 1 }}
                    >
                      {errors.reward}
                    </span>
                  </p>
                  <label htmlFor="reward" className={styles.hidden}>
                    Recompensă
                  </label>
                  <input
                    type="text"
                    name="reward"
                    id="reward"
                    placeholder="Introduceți recompensa ( ex: 100 RON )"
                    value={reward}
                    onChange={(e) => {
                      const onlyNumbers = e.target.value.replace(/\D/g, "");
                      setReward(onlyNumbers);
                      clearError("reward");
                    }}
                    className={errors.reward ? styles.error : ""}
                    aria-required="true"
                    disabled={isFormDisabled}
                  />
                  {reward && <span className={styles.ronlabel}>RON</span>}
                  {reward && (
                    <button
                      type="button"
                      onClick={() => !isFormDisabled && setReward("")}
                      className={styles.clear}
                      disabled={isFormDisabled}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
              <div className={styles.dateinputbox}>
                <p>
                  {status === "pierdut"
                    ? "Ultima dată văzut/ă"
                    : "Data găsirii"}{" "}
                  <span
                    className={`${errors.tags ? styles.error : ""} ${
                      errors.tags && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.tags}
                  </span>
                </p>
                <label htmlFor="lastSeen" className={styles.hidden}>
                  Data
                </label>
                <input
                  type="date"
                  name="lastSeen"
                  id="lastSeen"
                  value={lastSeen}
                  onChange={(e) => {
                    setLastSeen(e.target.value);
                    clearError("tags");
                  }}
                  max={new Date().toISOString().split("T")[0]}
                  className={styles.dateinput}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
              </div>
              <div className={styles.inputbox}>
                <p>
                  Imagini
                  <span className={styles.required}> *</span>
                  <span className={styles.info}>
                    ( maximum 5, fiecare de cel mult 5MB )
                  </span>{" "}
                  <br />
                  <span
                    className={`${errors.images ? styles.error : ""} ${
                      errors.images && styles.info
                    }`}
                    style={{ margin: 0, opacity: 1 }}
                  >
                    {errors.images}
                  </span>
                </p>
                <div className={styles.imageuploadbox}>
                  <button
                    type="button"
                    className={styles.uploadbutton}
                    onClick={() =>
                      !isFormDisabled && fileInputRef.current?.click()
                    }
                    disabled={isFormDisabled}
                  >
                    Adaugă imagini <span>+</span>
                  </button>
                  <label htmlFor="images" className={styles.hidden}>
                    Imagini
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    id="images"
                    name="images"
                    multiple
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => {
                      if (isFormDisabled) return;
                      const files = Array.from(e.target.files || []);
                      const newValidImages: File[] = [];
                      for (const file of files) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(
                            `Imaginea "${file.name}" este mai mare de 5MB.`
                          );
                          continue;
                        }
                        if (images.length + newValidImages.length >= 5) {
                          toast.error("Puteți adăuga maximum 5 imagini.");
                          break;
                        }
                        newValidImages.push(file);
                      }
                      if (newValidImages.length > 0) {
                        setImages((prev) => [...prev, ...newValidImages]);
                        clearError("images");
                      }
                      e.target.value = "";
                    }}
                    aria-required="true"
                    disabled={isFormDisabled}
                  />
                </div>
                <div className={styles.imagepreviewwrapper}>
                  {images.map((image, index) => {
                    const objectUrl = URL.createObjectURL(image);
                    return (
                      <div key={index} className={styles.imagepreview}>
                        <Image
                          src={objectUrl}
                          alt={`preview-${index}`}
                          width={100}
                          height={100}
                          style={{ objectFit: "cover", borderRadius: "5px" }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (isFormDisabled) return;
                            setImages((prev) =>
                              prev.filter((_, i) => i !== index)
                            );
                          }}
                          className={styles.deletebutton}
                          disabled={isFormDisabled}
                        >
                          &#x2716;
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className={styles.postdatabox}>
              <div className={styles.inputbox}>
                <p>
                  Categorie
                  <span className={styles.required}> *</span>
                  <span
                    className={`${errors.category ? styles.error : ""} ${
                      errors.category && styles.info
                    }`}
                    style={{ marginLeft: "10px", opacity: 1 }}
                  >
                    {errors.category}
                  </span>
                </p>
                <div className={styles.categoriescontainer}>
                  {categories.map((category) => (
                    <div
                      className={`${styles.category} ${
                        isFormDisabled ? styles.disabled : ""
                      }`}
                      key={category.name}
                      onClick={() => {
                        if (isFormDisabled) return;
                        setSelectedCategory(category.name);
                        clearError("category");
                      }}
                      style={{
                        pointerEvents: isFormDisabled ? "none" : "auto",
                        opacity: isFormDisabled ? 0.6 : 1,
                      }}
                    >
                      <div
                        className={styles.imagecontainer}
                        style={{
                          backgroundColor:
                            category.name === selectedCategory
                              ? "rgba(255, 215, 0, 0.3)"
                              : "white",
                          border:
                            category.name === selectedCategory
                              ? "2px solid rgb(255, 215, 0)"
                              : "",
                        }}
                      >
                        <div className={styles.image}>
                          <Image
                            src={category.image}
                            alt={category.name}
                            fill
                            sizes="100%"
                            draggable={false}
                          />
                        </div>
                      </div>
                      <div className={styles.text}>
                        <p
                          style={{
                            color:
                              category.name === selectedCategory
                                ? "rgb(255, 215, 0)"
                                : "",
                          }}
                        >
                          {category.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <MapInput
                  onLocationChange={handleLocationChange}
                  errors={errors.location}
                  clearError={clearError}
                  disabled={isFormDisabled}
                />
              </div>
              <div className={styles.submitbox}>
                <button
                  type="submit"
                  className={styles.submitbutton}
                  disabled={isFormDisabled}
                >
                  <p>
                    {isProcessing ? "Se procesează..." : "Finalizează postarea"}
                  </p>
                  <Image
                    src="/icons/arrow-right-orange.svg"
                    alt="Pictogramă săgeată dreapa"
                    width={25}
                    height={25}
                  />
                </button>{" "}
                {errors.general && (
                  <div className={styles.errorgeneral}>
                    <Image
                      src="/icons/error.svg"
                      alt="Error Icon"
                      width={15}
                      height={15}
                    />
                    <span>{errors.general}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
}
