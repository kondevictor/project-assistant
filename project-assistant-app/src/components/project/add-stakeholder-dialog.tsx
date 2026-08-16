"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const STAKEHOLDER_ROLES = [
  { value: "stakeholder", label: "Stakeholder" },
  { value: "team_member", label: "Team Member" },
  { value: "partner", label: "Partner" },
  { value: "facilitator", label: "Facilitator" },
  { value: "investor", label: "Investor" },
  { value: "developer", label: "Developer" },
  { value: "manufacturer", label: "Manufacturer" },
  { value: "supplier", label: "Supplier" },
];

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  company: "",
  role: "stakeholder",
  notes: "",
};

export function AddStakeholderDialog({
  projectId,
  open,
  onOpenChange,
  onCreated,
}: {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: () => void;
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setForm(EMPTY_FORM);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/stakeholders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, ...form }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Failed to add stakeholder");
        return;
      }

      reset();
      onOpenChange(false);
      onCreated?.();
    } catch (err) {
      console.error("Failed to add stakeholder:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) reset();
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Stakeholder</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stakeholder-name">Name *</Label>
              <Input
                id="stakeholder-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stakeholder-role">Role *</Label>
              <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value })}>
                <SelectTrigger id="stakeholder-role" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STAKEHOLDER_ROLES.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stakeholder-email">Email</Label>
              <Input
                id="stakeholder-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="john@example.com"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stakeholder-phone">Phone</Label>
              <Input
                id="stakeholder-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="stakeholder-company">Company</Label>
              <Input
                id="stakeholder-company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Acme Corp"
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="stakeholder-notes">Notes</Label>
              <Textarea
                id="stakeholder-notes"
                rows={2}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Additional context..."
              />
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={saving || !form.name.trim()}>
              <UserPlus className="w-4 h-4 mr-2" />
              {saving ? "Adding..." : "Add Stakeholder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
