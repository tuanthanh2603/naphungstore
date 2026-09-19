import Footer from "@/components/layout/Footer";
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
    <div className="store-shell light flex min-h-full flex-1 flex-col">
      <Header categories={toHeaderCategoryColumns(categories)} />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
