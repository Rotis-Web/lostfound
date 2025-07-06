import dynamic from "next/dynamic";

const Loader = dynamic(() => import("@/app/components/Layout/Loader/Loader"));
export default function Loading() {
  return <Loader />;
}
