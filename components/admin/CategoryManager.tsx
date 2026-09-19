"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCategory,
  deleteCategory,
  updateCategory,
  uploadCategoryImage,
} from "@/actions/category";
import {
  MAX_CATEGORY_LEVEL,
  getCategoryLevel,
  getEligibleParents,
  getSubtreeHeight,
} from "@/lib/category-tree";
import { slugify } from "@/lib/slug";
import type { CategoryRow } from "@/types/admin/category";
import {
  Button,
  Chip,
  cn,
  Form,
  Input,
  Label,
  Modal,
  Surface,
  TextField,
  useOverlayState,
} from "@heroui/react";

type CategoryManagerProps = {
  categories: CategoryRow[];
};

type CategoryFormState = {
  id?: string;
  name: string;
  slug: string;
  imageUrl: string;
  imagePreview: string;
  imageFile: File | null;
  parentId: string;
  sortOrder: string;
  status: "active" | "hidden";
};

const emptyForm: CategoryFormState = {
  name: "",
  slug: "",
  imageUrl: "",
  imagePreview: "",
  imageFile: null,
  parentId: "",
  sortOrder: "0",
  status: "active",
};

function levelChipColor(depth: number) {
  if (depth === 0) {
    return "accent" as const;
  }

  if (depth === 1) {
    return "default" as const;
  }

  return "success" as const;
}

export default function CategoryManager({ categories }: CategoryManagerProps) {
  const router = useRouter();
  const modalState = useOverlayState();
  const [form, setForm] = useState<CategoryFormState>(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isEditing = Boolean(form.id);
  const descendantIds = useMemo(() => {
    if (!form.id) {
      return new Set<string>();
    }

    const ids = new Set<string>();

    function walk(parentId: string) {
      for (const category of categories) {
        if (category.parentId === parentId) {
          ids.add(category.id);
          walk(category.id);
        }
      }
    }

    walk(form.id);
    return ids;
  }, [categories, form.id]);

  const subtreeHeight = form.id ? getSubtreeHeight(categories, form.id) : 0;
  const parentOptions = getEligibleParents(categories, {
    movingId: form.id,
    descendantIds,
    subtreeHeight,
  });
  const selectedParent = categories.find((category) => category.id === form.parentId);
  const formLevel = selectedParent ? getCategoryLevel(selectedParent.depth + 1) : 1;

  function openCreate(parent?: CategoryRow) {
    if (parent && parent.depth >= MAX_CATEGORY_LEVEL - 1) {
      window.alert("Danh mục cấp 3 không thể có danh mục con.");
      return;
    }

    setForm({
      ...emptyForm,
      parentId: parent?.id ?? "",
    });
    setError("");
    modalState.open();
  }

  function openEdit(category: CategoryRow) {
    setForm({
      id: category.id,
      name: category.name,
      slug: category.slug,
      imageUrl: category.imageUrl ?? "",
      imagePreview: category.imageUrl ?? "",
      imageFile: null,
      parentId: category.parentId ?? "",
      sortOrder: String(category.sortOrder),
      status: category.status === "hidden" ? "hidden" : "active",
    });
    setError("");
    modalState.open();
  }

  function handleNameChange(name: string) {
    setForm((current) => ({
      ...current,
      name,
      slug: current.id ? current.slug : slugify(name),
    }));
  }

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setForm((current) => ({
      ...current,
      imageFile: file,
      imagePreview: URL.createObjectURL(file),
    }));
  }

  function clearImage() {
    setForm((current) => ({
      ...current,
      imageUrl: "",
      imagePreview: "",
      imageFile: null,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      let imageUrl = form.imageUrl || null;

      if (form.imageFile) {
        const imageData = new FormData();
        imageData.set("file", form.imageFile);
        const uploaded = await uploadCategoryImage(imageData);

        if (uploaded.error || !uploaded.url) {
          setError(uploaded.error || "Không thể tải ảnh lên Cloudinary.");
          return;
        }

        imageUrl = uploaded.url;
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        imageUrl,
        parentId: form.parentId || null,
        sortOrder: Number(form.sortOrder),
        status: form.status,
      };

      const result = form.id
        ? await updateCategory({ id: form.id, ...payload })
        : await createCategory(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      modalState.close();
      router.refresh();
    } catch {
      setError("Không thể lưu danh mục. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(category: CategoryRow) {
    if (category.childCount > 0) {
      window.alert("Hãy xóa danh mục con trước khi xóa danh mục này.");
      return;
    }

    const confirmed = window.confirm(`Xóa danh mục "${category.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(category.id);

    try {
      const result = await deleteCategory(category.id);

      if (result.error) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    } catch {
      window.alert("Không thể xóa danh mục. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold not-italic">Quản lý danh mục</h1>
          <p className="mt-1 text-sm text-muted">
            CRUD 3 cấp: danh mục gốc, danh mục con và danh mục cháu. Cấp 3 không
            có danh mục con.
          </p>
        </div>
        <Button variant="primary" onPress={() => openCreate()}>
          Thêm danh mục
        </Button>
      </div>

      <Surface className="overflow-hidden rounded-2xl border border-separator">
        {categories.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Chưa có danh mục. Bấm &quot;Thêm danh mục&quot; để tạo mục cấp 1.
          </p>
        ) : (
          <div className="divide-y divide-separator">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div
                  className={cn(
                    "min-w-0",
                    category.depth === 1 && "pl-6 sm:pl-8",
                    category.depth >= 2 && "pl-10 sm:pl-16",
                  )}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="h-10 w-10 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-default-100 text-xs text-muted">
                        —
                      </span>
                    )}
                    {category.depth > 0 ? (
                      <span className="text-muted">—</span>
                    ) : null}
                    <span
                      className={cn(
                        "not-italic",
                        category.depth === 0 ? "font-medium" : "",
                      )}
                    >
                      {category.name}
                    </span>
                    <Chip size="sm" color={levelChipColor(category.depth)}>
                      Cấp {getCategoryLevel(category.depth)}
                    </Chip>
                    <Chip
                      size="sm"
                      color={category.status === "active" ? "success" : "default"}
                    >
                      {category.status === "active" ? "Hiển thị" : "Ẩn"}
                    </Chip>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    /{category.slug}
                    {category.parentName ? ` · Cha: ${category.parentName}` : " · Danh mục gốc"}
                    {` · Thứ tự ${category.sortOrder}`}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  {category.depth < MAX_CATEGORY_LEVEL - 1 ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onPress={() => openCreate(category)}
                    >
                      Thêm con
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onPress={() => openEdit(category)}
                  >
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isDisabled={deletingId === category.id}
                    onPress={() => handleDelete(category)}
                  >
                    {deletingId === category.id ? "Đang xóa..." : "Xóa"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>
                  {isEditing
                    ? "Sửa danh mục"
                    : selectedParent
                      ? `Thêm danh mục con của ${selectedParent.name}`
                      : "Thêm danh mục cấp 1"}
                </Modal.Heading>
              </Modal.Header>
              <Form className="contents" onSubmit={handleSubmit}>
                <Modal.Body className="flex flex-col gap-4">
                  <TextField
                    isRequired
                    name="name"
                    value={form.name}
                    onChange={handleNameChange}
                    fullWidth
                  >
                    <Label>Tên danh mục</Label>
                    <Input placeholder="Áo khoác nam" />
                  </TextField>

                  <TextField
                    isRequired
                    name="slug"
                    value={form.slug}
                    onChange={(slug) => setForm((current) => ({ ...current, slug }))}
                    fullWidth
                  >
                    <Label>Slug</Label>
                    <Input placeholder="ao-khoac-nam" />
                  </TextField>

                  <div className="flex flex-col gap-1.5 text-sm">
                    <span>Hình ảnh</span>
                    {form.imagePreview ? (
                      <img
                        src={form.imagePreview}
                        alt=""
                        className="h-24 w-24 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-24 w-24 items-center justify-center rounded-xl border border-dashed border-separator text-xs text-muted">
                        Chưa có ảnh
                      </span>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-separator px-3 py-2 text-sm not-italic hover:bg-default-100/60">
                        Chọn ảnh
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                      {form.imagePreview ? (
                        <Button size="sm" variant="outline" onPress={clearImage}>
                          Xóa ảnh
                        </Button>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted">
                      Ảnh sẽ được tải lên Cloudinary, database chỉ lưu link.
                    </span>
                  </div>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Danh mục cha</span>
                    <select
                      name="parentId"
                      value={form.parentId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          parentId: event.target.value,
                        }))
                      }
                      className="h-10 rounded-xl border border-separator bg-background px-3 not-italic"
                    >
                      <option value="">Không (cấp 1)</option>
                      {parentOptions.map((category) => (
                        <option key={category.id} value={category.id}>
                          {"— ".repeat(category.depth)}
                          {category.name} — cấp {getCategoryLevel(category.depth)}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-muted">
                      Đang tạo/sửa danh mục cấp {formLevel}. Chỉ chọn cha cấp 1
                      hoặc cấp 2.
                    </span>
                  </label>

                  <TextField
                    name="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={(sortOrder) =>
                      setForm((current) => ({ ...current, sortOrder }))
                    }
                    fullWidth
                  >
                    <Label>Thứ tự</Label>
                    <Input min={0} />
                  </TextField>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Trạng thái</span>
                    <select
                      name="status"
                      value={form.status}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          status: event.target.value === "hidden" ? "hidden" : "active",
                        }))
                      }
                      className="h-10 rounded-xl border border-separator bg-background px-3 not-italic"
                    >
                      <option value="active">Hiển thị</option>
                      <option value="hidden">Ẩn</option>
                    </select>
                  </label>

                  {error ? (
                    <p role="alert" className="text-sm text-danger">
                      {error}
                    </p>
                  ) : null}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="outline" onPress={modalState.close}>
                    Hủy
                  </Button>
                  <Button type="submit" variant="primary" isDisabled={isSaving}>
                    {isSaving ? "Đang lưu..." : "Lưu"}
                  </Button>
                </Modal.Footer>
              </Form>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </div>
  );
}
