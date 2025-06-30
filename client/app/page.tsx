import styles from "./page.module.scss";
import Hero from "./components/HomePage/Hero/Hero";
import Categories from "./components/HomePage/Categories/Categories";
import Section1 from "./components/HomePage/Section1/Section1";
import AnunturiPromovate from "./components/HomePage/AnunturiPromovate/AnunturiPromovate";
import JoinCrew from "./components/HomePage/JoinCrew/JoinCrew";

export default function Home() {
  return (
    <main className={styles.home}>
      <Hero />
      <Categories />
      <Section1 />
      <AnunturiPromovate />
      <JoinCrew />
    </main>
  );
}
