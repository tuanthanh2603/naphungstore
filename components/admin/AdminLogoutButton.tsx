"use client";

import { logoutAction } from "@/actions/auth";
import { Button } from "@heroui/react";

export default function AdminLogoutButton() {
  return (
    <Button
      variant="outline"
      onPress={() => {
        console.log("Đăng xuất thành công, chuyển hướng tới /login");
        return logoutAction();
      }}
    >
      Đăng xuất
    </Button>
  );
}
