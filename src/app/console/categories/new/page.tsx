import { redirect } from "next/navigation";

export const metadata = { title: "Nouvelle catégorie" };

export default function NewCategoryPage() {
  redirect("/console/categories");
}
