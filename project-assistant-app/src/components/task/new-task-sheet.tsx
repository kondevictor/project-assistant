"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createTask } from "@/lib/actions/tasks";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/constants";

type Phase = { id: string; name: string };

export function NewTaskSheet({
  projectId,
  phases,
  defaultPhaseId,
  triggerLabel = "Add Task",
}: {
  projectId: string;
  phases?: Phase[];
  defaultPhaseId?: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createTask(formData);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button size="sm" variant="outline">
          <Plus />
          {triggerLabel}
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom">
        <SheetHeader>
          <SheetTitle>New task</SheetTitle>
        </SheetHeader>
        <form action={action} className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
          <input type="hidden" name="projectId" value={projectId} />
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Due date</Label>
              <Input id="dueDate" name="dueDate" type="date" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="MEDIUM">
                <SelectTrigger id="priority" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {phases && phases.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phaseId">Phase</Label>
              <Select name="phaseId" defaultValue={defaultPhaseId ?? "none"}>
                <SelectTrigger id="phaseId" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No phase</SelectItem>
                  {phases.map((phase) => (
                    <SelectItem key={phase.id} value={phase.id}>
                      {phase.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" name="owner" placeholder="Optional" />
          </div>
          <Button type="submit" className="mt-2">
            Add task
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
