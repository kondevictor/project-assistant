"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Mail, Phone, Building, Trash2, Edit, Contact, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

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
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  role: string;
  notes: string | null;
  projectId: string;
}

interface Project {
  id: string;
  name: string;
}

export default function StakeholdersPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStakeholder, setEditingStakeholder] = useState<Stakeholder | null>(null);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    role: "stakeholder",
    notes: "",
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchStakeholders(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
      if (data.length > 0) {
        setSelectedProject(data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStakeholders = async (projectId: string) => {
    try {
      const response = await fetch(`/api/stakeholders?projectId=${projectId}`);
      const data = await response.json();
      setStakeholders(data);
    } catch (error) {
      console.error("Failed to fetch stakeholders:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) {
      alert("Stakeholders must belong to a project. Please select a project first.");
      return;
    }

    try {
      const url = editingStakeholder
        ? `/api/stakeholders/${editingStakeholder.id}`
        : "/api/stakeholders";
      const method = editingStakeholder ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, projectId: selectedProject }),
      });

      if (response.ok) {
        setIsDialogOpen(false);
        setEditingStakeholder(null);
        resetForm();
        fetchStakeholders(selectedProject);
      }
    } catch (error) {
      console.error("Failed to save stakeholder:", error);
    }
  };

  // Native Device Contacts API Integration
  const handleSyncPhonebook = async () => {
    if (!selectedProject) {
      alert("Please select a project first to sync contacts into.");
      return;
    }

    if ("contacts" in navigator && "select" in (navigator as any).contacts) {
      try {
        const props = ["name", "email", "tel"];
        const selectedContacts = await (navigator as any).contacts.select(props, { multiple: true });

        if (selectedContacts && selectedContacts.length > 0) {
          setImporting(true);
          const formatted = selectedContacts.map((c: any) => ({
            name: c.name?.[0] || "Unnamed Contact",
            email: c.email?.[0] || "",
            phone: c.tel?.[0] || "",
            role: "stakeholder",
          }));

          await fetch("/api/contacts/sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ projectId: selectedProject, contacts: formatted }),
          });

          fetchStakeholders(selectedProject);
        }
      } catch (err) {
        console.error("Contact Picker cancelled or failed:", err);
      } finally {
        setImporting(false);
      }
    } else {
      // Fallback: click file input for vCard / VCF import
      fileInputRef.current?.click();
    }
  };

  const handleVCardUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProject) return;

    setImporting(true);
    try {
      const text = await file.text();
      await fetch("/api/contacts/sync", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: selectedProject, vcard: text }),
      });
      fetchStakeholders(selectedProject);
    } catch (err) {
      console.error("Failed to import vCard:", err);
    } finally {
      setImporting(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this stakeholder?")) return;

    try {
      const response = await fetch(`/api/stakeholders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchStakeholders(selectedProject);
      }
    } catch (error) {
      console.error("Failed to delete stakeholder:", error);
    }
  };

  const handleEdit = (stakeholder: Stakeholder) => {
    setEditingStakeholder(stakeholder);
    setFormData({
      name: stakeholder.name,
      email: stakeholder.email || "",
      phone: stakeholder.phone || "",
      company: stakeholder.company || "",
      role: stakeholder.role,
      notes: stakeholder.notes || "",
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      role: "stakeholder",
      notes: "",
    });
  };

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      stakeholder: "bg-blue-100 text-blue-800",
      team_member: "bg-green-100 text-green-800",
      partner: "bg-purple-100 text-purple-800",
      facilitator: "bg-yellow-100 text-yellow-800",
      investor: "bg-orange-100 text-orange-800",
      developer: "bg-cyan-100 text-cyan-800",
      manufacturer: "bg-pink-100 text-pink-800",
      supplier: "bg-indigo-100 text-indigo-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleVCardUpload}
        accept=".vcf,.vcard"
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Stakeholders</h1>
          <p className="text-gray-600 mt-1">
            Every stakeholder belongs to a project. Sync contacts from your phonebook or vCard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select project" />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleSyncPhonebook} disabled={importing}>
            <Contact className="w-4 h-4 mr-2" />
            {importing ? "Syncing..." : "Sync Phonebook"}
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => { resetForm(); setEditingStakeholder(null); }}>
                <Plus className="w-4 h-4 mr-2" />
                Add Stakeholder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingStakeholder ? "Edit Stakeholder" : "Add Stakeholder"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Assigned Project *</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Name *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone</label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Company</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Acme Corp"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Role / Relationship *</label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => setFormData({ ...formData, role: value })}
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
                <div>
                  <label className="text-sm font-medium">Notes</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingStakeholder ? "Update" : "Add"} Stakeholder
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {stakeholders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No stakeholders in this project</h3>
            <p className="text-gray-500 mb-4">
              Add stakeholders or sync contacts from your phonebook to assign responsibilities.
            </p>
            <div className="flex justify-center gap-3">
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Stakeholder
              </Button>
              <Button variant="outline" onClick={handleSyncPhonebook}>
                <Contact className="w-4 h-4 mr-2" />
                Sync Phonebook
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stakeholders.map((stakeholder) => (
            <Card key={stakeholder.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{stakeholder.name}</CardTitle>
                    {stakeholder.company && (
                      <p className="text-sm text-gray-500">{stakeholder.company}</p>
                    )}
                  </div>
                  <Badge className={getRoleBadgeColor(stakeholder.role)}>
                    {STAKEHOLDER_ROLES.find((r) => r.value === stakeholder.role)?.label || stakeholder.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  {stakeholder.email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <a href={`mailto:${stakeholder.email}`} className="hover:underline">
                        {stakeholder.email}
                      </a>
                    </div>
                  )}
                  {stakeholder.phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <a href={`tel:${stakeholder.phone}`} className="hover:underline">
                        {stakeholder.phone}
                      </a>
                    </div>
                  )}
                  {stakeholder.notes && (
                    <p className="text-gray-500 mt-2 line-clamp-2">{stakeholder.notes}</p>
                  )}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(stakeholder)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(stakeholder.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
