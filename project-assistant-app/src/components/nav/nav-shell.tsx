"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListChecks, Users, Calendar, Mic, Bell, FileText, LogIn, User } from "lucide-react";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/stakeholders", label: "Stakeholders", icon: Users },
  { href: "/meetings", label: "Meetings", icon: Calendar },
  { href: "/transcriptions", label: "Transcriptions", icon: Mic },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/documents", label: "Documents", icon: FileText },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // If on auth pages, render children full screen without sidebar
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up") || pathname.startsWith("/onboarding")) {
    return <main className="min-h-screen bg-background">{children}</main>;
  }

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden w-60 shrink-0 border-r p-4 md:flex md:flex-col md:justify-between">
        <div className="flex flex-col gap-1">
          <div className="mb-6 px-2 flex items-center justify-between">
            <span className="text-lg font-bold text-blue-600">Project Assistant</span>
          </div>

          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive(pathname, href)
                  ? "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400 font-semibold"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </div>

        {/* User Auth Section */}
        <div className="border-t pt-4 mt-auto">
          {clerkPubKey ? (
            <div className="flex items-center justify-between px-2">
              <SignedIn>
                <div className="flex items-center gap-2">
                  <UserButton />
                  <span className="text-xs text-muted-foreground font-medium">My Account</span>
                </div>
              </SignedIn>
              <SignedOut>
                <Link href="/sign-in" className="w-full">
                  <Button size="sm" className="w-full justify-start">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                </Link>
              </SignedOut>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/sign-in">
                <Button size="sm" variant="outline" className="w-full justify-start">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In / Sign Up
                </Button>
              </Link>
              <a href="/api/google/auth">
                <Button size="sm" variant="secondary" className="w-full justify-start text-xs">
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  Sign in with Google
                </Button>
              </a>
            </div>
          )}
        </div>
      </aside>

      <div className="flex flex-1 flex-col pb-16 md:pb-0">
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t bg-background md:hidden">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-medium",
              isActive(pathname, href) ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
