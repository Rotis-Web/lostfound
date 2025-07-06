import styles from "./page.module.scss";
import EditPostForm from "../../components/Forms/EditPostForm/EditPostForm";
export default async function EditPostPage() {
  return (
    <main className={styles.editpost}>
      <EditPostForm />
    </main>
  );
}
