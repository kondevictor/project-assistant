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
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/actions/tasks";
import { PRIORITIES, PRIORITY_LABELS } from "@/lib/constants";

type Phase = { id: string; name: string };
type Stakeholder = { id: string; name: string };

export function NewTaskSheet({
  projectId,
  phases,
  defaultPhaseId,
  triggerLabel = "Add Task",
  stakeholders = [],
  onCreated,
  onAddStakeholder,
}: {
  projectId: string;
  phases?: Phase[];
  defaultPhaseId?: string;
  triggerLabel?: string;
  stakeholders?: Stakeholder[];
  onCreated?: () => void;
  onAddStakeholder?: () => void;
}) {
  const [open, setOpen] = useState(false);

  async function action(formData: FormData) {
    await createTask(formData);
    onCreated?.();
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
            <Label htmlFor="stakeholderId">Assigned To (Person)</Label>
            {stakeholders.length > 0 ? (
              <Select name="stakeholderId" defaultValue="none">
                <SelectTrigger id="stakeholderId" className="w-full">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Unassigned</SelectItem>
                  {stakeholders.map((stakeholder) => (
                    <SelectItem key={stakeholder.id} value={stakeholder.id}>
                      {stakeholder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>No stakeholders in this project yet</span>
                <Button type="button" variant="link" size="sm" onClick={onAddStakeholder}>
                  Add one
                </Button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="NOT_STARTED">
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="DONE">Done</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="BLOCKED">Blocked</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="comments">Comments</Label>
            <Textarea id="comments" name="comments" placeholder="Add any comments..." rows={3} />
          </div>
          <Button type="submit" className="mt-2">
            Add task
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}