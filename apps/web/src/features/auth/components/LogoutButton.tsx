"use client";

import { logout } from "#auth/actions";
import { Button } from "@repo/ui/components/button";

export function LogoutButton() {
  return (
    <Button onClick={() => logout()} variant="flat" color="secondary">
      Logout
    </Button>
  );
}
