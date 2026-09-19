export type HeaderCategoryChild = {
  id: string;
  label: string;
  href: string;
};

export type HeaderCategoryItem = {
  id: string;
  label: string;
  href: string;
  imageUrl: string | null;
  children: HeaderCategoryChild[];
};

export type HeaderCategoryColumn = {
  id: string;
  title: string;
  href: string;
  items: HeaderCategoryItem[];
};
