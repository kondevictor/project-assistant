"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createPhase } from "@/lib/actions/phases";

export function NewPhaseDialog({ projectId }: { projectId: string }) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createPhase(formData);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          Add Phase
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New phase</DialogTitle>
        </DialogHeader>
        <form action={action} className="flex flex-col gap-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phase-name">Name</Label>
            <Input id="phase-name" name="name" required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="phase-dueDate">Due date</Label>
            <Input id="phase-dueDate" name="dueDate" type="date" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isMilestone" className="size-4" />
            This is a milestone
          </label>
          <Button type="submit" className="mt-2">
            Add phase
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
