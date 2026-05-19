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
    <div className="fixed top-0 z-50 w-full bg-black/20 py-4 backdrop-blur-lg">
      <nav className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="text-lg font-bold">
              Sen
            </Link>

            {data?.user && (
              <div className="hidden items-center gap-1 md:flex">
                <NavbarLink href="/langue">Langues</NavbarLink>
                <NavbarLink href="/mes-cours">Mes cours</NavbarLink>
                <RevisionNavLink />
              </div>
            )}
          </div>

          <div className="hidden items-center gap-4 md:flex">
            {data?.user ? (
              <NavbarLink
                href="/profile"
                className="inline-flex items-center gap-2"
              >
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
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 transition-colors hover:bg-zinc-900",
        className,
      )}
    >
      {children}
    </Link>
  );
}