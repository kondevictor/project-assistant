"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Compass, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useTutorial, isFirstVisit } from "./tutorial-provider";
import { Button } from "@/components/ui/button";
import { WELCOME_TUTORIAL } from "@/lib/tutorial-data/welcome";
import {
  DASHBOARD_TUTORIAL,
  PROJECTS_TUTORIAL,
  TASKS_TUTORIAL,
  STAKEHOLDERS_TUTORIAL,
  MEETINGS_TUTORIAL,
  TRANSCRIPTIONS_TUTORIAL,
  DOCUMENTS_TUTORIAL,
} from "@/lib/tutorial-data/pages";
import { cn } from "@/lib/utils";

const PAGE_TUTORIALS: Array<{ path: string; tutorial: typeof DASHBOARD_TUTORIAL }> = [
  { path: "/", tutorial: DASHBOARD_TUTORIAL },
  { path: "/projects", tutorial: PROJECTS_TUTORIAL },
  { path: "/tasks", tutorial: TASKS_TUTORIAL },
  { path: "/stakeholders", tutorial: STAKEHOLDERS_TUTORIAL },
  { path: "/meetings", tutorial: MEETINGS_TUTORIAL },
  { path: "/transcriptions", tutorial: TRANSCRIPTIONS_TUTORIAL },
  { path: "/documents", tutorial: DOCUMENTS_TUTORIAL },
];

export function TutorialLauncher() {
  const pathname = usePathname();
  const {
    registerTutorial,
    startTutorial,
    startFirstTimeTutorial,
    isTutorialCompleted,
    isActive,
  } = useTutorial();

  const [menuOpen, setMenuOpen] = useState(false);
  const [hasAutoStarted, setHasAutoStarted] = useState(false);

  const isAuthPage =
    pathname.startsWith("/sign-in") ||
    pathname.startsWith("/sign-up") ||
    pathname.startsWith("/onboarding");

  // Register all tutorials on mount
  useEffect(() => {
    registerTutorial(WELCOME_TUTORIAL);
    registerTutorial(DASHBOARD_TUTORIAL);
    registerTutorial(PROJECTS_TUTORIAL);
    registerTutorial(TASKS_TUTORIAL);
    registerTutorial(STAKEHOLDERS_TUTORIAL);
    registerTutorial(MEETINGS_TUTORIAL);
    registerTutorial(TRANSCRIPTIONS_TUTORIAL);
    registerTutorial(DOCUMENTS_TUTORIAL);
  }, [registerTutorial]);

  // Auto-start welcome tutorial for first-time users
  useEffect(() => {
    if (isAuthPage || hasAutoStarted) return;
    if (isFirstVisit()) {
      setHasAutoStarted(true);
      // Small delay so the page paints first
      const timer = setTimeout(() => {
        startFirstTimeTutorial();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAuthPage, hasAutoStarted, startFirstTimeTutorial]);

  // Auto-start page-specific tutorial when navigating to a new page
  useEffect(() => {
    if (isAuthPage || isActive) return;
    const match = PAGE_TUTORIALS.find((t) => {
      if (t.path === "/") return pathname === "/";
      return pathname.startsWith(t.path);
    });
    if (match && !isTutorialCompleted(match.tutorial.id)) {
      // Only auto-start after the welcome tutorial has been completed
      if (isTutorialCompleted("welcome")) {
        const timer = setTimeout(() => startTutorial(match.tutorial.id), 600);
        return () => clearTimeout(timer);
      }
    }
  }, [pathname, isAuthPage, isActive, startTutorial, isTutorialCompleted]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  if (isAuthPage || isActive) return null;

  const pageTutorial = PAGE_TUTORIALS.find((t) => {
    if (t.path === "/") return pathname === "/";
    return pathname.startsWith(t.path);
  })?.tutorial;

  return (
    <div className="fixed bottom-20 right-4 z-[998] md:bottom-6 md:right-6 flex flex-col items-end gap-2">
      {menuOpen && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-64">
          <div className="px-4 py-3 border-b bg-gray-50 dark:bg-gray-800 flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Compass className="w-4 h-4 text-blue-600" />
              Help & Tutorials
            </span>
            <button
              onClick={() => setMenuOpen(false)}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-2">
            <button
              onClick={() => {
                setMenuOpen(false);
                startTutorial("welcome");
              }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium transition-colors flex items-center justify-between"
            >
              Getting Started Tour
              <span className="text-xs text-muted-foreground">replay</span>
            </button>
            {pageTutorial && (
              <button
                onClick={() => {
                  setMenuOpen(false);
                  startTutorial(pageTutorial.id);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent text-sm font-medium transition-colors flex items-center justify-between"
              >
                {pageTutorial.name}
                <span className="text-xs text-muted-foreground">
                  {isTutorialCompleted(pageTutorial.id) ? "replay" : "start"}
                </span>
              </button>
            )}
            <div className="mt-2 pt-2 border-t text-xs text-muted-foreground px-3 py-2">
              You can also open any page tutorial automatically on first visit.
            </div>
          </div>
        </div>
      )}

      <Button
        size="icon"
        className={cn(
          "rounded-full w-11 h-11 shadow-lg",
          "bg-blue-600 hover:bg-blue-700 text-white"
        )}
        onClick={() => setMenuOpen((prev) => !prev)}
        aria-label="Help and tutorials"
      >
        <HelpCircle className="w-5 h-5" />
      </Button>
    </div>
  );
}
