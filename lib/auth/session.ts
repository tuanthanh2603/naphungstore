import { SignJWT, jwtVerify } from "jose";
import { buildDatabaseUrl } from "@/lib/env";
import { SESSION_MAX_AGE_SECONDS } from "./constants";

export type SessionPayload = {
  userId: string;
  role: string;
};

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("AUTH_SECRET chưa được cấu hình.");
  }

  return new TextEncoder().encode(secret);
}

export function isAuthConfigured() {
  return Boolean(process.env.AUTH_SECRET?.trim() && buildDatabaseUrl());
}

export async function createSessionToken(payload: SessionPayload) {
  return new SignJWT({ role: payload.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getAuthSecret());
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAuthSecret());
    const userId = payload.sub;

    if (!userId || typeof payload.role !== "string") {
      return null;
    }

    return {
      userId,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
