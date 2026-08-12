"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled App Error:", error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-rose-100 p-3 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
        <AlertCircle className="size-8" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Something went wrong</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          {error.message || "An unexpected error occurred while processing your request."}
        </p>
      </div>
      <Button onClick={() => reset()} variant="outline" className="gap-2">
        <RefreshCw className="size-4" /> Try again
      </Button>
    </div>
  );
}
