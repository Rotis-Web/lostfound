import styles from "./Loader.module.scss";
import Image from "next/image";

export default function Loader() {
  return (
    <div className={styles.loader}>
      <Image
        src="/gifs/loading.gif"
        alt="Loader Gif"
        width={200}
        height={200}
        unoptimized
        draggable={false}
      />
      <p>Se încarcă...</p>
    </div>
  );
}
