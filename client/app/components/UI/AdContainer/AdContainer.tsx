import styles from "./AdContainer.module.scss";
import Image from "next/image";

export default function AdContainer() {
  return (
    <div className={styles.adcontainer}>
      <Image
        src="/images/publicitate.png"
        alt="Publicitate"
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
