"use client";

import Link from "next/link";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useProfile } from "#auth/hooks/useProfile";
import { useRevisionCount } from "../../hooks/useRevisionQueue";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

export function Navbar() {
  const { data } = useProfile();

  return (
    <div className="fixed top-0 z-50 w-full bg-black py-4">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="font-bold text-lg">
              Sen
            </Link>

            {data?.user && (
              <div className="hidden md:flex items-center gap-1">
                <NavbarLink href="/dashboard">Dashboard</NavbarLink>
                <NavbarLink href="/langue">Langues</NavbarLink>
                <NavbarLink href="/mes-cours">Mes cours</NavbarLink>
                <RevisionNavLink />
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {data?.user ? (
              <NavbarLink href="/profile" className="inline-flex items-center gap-2">
                <Avatar>
                  <AvatarImage src={(data?.user.image ?? undefined) as string | undefined} />
                  <AvatarFallback>{data?.user.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <span>{data?.user.name}</span>
              </NavbarLink>
            ) : (
              <>
                <Button asChild variant="flat">
                  <Link href="/sign-in">Sign in</Link>
                </Button>
                <Button asChild color="secondary">
                  <Link href="/sign-up">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile — auth buttons only (nav handled by BottomNav) */}
          {!data?.user && (
            <div className="md:hidden flex gap-3">
              <Button asChild variant="flat">
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild color="secondary">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}

function RevisionNavLink({ onClick }: { onClick?: () => void }) {
  const { data: count } = useRevisionCount();
  return (
    <NavbarLink href="/revision" onClick={onClick} className="relative">
      Révisions
      {(count ?? 0) > 0 && (
        <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
          {count! > 99 ? "99+" : count}
        </span>
      )}
    </NavbarLink>
  );
}

function NavbarLink({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Link>) {
  return (
    <Link
      {...props}
      className={cn(
        "relative inline-flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-zinc-900 transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}
