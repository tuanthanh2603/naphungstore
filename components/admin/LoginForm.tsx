"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import logo from "@/assets/image/logo_2.png";
import { loginAction } from "@/actions/auth";
import { getSafeRedirect } from "@/lib/auth/redirect";
import {
  Button,
  Form,
  Input,
  Label,
  Surface,
  TextField,
} from "@heroui/react";

export default function AdminLoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = getSafeRedirect(searchParams.get("redirect"));

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const usernameValue =
      String(formData.get("username") ?? "").trim() || username.trim();
    const passwordValue = String(formData.get("password") ?? "") || password;

    try {
      const result = await loginAction({
        username: usernameValue,
        password: passwordValue,
        redirectTo,
      });

      if (result?.error) {
        console.log("Đăng nhập thất bại:", result.error);
        setError(result.error);
        return;
      }
    } catch (requestError) {
      if (isRedirectError(requestError)) {
        console.log("Đăng nhập thành công, chuyển hướng tới", redirectTo);
        throw requestError;
      }

      console.log("Đăng nhập thất bại: Không thể đăng nhập. Vui lòng thử lại.");
      setError("Không thể đăng nhập. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Surface className="w-full max-w-md rounded-2xl border border-separator p-6 sm:p-8">
      <div className="mb-8 flex flex-col items-center gap-4 text-center">
        <Image
          src={logo}
          alt="NA PHÙNG STORE"
          className="h-14 w-auto object-contain"
          priority
        />
        <div>
          <h1 className="text-xl font-semibold not-italic">Đăng nhập</h1>
          <p className="mt-1 text-sm text-muted">
            Truy cập trang quản trị NA PHÙNG STORE
          </p>
        </div>
      </div>

      <Form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <TextField
          isRequired
          name="username"
          type="text"
          value={username}
          onChange={setUsername}
          fullWidth
        >
          <Label>Tài khoản</Label>
          <Input placeholder="email@domain.com" autoComplete="username" />
        </TextField>

        <TextField
          isRequired
          name="password"
          type="password"
          value={password}
          onChange={setPassword}
          fullWidth
        >
          <Label>Mật khẩu</Label>
          <Input placeholder="••••••••" autoComplete="current-password" />
        </TextField>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          isDisabled={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </Button>
      </Form>
    </Surface>
  );
}
