import Link from "next/link";
import { FileQuestion } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="rounded-full bg-accent p-3 text-muted-foreground">
        <FileQuestion className="size-8" />
      </div>
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-bold">Page or Resource Not Found</h2>
        <p className="text-muted-foreground text-sm max-w-md">
          The requested project, task, or page could not be located.
        </p>
      </div>
      <Button asChild variant="default">
        <Link href="/projects">Go to Projects</Link>
      </Button>
    </div>
  );
}
