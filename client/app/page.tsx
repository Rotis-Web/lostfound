import styles from "./page.module.scss";
import dynamic from "next/dynamic";
import Hero from "./components/HomePage/Hero/Hero";

const Categories = dynamic(
  () => import("./components/UI/Categories/Categories")
);
const Section1 = dynamic(
  () => import("./components/HomePage/Section1/Section1")
);
const AnunturiPromovate = dynamic(
  () => import("./components/HomePage/AnunturiPromovate/AnunturiPromovate")
);
const JoinCrew = dynamic(
  () => import("./components/HomePage/JoinCrew/JoinCrew")
);
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
