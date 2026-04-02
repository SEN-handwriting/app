"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@repo/ui/components/button";
import { cn } from "@repo/ui/lib/utils";
import { useProfile } from "#auth/hooks/useProfile";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/avatar";

export function Navbar() {
  const { data } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => setMenuOpen(false);

  return (
    <div className="fixed top-0 z-50 w-full bg-black py-4">
      <nav className="container mx-auto px-4">
        {/* Desktop row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="font-bold text-lg" onClick={close}>
              Sen
            </Link>

            {data?.user && (
              <div className="hidden md:flex items-center gap-1">
                <NavbarLink href="/langue">Langues</NavbarLink>
                <NavbarLink href="/mes-cours">Mes cours</NavbarLink>
                <NavbarLink href="/stats">Stats</NavbarLink>
              </div>
            )}
          </div>

          {/* Right side desktop */}
          <div className="hidden md:flex items-center gap-4">
            {data?.user ? (
              <NavbarLink href="/profile" className="inline-flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={(data?.user.image ?? undefined) as string | undefined}
                  />
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

          {/* Hamburger button — mobile only */}
          <button
            className="md:hidden flex flex-col justify-center gap-1.5 p-2 -mr-2"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menuOpen}
          >
            <span
              className={cn(
                "block w-6 h-0.5 bg-white transition-all duration-200",
                menuOpen && "translate-y-2 rotate-45",
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-white transition-all duration-200",
                menuOpen && "opacity-0",
              )}
            />
            <span
              className={cn(
                "block w-6 h-0.5 bg-white transition-all duration-200",
                menuOpen && "-translate-y-2 -rotate-45",
              )}
            />
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-zinc-800 flex flex-col gap-1">
            {data?.user ? (
              <>
                <NavbarLink href="/langue" onClick={close}>Langues</NavbarLink>
                <NavbarLink href="/mes-cours" onClick={close}>Mes cours</NavbarLink>
                <NavbarLink href="/stats" onClick={close}>Stats</NavbarLink>
                <NavbarLink
                  href="/profile"
                  className="inline-flex items-center gap-2 mt-2"
                  onClick={close}
                >
                  <Avatar>
                    <AvatarImage
                      src={(data?.user.image ?? undefined) as string | undefined}
                    />
                    <AvatarFallback>{data?.user.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{data?.user.name}</span>
                </NavbarLink>
              </>
            ) : (
              <div className="flex gap-3 py-2">
                <Button asChild variant="flat">
                  <Link href="/sign-in" onClick={close}>Sign in</Link>
                </Button>
                <Button asChild color="secondary">
                  <Link href="/sign-up" onClick={close}>Sign up</Link>
                </Button>
              </div>
            )}
          </div>
        )}
      </nav>
    </div>
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
        "inline-flex items-center gap-2 rounded-xl px-4 py-2 hover:bg-zinc-900 transition-colors",
        className,
      )}
    >
      {children}
    </Link>
  );
}