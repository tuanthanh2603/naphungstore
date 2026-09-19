import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME } from "./constants";
import { verifySessionToken } from "./session";

export type CurrentAdmin = {
  id: string;
  username: string;
  email: string;
  fullName: string | null;
  role: string;
};

export const getCurrentAdmin = cache(async (): Promise<CurrentAdmin | null> => {
  const token = (await cookies()).get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  const session = await verifySessionToken(token);

  if (!session || session.role !== "admin") {
    return null;
  }

  return prisma.tblAccount.findFirst({
    where: {
      id: session.userId,
      role: "admin",
      status: "active",
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      role: true,
    },
  });
});

export async function requireAdmin() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    redirect("/login?redirect=/admin");
  }

  return admin;
}
