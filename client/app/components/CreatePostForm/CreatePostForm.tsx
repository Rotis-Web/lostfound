"use client";

import styles from "./CreatePostForm.module.scss";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import Image from "next/image";
import Loader from "../Loader/Loader";
import { categories } from "../Categories/Categories";
import dynamic from "next/dynamic";
const MapInput = dynamic(() => import("../MapInput/MapInput"), { ssr: false });

interface LocationData {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

export default function CreatePostForm() {
  const { user, loading } = useAuth();

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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleLocationChange = (locationData: LocationData | null) => {
    setLocation(locationData);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    setTags((prev) => prev.filter((_, i) => i !== index));
  };

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (loading) return <Loader />;

  return (
    <section className={styles.container}>
      {user && (
        <div className={styles.userdata}>
          <h2>Datele dumneavoastră</h2>
          <div className={styles.userdataform}>
            <div className={styles.inputbox}>
              <p>
                Numele complet<span className={styles.required}> *</span>
              </p>
              <input
                type="text"
                placeholder="Introduceți numele complet"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              {name && (
                <button onClick={() => setName("")} className={styles.clear}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.inputbox}>
              <p>
                Adresa de email<span className={styles.required}> *</span>
              </p>
              <input
                type="text"
                placeholder="Introduceți adresa de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />{" "}
              {email && (
                <button onClick={() => setEmail("")} className={styles.clear}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.inputbox}>
              <p>
                Numărul de telefon<span className={styles.required}> *</span>
              </p>
              <input
                type="text"
                placeholder="Introduceți numărul de telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              {phone && (
                <button onClick={() => setPhone("")} className={styles.clear}>
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      <div className={styles.postdata}>
        <h2>Datele postării</h2>
        <div className={styles.postdataform}>
          <div className={styles.postdatabox}>
            <div className={styles.status}>
              <h3>Stare</h3>
              <div className={styles.statusbuttons}>
                <button
                  className={`${status === "pierdut" && styles.active}`}
                  onClick={() => setStatus("pierdut")}
                  style={{ borderRadius: "5px 0 0 5px" }}
                >
                  Pierdut
                </button>
                <button
                  className={`${status === "gasit" && styles.active}`}
                  onClick={() => setStatus("gasit")}
                  style={{ borderRadius: "0 5px 5px 0" }}
                >
                  Găsit
                </button>
              </div>
            </div>
            <div className={styles.inputbox}>
              <p>
                Titlul postării<span className={styles.required}> *</span>
              </p>
              <input
                type="text"
                placeholder="Introduceți titlul postării ( ex: Câine pierdut ) "
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
              />
              {title && (
                <button onClick={() => setTitle("")} className={styles.clear}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.inputbox}>
              <p>Descrierea postării</p>
              <textarea
                placeholder="Introduceți descrierea postării ( ex: Câinele răspunde la numele Rocky și este foarte prietenos )"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
              />
            </div>
            <div className={styles.inputbox}>
              <p>
                Cuvinte cheie
                <span className={styles.info}>( maximum 20 )</span>
              </p>
              <div className={styles.taginputwrapper}>
                <input
                  type="text"
                  placeholder="Introduceți cuvinte cheie separate prin spații"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                />
                {tags.map((tag, index) => (
                  <span key={index} className={styles.tag}>
                    {tag}
                    <button onClick={() => removeTag(index)}>&#x2716;</button>
                  </span>
                ))}
              </div>
            </div>
            <div className={styles.inputbox}>
              <p>
                Recompensă<span className={styles.info}> ( opțional )</span>
              </p>
              <input
                type="text"
                placeholder="Introduceți recompensa ( ex: 100 RON )"
                value={reward}
                onChange={(e) => {
                  setReward(e.target.value);
                }}
              />
              {title && (
                <button onClick={() => setTitle("")} className={styles.clear}>
                  ✕
                </button>
              )}
            </div>
            <div className={styles.dateinputbox}>
              <p>
                {status === "pierdut" ? "Ultima dată văzut" : "Data găsirii"}
              </p>
              <input
                type="date"
                value={lastSeen}
                onChange={(e) => setLastSeen(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                className={styles.dateinput}
              />
            </div>
            <div className={styles.inputbox}>
              <p>
                Imagini
                <span className={styles.required}> *</span>
                <span className={styles.info}>
                  ( maximum 5, fiecare de cel mult 5MB )
                </span>
              </p>
              <div className={styles.imageuploadbox}>
                <button
                  className={styles.uploadbutton}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Adaugă imagini <span>+</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={(e) => {
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
                    }
                    e.target.value = "";
                  }}
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
                        onClick={() =>
                          setImages((prev) =>
                            prev.filter((_, i) => i !== index)
                          )
                        }
                        className={styles.deletebutton}
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
              </p>
              <div className={styles.categoriescontainer}>
                {categories.map((category) => (
                  <div
                    className={styles.category}
                    key={category.name}
                    onClick={() => setSelectedCategory(category.name)}
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
            <MapInput onLocationChange={handleLocationChange} />
          </div>
        </div>
      </div>
    </section>
  );
}
