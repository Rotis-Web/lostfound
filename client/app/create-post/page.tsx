import styles from "./page.module.scss";
import CreatePostForm from "../components/Forms/CreatePostForm/CreatePostForm";
export default function CreatePostPage() {
  return (
    <main className={styles.createpost}>
      <CreatePostForm />
    </main>
  );
}
