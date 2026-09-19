"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createCarouselSlide,
  deleteCarouselSlide,
  updateCarouselSlide,
  uploadCarouselImage,
} from "@/actions/carousel";
import { CAROUSEL_IMAGE, carouselAspectClassName } from "@/lib/carousel";
import type { CarouselRecord } from "@/types/admin/carousel";
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

type CarouselFormState = {
  id?: string;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  cta: string;
  imageUrl: string;
  imagePreview: string;
  imageFile: File | null;
  sortOrder: string;
  status: "active" | "hidden";
};

const emptyForm: CarouselFormState = {
  title: "",
  eyebrow: "",
  description: "",
  href: "#san-pham",
  cta: "Xem sản phẩm",
  imageUrl: "",
  imagePreview: "",
  imageFile: null,
  sortOrder: "0",
  status: "active",
};

function readImageSize(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Không đọc được kích thước ảnh."));
    };

    image.src = url;
  });
}

export default function CarouselManager({
  slides,
}: {
  slides: CarouselRecord[];
}) {
  const router = useRouter();
  const modalState = useOverlayState();
  const [form, setForm] = useState<CarouselFormState>(emptyForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const isEditing = Boolean(form.id);

  function openCreate() {
    setForm({
      ...emptyForm,
      sortOrder: String(slides.length),
    });
    setError("");
    modalState.open();
  }

  function openEdit(slide: CarouselRecord) {
    setForm({
      id: slide.id,
      title: slide.title,
      eyebrow: slide.eyebrow ?? "",
      description: slide.description ?? "",
      href: slide.href,
      cta: slide.cta,
      imageUrl: slide.imageUrl,
      imagePreview: slide.imageUrl,
      imageFile: null,
      sortOrder: String(slide.sortOrder),
      status: slide.status === "hidden" ? "hidden" : "active",
    });
    setError("");
    modalState.open();
  }

  async function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const size = await readImageSize(file);

      if (size.width < CAROUSEL_IMAGE.minWidth || size.height < CAROUSEL_IMAGE.minHeight) {
        setError(
          `Ảnh tối thiểu ${CAROUSEL_IMAGE.minWidth}×${CAROUSEL_IMAGE.minHeight}px để vừa carousel homepage.`,
        );
        return;
      }

      setError("");
      setForm((current) => ({
        ...current,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
    } catch {
      setError("Không đọc được ảnh. Hãy chọn file JPG, PNG, WEBP hoặc GIF.");
    }
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
      let imageUrl = form.imageUrl;

      if (form.imageFile) {
        const payload = new FormData();
        payload.set("file", form.imageFile);
        const upload = await uploadCarouselImage(payload);

        if (upload.error || !upload.url) {
          setError(upload.error ?? "Không thể tải ảnh lên.");
          return;
        }

        imageUrl = upload.url;
      }

      if (!imageUrl) {
        setError("Vui lòng chọn ảnh carousel.");
        return;
      }

      const payload = {
        title: form.title,
        eyebrow: form.eyebrow,
        description: form.description,
        href: form.href,
        cta: form.cta,
        imageUrl,
        sortOrder: Number(form.sortOrder),
        status: form.status,
      };

      const result = form.id
        ? await updateCarouselSlide({ id: form.id, ...payload })
        : await createCarouselSlide(payload);

      if (result.error) {
        setError(result.error);
        return;
      }

      modalState.close();
      router.refresh();
    } catch {
      setError("Không thể lưu slide. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(slide: CarouselRecord) {
    const confirmed = window.confirm(`Xóa slide "${slide.title}"?`);

    if (!confirmed) {
      return;
    }

    setDeletingId(slide.id);

    try {
      const result = await deleteCarouselSlide(slide.id);

      if (result.error) {
        window.alert(result.error);
        return;
      }

      router.refresh();
    } catch {
      window.alert("Không thể xóa slide. Vui lòng thử lại.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold not-italic">Carousel trang chủ</h1>
          <p className="mt-1 text-sm text-muted">
            Ảnh được cắt về {CAROUSEL_IMAGE.width}×{CAROUSEL_IMAGE.height}px (12:5), khớp khung
            carousel desktop chiếm 70% màn hình.
          </p>
        </div>
        <Button variant="primary" onPress={openCreate}>
          Thêm slide
        </Button>
      </div>

      <Surface className="overflow-hidden rounded-2xl border border-separator">
        {slides.length === 0 ? (
          <p className="p-6 text-sm text-muted">
            Chưa có slide. Homepage sẽ tạm dùng ảnh danh mục cho đến khi bạn thêm slide tại đây.
          </p>
        ) : (
          <div className="divide-y divide-separator">
            {slides.map((slide) => (
              <div
                key={slide.id}
                className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <img
                    src={slide.imageUrl}
                    alt={slide.title}
                    className="h-16 w-[9.6rem] rounded-lg object-cover"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium not-italic">{slide.title}</span>
                      <Chip
                        size="sm"
                        color={slide.status === "active" ? "success" : "default"}
                      >
                        {slide.status === "active" ? "Hiển thị" : "Ẩn"}
                      </Chip>
                    </div>
                    <p className="mt-1 truncate text-xs text-muted">
                      {slide.href} · Thứ tự {slide.sortOrder}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button size="sm" variant="outline" onPress={() => openEdit(slide)}>
                    Sửa
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    isDisabled={deletingId === slide.id}
                    onPress={() => handleDelete(slide)}
                  >
                    {deletingId === slide.id ? "Đang xóa..." : "Xóa"}
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
                <Modal.Heading>{isEditing ? "Sửa slide" : "Thêm slide"}</Modal.Heading>
              </Modal.Header>
              <Form className="contents" onSubmit={handleSubmit}>
                <Modal.Body className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5 text-sm">
                    <span>Ảnh carousel</span>
                    <div
                      className={`${carouselAspectClassName()} overflow-hidden rounded-xl border border-separator bg-default-100`}
                    >
                      {form.imagePreview ? (
                        <img
                          src={form.imagePreview}
                          alt=""
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-xs text-muted">
                          Khung xem trước {CAROUSEL_IMAGE.width}×{CAROUSEL_IMAGE.height}
                        </div>
                      )}
                    </div>
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
                      Nên dùng ảnh ngang tối thiểu {CAROUSEL_IMAGE.minWidth}×
                      {CAROUSEL_IMAGE.minHeight}px. Hệ thống sẽ crop giữa về{" "}
                      {CAROUSEL_IMAGE.width}×{CAROUSEL_IMAGE.height}px, object-cover trên homepage.
                    </span>
                  </div>

                  <TextField
                    isRequired
                    name="title"
                    value={form.title}
                    onChange={(title) => setForm((current) => ({ ...current, title }))}
                    fullWidth
                  >
                    <Label>Tiêu đề</Label>
                    <Input placeholder="NAM" />
                  </TextField>

                  <TextField
                    name="eyebrow"
                    value={form.eyebrow}
                    onChange={(eyebrow) => setForm((current) => ({ ...current, eyebrow }))}
                    fullWidth
                  >
                    <Label>Nhãn nhỏ</Label>
                    <Input placeholder="01 / Cửa hàng" />
                  </TextField>

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
                      placeholder="Xem sản phẩm và chọn món phù hợp."
                    />
                  </label>

                  <TextField
                    name="href"
                    value={form.href}
                    onChange={(href) => setForm((current) => ({ ...current, href }))}
                    fullWidth
                  >
                    <Label>Liên kết</Label>
                    <Input placeholder="/danh-muc/nam" />
                  </TextField>

                  <TextField
                    name="cta"
                    value={form.cta}
                    onChange={(cta) => setForm((current) => ({ ...current, cta }))}
                    fullWidth
                  >
                    <Label>Nút bấm</Label>
                    <Input placeholder="Xem sản phẩm" />
                  </TextField>

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
