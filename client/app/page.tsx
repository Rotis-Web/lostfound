import styles from "./page.module.scss";
import Hero from "./components/Hero/Hero";

export default function Home() {
  return (
    <div className={styles.home}>
      <Hero />
    </div>
  );
}
