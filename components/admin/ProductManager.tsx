"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  uploadProductImage,
} from "@/actions/product";
import { formatVnd } from "@/lib/money";
import { PRODUCT_IMAGE } from "@/lib/product";
import { slugify } from "@/lib/slug";
import type { ProductCategoryOption, ProductRecord } from "@/types/admin/product";
import {
  Button,
  Chip,
  Form,
  Input,
  Label,
  Modal,
  Surface,
  TextField,
  useOverlayState,
} from "@heroui/react";

type ProductImageDraft = {
  key: string;
  url: string;
  preview: string;
  file: File | null;
};

type ProductFormState = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  images: ProductImageDraft[];
  categoryId: string;
  sortOrder: string;
  featured: boolean;
  status: "active" | "hidden";
};

const emptyForm: ProductFormState = {
  name: "",
  slug: "",
  description: "",
  price: "",
  images: [],
  categoryId: "",
  sortOrder: "0",
  featured: false,
  status: "active",
};

function createImageDraft(url: string): ProductImageDraft {
  return {
    key: url,
    url,
    preview: url,
    file: null,
  };
}

export default function ProductManager({
  products,
  categories,
}: {
  products: ProductRecord[];
  categories: ProductCategoryOption[];
}) {
  const router = useRouter();
  const modalState = useOverlayState();
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isEditing = Boolean(form.id);

  function openCreate() {
    setForm({
      ...emptyForm,
      sortOrder: String(products.length),
    });
    setError("");
    modalState.open();
  }

  function openEdit(product: ProductRecord) {
    setForm({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description ?? "",
      price: String(product.price),
      images: product.imageUrls.map(createImageDraft),
      categoryId: product.categoryId ?? "",
      sortOrder: String(product.sortOrder),
      featured: product.featured,
      status: product.status === "hidden" ? "hidden" : "active",
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
    const files = [...(event.target.files ?? [])];
    event.target.value = "";

    if (files.length === 0) {
      return;
    }

    const oversized = files.find((file) => file.size > PRODUCT_IMAGE.maxBytes);

    if (oversized) {
      setError("Ảnh sản phẩm không quá 5MB.");
      return;
    }

    setForm((current) => {
      const remaining = PRODUCT_IMAGE.maxCount - current.images.length;
      const nextFiles = files.slice(0, remaining);

      if (nextFiles.length === 0) {
        setError(`Mỗi sản phẩm tối đa ${PRODUCT_IMAGE.maxCount} ảnh.`);
        return current;
      }

      setError("");
      return {
        ...current,
        images: [
          ...current.images,
          ...nextFiles.map((file) => ({
            key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
            url: "",
            preview: URL.createObjectURL(file),
            file,
          })),
        ],
      };
    });
  }

  function removeImage(key: string) {
    setForm((current) => ({
      ...current,
      images: current.images.filter((image) => image.key !== key),
    }));
  }

  function setCover(key: string) {
    setForm((current) => {
      const selected = current.images.find((image) => image.key === key);

      if (!selected) {
        return current;
      }

      return {
        ...current,
        images: [selected, ...current.images.filter((image) => image.key !== key)],
      };
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      const imageUrls: string[] = [];

      for (const image of form.images) {
        if (image.file) {
          const payload = new FormData();
          payload.set("file", image.file);
          const upload = await uploadProductImage(payload);

          if (upload.error || !upload.url) {
            setError(upload.error ?? "Không thể tải ảnh lên.");
            return;
          }

          imageUrls.push(upload.url);
          continue;
        }

        if (image.url) {
          imageUrls.push(image.url);
        }
      }

      const payload = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        price: form.price,
        imageUrls,
        categoryId: form.categoryId,
        sortOrder: Number(form.sortOrder),
        featured: form.featured,
        status: form.status,
      };

      const result = form.id
        ? await updateProduct({ id: form.id, ...payload })
        : await createProduct(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      modalState.close();
      router.refresh();
    } catch {
      setError("Không thể lưu sản phẩm. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(product: ProductRecord) {
    const confirmed = window.confirm(`Xóa sản phẩm "${product.name}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(product.id);

    try {
      const result = await deleteProduct(product.id);

      if (result.error) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    } catch {
      window.alert("Không thể xóa sản phẩm. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold not-italic">Quản lý sản phẩm</h1>
          <p className="mt-1 text-sm text-muted">
            Mỗi sản phẩm tối đa {PRODUCT_IMAGE.maxCount} ảnh, mỗi ảnh không quá
            5MB, lưu trong project (`/uploads/products`). Ảnh đầu tiên là ảnh đại diện.
          </p>
        </div>
        <Button variant="primary" onPress={openCreate}>
          Thêm sản phẩm
        </Button>
      </div>

      <Surface className="overflow-hidden rounded-2xl border border-separator">
        {products.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Chưa có sản phẩm. Thêm món hàng để hiện trên trang chủ và trang danh mục.
          </p>
        ) : (
          <div className="divide-y divide-separator">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="size-14 rounded-lg object-cover"
                    />
                  ) : (
                    <span className="flex size-14 items-center justify-center rounded-lg bg-default-100 text-xs text-muted">
                      —
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium not-italic">{product.name}</span>
                      <Chip
                        size="sm"
                        color={product.status === "active" ? "success" : "default"}
                      >
                        {product.status === "active" ? "Hiển thị" : "Ẩn"}
                      </Chip>
                      {product.featured ? (
                        <Chip size="sm" color="accent">
                          Nổi bật
                        </Chip>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted">
                      {formatVnd(product.price)}
                      {product.categoryName ? ` · ${product.categoryName}` : ""}
                      {` · ${product.imageUrls.length} ảnh`}
                      {` · Thứ tự ${product.sortOrder}`}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" onPress={() => openEdit(product)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isDisabled={deletingId === product.id}
                    onPress={() => handleDelete(product)}
                  >
                    {deletingId === product.id ? "Đang xóa..." : "Xóa"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Surface>

      <Modal state={modalState}>
        <Modal.Backdrop isDismissable>
          <Modal.Container size="lg">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>{isEditing ? "Sửa sản phẩm" : "Thêm sản phẩm"}</Modal.Heading>
              </Modal.Header>
              <Form className="contents" onSubmit={handleSubmit}>
                <Modal.Body className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span>Ảnh sản phẩm</span>
                    {form.images.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {form.images.map((image, index) => (
                          <div
                            key={image.key}
                            className="relative overflow-hidden rounded-xl border border-separator bg-default-100"
                          >
                            <img
                              src={image.preview}
                              alt=""
                              className="aspect-square size-full object-cover"
                            />
                            {index === 0 ? (
                              <span className="absolute left-1 top-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                                Ảnh bìa
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => setCover(image.key)}
                                className="absolute left-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                              >
                                Làm ảnh bìa
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(image.key)}
                              className="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white"
                            >
                              Xóa
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex h-24 items-center justify-center rounded-xl border border-dashed border-separator text-xs text-muted">
                        Chưa có ảnh. Có thể chọn nhiều ảnh cùng lúc.
                      </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center rounded-xl border border-separator px-3 py-2 text-sm not-italic hover:bg-default-100/60">
                        Thêm ảnh
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          multiple
                          className="sr-only"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                    <span className="text-xs text-muted">
                      {form.images.length}/{PRODUCT_IMAGE.maxCount} ảnh, mỗi ảnh
                      không quá 5MB. Ảnh đầu tiên hiện trên lưới cửa hàng.
                    </span>
                  </div>

                  <TextField
                    isRequired
                    name="name"
                    value={form.name}
                    onChange={handleNameChange}
                    fullWidth
                  >
                    <Label>Tên sản phẩm</Label>
                    <Input placeholder="Áo khoác gió" />
                  </TextField>

                  <TextField
                    isRequired
                    name="slug"
                    value={form.slug}
                    onChange={(slug) => setForm((current) => ({ ...current, slug }))}
                    fullWidth
                  >
                    <Label>Slug</Label>
                    <Input placeholder="ao-khoac-gio" />
                  </TextField>

                  <TextField
                    isRequired
                    name="price"
                    value={form.price}
                    onChange={(price) => setForm((current) => ({ ...current, price }))}
                    fullWidth
                  >
                    <Label>Giá (VND)</Label>
                    <Input type="number" min={0} placeholder="350000" />
                  </TextField>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Danh mục</span>
                    <select
                      name="categoryId"
                      value={form.categoryId}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          categoryId: event.target.value,
                        }))
                      }
                      className="h-10 rounded-xl border border-separator bg-background px-3 not-italic"
                    >
                      <option value="">Không chọn</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.path}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="flex flex-col gap-1.5 text-sm">
                    <span>Mô tả</span>
                    <textarea
                      name="description"
                      value={form.description}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                      rows={3}
                      className="rounded-xl border border-separator bg-background px-3 py-2 not-italic"
                      placeholder="Thông tin ngắn để khách chọn sản phẩm."
                    />
                  </label>

                  <TextField
                    name="sortOrder"
                    type="number"
                    value={form.sortOrder}
                    onChange={(sortOrder) => setForm((current) => ({ ...current, sortOrder }))}
                    fullWidth
                  >
                    <Label>Thứ tự</Label>
                    <Input min={0} />
                  </TextField>

                  <label className="flex items-center gap-2 text-sm not-italic">
                    <input
                      type="checkbox"
                      checked={form.featured}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          featured: event.target.checked,
                        }))
                      }
                    />
                    Hiện nổi bật trên trang chủ
                  </label>

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
