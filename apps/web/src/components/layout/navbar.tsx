"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-foreground">
              AIA
            </Link>
            <div className="hidden md:flex md:gap-6">
              <Link
                href={
                  process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3007"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Docs
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard/profile"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Profile
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="hidden md:flex md:items-center md:gap-4">
            <SignedOut>
              <Button asChild variant="outline">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 mt-8">
                <a
                  href={
                    process.env.NEXT_PUBLIC_DOCS_URL || "http://localhost:3007"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Docs
                </a>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard
                </Link>
                <SignedIn>
                  <Link
                    href="/dashboard/profile"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Profile
                  </Link>
                </SignedIn>
                <SignedOut>
                  <Button asChild variant="outline" className="w-full">
                    <Link href="/sign-in">Sign In</Link>
                  </Button>
                </SignedOut>
                <SignedIn>
                  <div className="flex items-center gap-2 p-2">
                    <UserButton afterSignOutUrl="/" />
                    <span className="text-sm text-muted-foreground">
                      Account
                    </span>
                  </div>
                </SignedIn>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
