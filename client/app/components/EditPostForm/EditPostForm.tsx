"use client";

import styles from "./EditPostForm.module.scss";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { usePosts } from "@/context/PostsContext";
import { toast } from "react-toastify";
import Image from "next/image";
import Loader from "@/app/components/Loader/Loader";
import dynamic from "next/dynamic";
import PhoneInput from "@/app/components/PhoneInput/PhoneInput";
import { categories } from "@/app/components/HomePage/Categories/Categories";

const MapInput = dynamic(() => import("@/app/components/MapInput/MapInput"), {
  ssr: false,
});

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

type FieldErrors = Partial<
  Record<
    | "name"
    | "email"
    | "phone"
    | "status"
    | "title"
    | "content"
    | "tags"
    | "reward"
    | "lastSeen"
    | "category"
    | "images"
    | "location"
    | "general",
    string
  >
>;

type PostError = {
  code?: string;
  message?: string;
  field?: string;
  errors?: { field: string; message: string }[];
};

interface GetPostByIDError {
  code: string;
  message: string;
}

export default function EditPostForm() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const { user, loading: authLoading } = useAuth();
  const { editPost, loading: postLoading, getPostByID } = usePosts();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"lost" | "found" | "solved">("lost");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [reward, setReward] = useState("");
  const [lastSeen, setLastSeen] = useState("");
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState<LocationData | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isFormDisabled = submitting || postLoading;
  const isProcessing = submitting || postLoading;

  const clearError = useCallback(
    (field: keyof FieldErrors) => {
      if (isFormDisabled) return;
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
        general: undefined,
      }));
    },
    [isFormDisabled]
  );

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isFormDisabled) return;

    if ((e.key === " " || e.key === "Enter") && tagInput.trim()) {
      e.preventDefault();
      if (tags.length >= 20) return toast.error("Maxim 20 etichete");
      if (!tags.includes(tagInput.trim())) {
        setTags((prev) => [...prev, tagInput.trim()]);
      }
      setTagInput("");
    } else if (e.key === "Backspace" && tagInput === "") {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    if (isFormDisabled) return;
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLocationChange = useCallback(
    (loc: LocationData | null) => {
      if (isFormDisabled) return;
      setLocation(loc);
      if (loc) clearError("location");
    },
    [isFormDisabled, setLocation, clearError]
  );

  const handleRemoveExisting = (url: string) => {
    if (isFormDisabled) return;
    setExistingImages((prev) => prev.filter((u) => u !== url));
    setImagesToRemove((prev) => [...prev, url]);
    clearError("images");
  };

  const handleAddImages = (files: FileList | null) => {
    if (isFormDisabled) return;
    if (!files) return;
    const valid: File[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`Imaginea "${file.name}" depășește 5 MB`);
        return;
      }
      if (existingImages.length + newImages.length + valid.length >= 5) {
        toast.error("Puteți adăuga maximum 5 imagini");
        return;
      }
      valid.push(file);
    });
    if (valid.length) setNewImages((prev) => [...prev, ...valid]);
    clearError("images");
  };

  const getPost = useCallback(async () => {
    if (!postId) return;
    setLoadingData(true);
    try {
      const result = await getPostByID(postId);
      const p = result.post;

      setName(p.name);
      setEmail(p.email);
      setPhone(p.phone);
      setStatus(p.status);
      setTitle(p.title);
      setContent(p.content);
      setTags(p.tags || []);
      setReward(p.reward ? String(p.reward) : "");
      setLastSeen(
        p.lastSeen ? new Date(p.lastSeen).toISOString().split("T")[0] : ""
      );
      setExistingImages(p.images || []);
      setSelectedCategory(p.category);
      setLocation({
        name: p.location,
        lat: p.locationCoordinates.coordinates[1],
        lng: p.locationCoordinates.coordinates[0],
        radius: p.circleRadius / 1000,
      });
    } catch (err: unknown) {
      const error = err as GetPostByIDError;
      toast.error(error.message || "Eroare la încărcare");
      router.replace("/profile");
    } finally {
      setLoadingData(false);
    }
  }, [postId, getPostByID, router]);

  useEffect(() => {
    getPost();
  }, [getPost]);

  useEffect(() => {
    if (status === "solved") {
      router.replace("/");
    }
  }, [status, router]);

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

    if (existingImages.length === 0 && newImages.length === 0) {
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

    if (status === "found") {
      setReward("");
    }

    setSubmitting(true);
    try {
      await editPost(postId, {
        author: user._id || "",
        name,
        email,
        phone,
        status,
        title,
        content,
        tags: tags.length > 0 ? tags : undefined,
        reward: reward === "" ? undefined : Number(reward),
        lastSeen: lastSeen ? new Date(lastSeen) : undefined,
        category: selectedCategory,
        location: location.name,
        locationCoordinates: {
          type: "Point" as const,
          coordinates: [location.lng, location.lat] as [number, number],
        },
        circleRadius: location.radius * 1000,
        images: newImages.length ? newImages : undefined,
        imageOperations: {
          imagesToRemove: imagesToRemove,
          replaceAllImages: false,
        },
      });
      toast.success("Postarea a fost actualizată");
      router.replace("/profile");
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

  if (authLoading || loadingData) return <Loader />;

  return (
    <section className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.userdata}>
          <h2>Date de contact</h2>
          <div className={styles.userdataform}>
            <div className={styles.inputbox}>
              <p>
                Numele complet<span className={styles.required}> *</span>
                {errors.name && (
                  <span className={`${styles.error} ${styles.info}`}>
                    {errors.name}
                  </span>
                )}
              </p>
              <label htmlFor="name" className={styles.hidden}>
                Numele complet
              </label>
              <input
                type="text"
                name="name"
                id="name"
                autoComplete="name"
                value={name}
                placeholder="Introduceți numele complet"
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
                  className={styles.clear}
                  onClick={() => !isFormDisabled && setName("")}
                  disabled={isFormDisabled}
                >
                  ✕
                </button>
              )}
            </div>
            <div className={styles.inputbox}>
              <p>
                Adresa de email<span className={styles.required}> *</span>
                {errors.email && (
                  <span className={`${styles.error} ${styles.info}`}>
                    {errors.email}
                  </span>
                )}
              </p>
              <label htmlFor="email" className={styles.hidden}>
                Adresa de email
              </label>
              <input
                type="text"
                name="email"
                id="email"
                value={email}
                placeholder="Introduceți adresa de email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError("email");
                }}
                className={errors.email ? styles.error : ""}
                autoComplete="email"
                aria-required="true"
                disabled={isFormDisabled}
              />
              {email && (
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => !isFormDisabled && setEmail("")}
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
                initialPhone={phone}
                disabled={isFormDisabled}
              />
            </div>
          </div>
        </div>

        <div className={styles.postdata}>
          <h2>Datele postării</h2>
          <div className={styles.postdataform}>
            <div className={styles.postdatabox}>
              <div className={styles.status}>
                <h3>
                  Stare<span className={styles.required}> *</span>
                </h3>
                <div className={styles.statusbuttons}>
                  <button
                    type="button"
                    className={status === "lost" ? styles.active : ""}
                    onClick={() => {
                      if (isFormDisabled) return;
                      setStatus("lost");
                      setReward("");
                    }}
                    style={{ borderRadius: "5px 0 0 5px" }}
                    disabled={isFormDisabled}
                  >
                    Pierdut
                  </button>
                  <button
                    type="button"
                    className={status === "found" ? styles.active : ""}
                    onClick={() => {
                      if (isFormDisabled) return;
                      setStatus("found");
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
                  Titlul postării<span className={styles.required}> *</span>
                  {errors.title && (
                    <span className={`${styles.error} ${styles.info}`}>
                      {errors.title}
                    </span>
                  )}
                </p>
                <label htmlFor="title" className={styles.hidden}>
                  Titlul postării
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  placeholder="Introduceți titlul (ex: Câine pierdut)"
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
                    className={styles.clear}
                    onClick={() => !isFormDisabled && setTitle("")}
                    disabled={isFormDisabled}
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className={styles.inputbox}>
                <p>
                  Conținutul postării
                  {errors.content && (
                    <span className={`${styles.error} ${styles.info}`}>
                      {errors.content}
                    </span>
                  )}{" "}
                  <span className={styles.charactercount}>
                    {content.length}/1000
                  </span>
                </p>
                <label htmlFor="content" className={styles.hidden}>
                  Conținutul postării
                </label>
                <textarea
                  value={content}
                  name="content"
                  id="content"
                  placeholder="Introduceți conținutul postării"
                  onChange={(e) => {
                    setContent(e.target.value);
                    clearError("content");
                  }}
                  className={errors.content ? styles.error : ""}
                  maxLength={1000}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
              </div>

              <div className={styles.inputbox}>
                <p>
                  Cuvinte cheie{" "}
                  <span className={styles.info}>(maximum 20)</span>
                </p>
                <label htmlFor="tags" className={styles.hidden}>
                  Cuvinte cheie
                </label>
                <div className={styles.taginputwrapper}>
                  <input
                    type="text"
                    name="tags"
                    id="tags"
                    value={tagInput}
                    placeholder="Introduceți tag-uri"
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    aria-required="true"
                    disabled={isFormDisabled}
                  />
                  {tags.map((tag, i) => (
                    <span key={i} className={styles.tag}>
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(i)}
                        disabled={isFormDisabled}
                      >
                        &#x2716;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {status === "lost" && (
                <div className={styles.inputbox}>
                  <p>
                    Recompensă <span className={styles.info}>(opțional)</span>
                    {errors.reward && (
                      <span className={`${styles.error} ${styles.info}`}>
                        {errors.reward}
                      </span>
                    )}
                  </p>
                  <label htmlFor="reward" className={styles.hidden}>
                    Recompensă
                  </label>
                  <input
                    type="text"
                    name="reward"
                    id="reward"
                    value={reward}
                    placeholder="Introduceți recompensa"
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, "");
                      setReward(onlyNums);
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
                      className={styles.clear}
                      onClick={() => !isFormDisabled && setReward("")}
                      disabled={isFormDisabled}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}

              <div className={styles.dateinputbox}>
                <p>
                  {status === "lost" ? "Ultima dată văzut/ă" : "Data găsirii"}
                </p>
                <label htmlFor="lastSeen" className={styles.hidden}>
                  Data
                </label>
                <input
                  type="date"
                  name="lastSeen"
                  id="lastSeen"
                  value={lastSeen}
                  max={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setLastSeen(e.target.value)}
                  aria-required="true"
                  disabled={isFormDisabled}
                />
              </div>

              <div className={styles.inputbox}>
                <p>
                  Imagini<span className={styles.required}> *</span>
                  {errors.images && (
                    <span className={`${styles.error} ${styles.info}`}>
                      {errors.images}
                    </span>
                  )}
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
                    name="images"
                    id="images"
                    multiple
                    accept="image/*"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    onChange={(e) => handleAddImages(e.target.files)}
                    aria-required="true"
                    disabled={isFormDisabled}
                  />
                </div>

                <div className={styles.imagepreviewwrapper}>
                  {existingImages.map((url) => (
                    <div key={url} className={styles.imagepreview}>
                      <Image
                        src={url}
                        alt="prev"
                        width={100}
                        height={100}
                        style={{ objectFit: "cover", borderRadius: 5 }}
                      />
                      <button
                        type="button"
                        className={styles.deletebutton}
                        onClick={() => handleRemoveExisting(url)}
                        disabled={isFormDisabled}
                      >
                        &#x2716;
                      </button>
                    </div>
                  ))}
                  {newImages.map((file, i) => {
                    const url = URL.createObjectURL(file);
                    return (
                      <div key={url} className={styles.imagepreview}>
                        <Image
                          src={url}
                          alt="new"
                          width={100}
                          height={100}
                          style={{ objectFit: "cover", borderRadius: 5 }}
                        />
                        <button
                          type="button"
                          className={styles.deletebutton}
                          onClick={() =>
                            setNewImages((prev) =>
                              prev.filter((_, idx) => idx !== i)
                            )
                          }
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
                  Categorie<span className={styles.required}> *</span>
                  {errors.category && (
                    <span className={`${styles.error} ${styles.info}`}>
                      {errors.category}
                    </span>
                  )}
                </p>
                <div className={styles.categoriescontainer}>
                  {categories.map((cat) => (
                    <div
                      key={cat.name}
                      className={styles.category}
                      onClick={() => {
                        if (isFormDisabled) return;
                        setSelectedCategory(cat.name);
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
                            cat.name === selectedCategory
                              ? "rgba(255,215,0,0.3)"
                              : "#fff",
                          border:
                            cat.name === selectedCategory
                              ? "2px solid gold"
                              : undefined,
                        }}
                      >
                        <div className={styles.image}>
                          <Image
                            src={cat.image}
                            alt={cat.name}
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
                              cat.name === selectedCategory
                                ? "gold"
                                : undefined,
                          }}
                        >
                          {cat.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <MapInput
                onLocationChange={handleLocationChange}
                errors={errors.location}
                clearError={clearError}
                initialLocation={location}
                disabled={isFormDisabled}
              />

              <div className={styles.submitbox}>
                <div className={styles.buttonbox}>
                  <button
                    type="button"
                    className={styles.cancelbutton}
                    onClick={() => {
                      if (isFormDisabled) return;
                      router.back();
                    }}
                  >
                    Anulează
                  </button>
                  <button
                    type="submit"
                    className={styles.submitbutton}
                    disabled={isFormDisabled}
                  >
                    {isProcessing
                      ? "Se procesează..."
                      : "Salvează modificările"}
                  </button>
                </div>
                {errors.general && (
                  <div className={styles.errorgeneral}>
                    <Image
                      src="/icons/error.svg"
                      alt="err"
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
