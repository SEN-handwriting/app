"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Globe, RotateCcw, User } from "lucide-react";
import { cn } from "@repo/ui/lib/utils";
import { useProfile } from "#auth/hooks/useProfile";
import { useRevisionCount } from "../../hooks/useRevisionQueue";

export function BottomNav() {
  const { data } = useProfile();
  const pathname = usePathname();

  if (!data?.user) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black border-t border-zinc-800 safe-area-bottom">
      <div className="grid grid-cols-4 h-16">
        <BottomNavItem
          href="/dashboard"
          icon={<LayoutDashboard size={22} />}
          label="Dashboard"
          active={pathname === "/dashboard"}
        />
        <BottomNavItem
          href="/langue"
          icon={<Globe size={22} />}
          label="Langues"
          active={pathname.startsWith("/langue")}
        />
        <RevisionBottomItem active={pathname === "/revision"} />
        <BottomNavItem
          href="/profile"
          icon={<User size={22} />}
          label="Profil"
          active={pathname === "/profile"}
        />
      </div>
    </nav>
  );
}

function BottomNavItem({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      {icon}
      {label}
    </Link>
  );
}

function RevisionBottomItem({ active }: { active: boolean }) {
  const { data: count } = useRevisionCount();
  return (
    <Link
      href="/revision"
      className={cn(
        "relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors",
        active ? "text-white" : "text-zinc-500 hover:text-zinc-300",
      )}
    >
      <div className="relative">
        <RotateCcw size={22} />
        {(count ?? 0) > 0 && (
          <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
            {(count ?? 0) > 99 ? "99+" : count}
          </span>
        )}
      </div>
      Révisions
    </Link>
  );
}
