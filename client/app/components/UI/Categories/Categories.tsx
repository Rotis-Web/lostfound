import styles from "./Categories.module.scss";
import Image from "next/image";
import Link from "next/link";

export const categories = [
  {
    name: "Animale",
    image: "/icons/pets.svg",
  },
  {
    name: "Bijuterii",
    image: "/icons/jewelry.svg",
  },
  {
    name: "Documente",
    image: "/icons/id.svg",
  },
  {
    name: "Jucării",
    image: "/icons/toys.svg",
  },
  {
    name: "Chei",
    image: "/icons/keys.svg",
  },
  {
    name: "Electronice",
    image: "/icons/electronics.svg",
  },
  {
    name: "Carduri",
    image: "/icons/cards.svg",
  },
  {
    name: "Portofele",
    image: "/icons/wallet.svg",
  },
  {
    name: "Haine",
    image: "/icons/clothes.svg",
  },
  // {
  //   name: "Ochelari",
  //   image: "/icons/glasses.svg",
  // },
  // {
  //   name: "Ceasuri",
  //   image: "/icons/watch.svg",
  // },
  {
    name: "Altele",
    image: "/icons/other.svg",
  },
];
export default function Categories() {
  const normalizeCategoryName = (name: string) =>
    name.toLowerCase().replace(" ", "-");
  return (
    <section className={styles.categories}>
      <h2>Categorii</h2>
      <div className={styles.categoriescontainer}>
        {categories.map((category) => (
          <Link
            href={`/${normalizeCategoryName(category.name)}/search`}
            className={styles.category}
            key={category.name}
          >
            <div className={styles.imagecontainer}>
              <div className={styles.image}>
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  draggable={false}
                />
              </div>
            </div>
            <div className={styles.text}>
              <p>{category.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
