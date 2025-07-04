import styles from "./Categories.module.scss";
import Image from "next/image";
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
  return (
    <section className={styles.categories}>
      <h2>Categorii</h2>
      <div className={styles.categoriescontainer}>
        {categories.map((category) => (
          <div className={styles.category} key={category.name}>
            <div className={styles.imagecontainer}>
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
              <p>{category.name}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
