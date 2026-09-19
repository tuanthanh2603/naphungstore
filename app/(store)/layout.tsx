import Header from "@/components/layout/Header";
import { toHeaderCategoryColumns } from "@/lib/category-tree";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const categories = await prisma.tblCategory.findMany({
    where: { status: "active" },
    select: {
      id: true,
      name: true,
      slug: true,
      imageUrl: true,
      parentId: true,
      sortOrder: true,
      status: true,
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <>
      <Header categories={toHeaderCategoryColumns(categories)} />
      {children}
    </>
  );
}
