"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListChecks } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
];

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <aside className="hidden w-56 shrink-0 border-r p-4 md:flex md:flex-col md:gap-1">
        <div className="mb-4 px-2 text-lg font-semibold">Project Assistant</div>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors",
              isActive(pathname, href)
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
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
