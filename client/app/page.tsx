import styles from "./page.module.scss";
import Hero from "./components/Hero/Hero";
import Categories from "./components/Categories/Categories";

export default function Home() {
  return (
    <main className={styles.home}>
      <Hero />
      <Categories />
    </main>
  );
}
