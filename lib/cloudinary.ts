import "server-only";

import { v2 as cloudinary } from "cloudinary";
import { CAROUSEL_IMAGE } from "@/lib/carousel";
import { PRODUCT_IMAGE } from "@/lib/product";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const MAX_BYTES = 5 * 1024 * 1024;

function getCloudinary() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Chưa cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY hoặc CLOUDINARY_API_SECRET.");
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}

export async function uploadCategoryImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF." };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Ảnh tối đa 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await getCloudinary().uploader.upload(dataUri, {
      folder: "naphungstore/categories",
      resource_type: "image",
    });

    if (!result.secure_url) {
      return { error: "Cloudinary không trả về link ảnh." };
    }

    return { url: result.secure_url };
  } catch (error) {
    if (error instanceof Error && error.message.includes("CLOUDINARY_")) {
      return { error: error.message };
    }

    return { error: "Không thể tải ảnh lên Cloudinary." };
  }
}

export async function uploadCarouselImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF." };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Ảnh tối đa 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await getCloudinary().uploader.upload(dataUri, {
      folder: "naphungstore/carousel",
      resource_type: "image",
      transformation: [
        {
          width: CAROUSEL_IMAGE.width,
          height: CAROUSEL_IMAGE.height,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    if (!result.secure_url) {
      return { error: "Cloudinary không trả về link ảnh." };
    }

    return { url: result.secure_url };
  } catch (error) {
    if (error instanceof Error && error.message.includes("CLOUDINARY_")) {
      return { error: error.message };
    }

    return { error: "Không thể tải ảnh lên Cloudinary." };
  }
}

export async function uploadProductImageFile(file: File) {
  if (!ALLOWED_TYPES.has(file.type)) {
    return { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF." };
  }

  if (file.size > MAX_BYTES) {
    return { error: "Ảnh tối đa 5MB." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

  try {
    const result = await getCloudinary().uploader.upload(dataUri, {
      folder: "naphungstore/products",
      resource_type: "image",
      transformation: [
        {
          width: PRODUCT_IMAGE.width,
          height: PRODUCT_IMAGE.height,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    if (!result.secure_url) {
      return { error: "Cloudinary không trả về link ảnh." };
    }

    return { url: result.secure_url };
  } catch (error) {
    if (error instanceof Error && error.message.includes("CLOUDINARY_")) {
      return { error: error.message };
    }

    return { error: "Không thể tải ảnh lên Cloudinary." };
  }
}
