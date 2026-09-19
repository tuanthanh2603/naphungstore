import "server-only";

import { randomUUID } from "crypto";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";
import { PRODUCT_IMAGE } from "@/lib/product";

const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};
export const PRODUCT_UPLOAD_DIR = "uploads/products";

export function isLocalProductImage(url: string) {
  return url.startsWith(`/${PRODUCT_UPLOAD_DIR}/`);
}

function localProductImagePath(url: string) {
  const filename = path.basename(url);

  if (!filename || filename !== url.replace(`/${PRODUCT_UPLOAD_DIR}/`, "")) {
    return null;
  }

  return path.join(process.cwd(), "public", PRODUCT_UPLOAD_DIR, filename);
}

export async function saveProductImageFile(file: File) {
  const extension = ALLOWED_TYPES[file.type];

  if (!extension) {
    return { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF." };
  }

  if (file.size > PRODUCT_IMAGE.maxBytes) {
    return { error: "Ảnh sản phẩm không quá 5MB." };
  }

  const directory = path.join(process.cwd(), "public", PRODUCT_UPLOAD_DIR);
  await mkdir(directory, { recursive: true });

  const filename = `${Date.now()}-${randomUUID()}.${extension}`;
  await writeFile(path.join(directory, filename), Buffer.from(await file.arrayBuffer()));

  return { url: `/${PRODUCT_UPLOAD_DIR}/${filename}` };
}

export async function deleteLocalProductImage(url: string) {
  if (!isLocalProductImage(url)) {
    return;
  }

  const filepath = localProductImagePath(url);

  if (!filepath) {
    return;
  }

  try {
    await unlink(filepath);
  } catch {
    // File may already be removed.
  }
}

export async function deleteRemovedLocalProductImages(
  previousUrls: string[],
  nextUrls: string[],
) {
  const kept = new Set(nextUrls);

  await Promise.all(
    previousUrls
      .filter((url) => !kept.has(url))
      .map((url) => deleteLocalProductImage(url)),
  );
}
