"use server";

import { redirect } from "next/navigation";
import { clearSessionCookie, setSessionCookie } from "@/lib/auth/cookies";
import { verifyPassword } from "@/lib/auth/password";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { isAuthConfigured } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type AuthActionResult = {
  error?: string;
};

export async function loginAction(input: {
  username: string;
  password: string;
  redirectTo?: string;
}): Promise<AuthActionResult> {
  if (!isAuthConfigured()) {
    return { error: "Chưa cấu hình AUTH_SECRET hoặc database." };
  }

  const username = input.username.trim();
  const password = input.password;

  if (!username || !password) {
    return { error: "Vui lòng nhập tài khoản và mật khẩu." };
  }

  const account = await prisma.tblAccount.findFirst({
    where: {
      status: "active",
      OR: [
        { email: { equals: username, mode: "insensitive" } },
        { username: { equals: username, mode: "insensitive" } },
      ],
    },
  });

  if (!account?.passwordHash) {
    return { error: "Tài khoản hoặc mật khẩu không đúng." };
  }

  const isValidPassword = await verifyPassword(password, account.passwordHash);

  if (!isValidPassword) {
    return { error: "Tài khoản hoặc mật khẩu không đúng." };
  }

  if (account.role !== "admin") {
    await clearSessionCookie();
    return { error: "Tài khoản không có quyền truy cập admin." };
  }

  await setSessionCookie({
    userId: account.id,
    role: account.role,
  });

  const redirectTo = getSafeRedirect(input.redirectTo);
  console.log("Đăng nhập thành công:", {
    username: account.username,
    role: account.role,
    redirectTo,
  });
  redirect(redirectTo);
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect("/login");
}
