"use client";

import Link from "next/link";
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

  return (
    <div className="fixed top-0 z-50 w-full bg-black py-4">
      <nav className="container mx-auto">
        <ul className="flex items-center justify-between gap-10">
          <div className="flex items-center gap-16">
            <li>
              <Link href="/" className="flex items-center gap-2">
                Turbo starter
              </Link>
            </li>

            <div className="flex items-center gap-4 rounded-xl">
              <li></li>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {data?.user ? (
              <>
                <li>
                  <NavbarLink
                    href="/profile"
                    className="inline-flex items-center gap-2"
                  >
                    <Avatar>
                      <AvatarImage
                        src={(data?.user.image ?? undefined) as string | undefined}
                      />
                      <AvatarFallback>
                        {data?.user.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>

                    <span className="">{data?.user.name}</span>
                  </NavbarLink>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Button asChild variant="flat">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                </li>
                <li>
                  <Button asChild color="secondary">
                    <Link href="/sign-up">Sign up</Link>
                  </Button>
                </li>
              </>
            )}
          </div>
        </ul>
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
        "inline-flex items-center gap-2 rounded-xl px-4 py-2",
        className,
      )}
    >
      {children}
    </Link>
  );
}
