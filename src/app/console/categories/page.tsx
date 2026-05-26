import { CategoryTree } from "@/features/product_information_management/categories/components/category-tree";

export default function CategoriesPage() {
  return (
    <div className="grid gap-6 p-6 lg:grid-cols-[320px_1fr]">
      <CategoryTree />
      {/* <CategoryTable /> */}
    </div>
  );
}
