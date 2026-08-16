"use client";

import { useState } from "react";
import { Plus, Minus, UserPlus, Users } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createProject } from "@/lib/actions/projects";
import { PROJECT_STAGES, STAGE_LABELS } from "@/lib/constants";

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

interface Stakeholder {
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
}

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([
    { name: "", email: "", phone: "", company: "", role: "stakeholder" },
  ]);

  const addStakeholder = () => {
    setStakeholders([...stakeholders, { name: "", email: "", phone: "", company: "", role: "stakeholder" }]);
  };

  const removeStakeholder = (index: number) => {
    if (stakeholders.length <= 1) return;
    setStakeholders(stakeholders.filter((_, i) => i !== index));
  };

  const updateStakeholder = (index: number, field: keyof Stakeholder, value: string) => {
    setStakeholders(stakeholders.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const handleSubmit = async (formData: FormData) => {
    formData.set("stakeholders", JSON.stringify(stakeholders.filter(s => s.name.trim())));
    await createProject(formData);
    setOpen(false);
    setStakeholders([{ name: "", email: "", phone: "", company: "", role: "stakeholder" }]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
        </DialogHeader>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" required autoFocus />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="stage">Stage</Label>
              <Select name="stage" defaultValue="INCEPTION">
                <SelectTrigger id="stage" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROJECT_STAGES.map((stage) => (
                    <SelectItem key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="targetDate">Target date</Label>
              <Input id="targetDate" name="targetDate" type="date" />
            </div>
          </div>

          {/* Stakeholders Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Stakeholders</Label>
              <Button type="button" variant="outline" size="sm" onClick={addStakeholder}>
                <UserPlus className="w-4 h-4 mr-1" />
                Add Stakeholder
              </Button>
            </div>
            <div className="space-y-3">
              {stakeholders.map((stakeholder, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium">Stakeholder {index + 1}</span>
                    {stakeholders.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeStakeholder(index)} className="text-red-600 hover:text-red-700">
                        <Minus className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`stakeholder-name-${index}`}>Name *</Label>
                      <Input
                        id={`stakeholder-name-${index}`}
                        value={stakeholder.name}
                        onChange={(e) => updateStakeholder(index, "name", e.target.value)}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`stakeholder-role-${index}`}>Role *</Label>
                      <Select
                        value={stakeholder.role}
                        onValueChange={(value) => updateStakeholder(index, "role", value)}
                      >
                        <SelectTrigger>
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
                      <Label htmlFor={`stakeholder-email-${index}`}>Email</Label>
                      <Input
                        id={`stakeholder-email-${index}`}
                        type="email"
                        value={stakeholder.email}
                        onChange={(e) => updateStakeholder(index, "email", e.target.value)}
                        placeholder="john@example.com"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`stakeholder-phone-${index}`}>Phone</Label>
                      <Input
                        id={`stakeholder-phone-${index}`}
                        type="tel"
                        value={stakeholder.phone}
                        onChange={(e) => updateStakeholder(index, "phone", e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <Label htmlFor={`stakeholder-company-${index}`}>Company</Label>
                      <Input
                        id={`stakeholder-company-${index}`}
                        value={stakeholder.company}
                        onChange={(e) => updateStakeholder(index, "company", e.target.value)}
                        placeholder="Acme Corp"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="mt-2">
            Create project
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}