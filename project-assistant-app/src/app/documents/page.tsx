"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Plus, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
}

interface GeneratedDocument {
  id: string;
  fileName: string;
  status: string;
  createdAt: string;
  project: { name: string };
  template: { name: string; type: string };
}

const DOCUMENT_TYPES = [
  { value: "ncnda", label: "NCNDA", description: "Non-Compete Non-Disclosure Agreement" },
  { value: "mou", label: "MOU", description: "Memorandum of Understanding" },
  { value: "mandate", label: "Mandate", description: "Mandate Agreement" },
  { value: "partnership", label: "Partnership", description: "Partnership Agreement" },
  { value: "contracts", label: "Contract", description: "Standard Service/Project Contract Agreement" },
];

export default function DocumentsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<GeneratedDocument[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedDocType, setSelectedDocType] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    fetchAllDocuments();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      fetchDocuments(selectedProject);
    }
  }, [selectedProject]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const fetchDocuments = async (projectId: string) => {
    try {
      const response = await fetch(`/api/documents?projectId=${projectId}`);
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const handleGenerate = async () => {
    if (!selectedProject || !selectedDocType) return;
    setGenerating(true);

    try {
      const response = await fetch("/api/documents/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: selectedProject,
          templateType: selectedDocType,
        }),
      });
      const data = await response.json();

      // Download the file
      if (data.base64) {
        const byteCharacters = atob(data.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.fileName;
        a.click();
        URL.revokeObjectURL(url);
      }

      setIsDialogOpen(false);
      setSelectedDocType("");
      fetchAllDocuments();
    } catch (error) {
      console.error("Failed to generate document:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = (doc: GeneratedDocument) => {
    // Regenerate and download
    const metadata = (doc as any).metadata;
    if (metadata?.base64) {
      const byteCharacters = atob(metadata.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Generation</h1>
          <p className="text-gray-600 mt-1">Generate legal documents for your projects</p>
        </div>

        <div className="flex items-center gap-4">
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Generate Document
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Generate New Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Project</label>
                  <Select value={selectedProject} onValueChange={setSelectedProject}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a project" />
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
                  <label className="text-sm font-medium mb-2 block">Document Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    {DOCUMENT_TYPES.map((type) => (
                      <Button
                        key={type.value}
                        variant={selectedDocType === type.value ? "default" : "outline"}
                        className="h-auto py-4 flex flex-col items-center"
                        onClick={() => setSelectedDocType(type.value)}
                      >
                        <FileText className="w-6 h-6 mb-2" />
                        <span className="font-medium">{type.label}</span>
                        <span className="text-xs text-gray-500 mt-1">{type.description}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  onClick={handleGenerate}
                  disabled={!selectedProject || !selectedDocType || generating}
                >
                  {generating ? "Generating..." : "Generate Document"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Document Types Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {DOCUMENT_TYPES.map((type) => (
          <Card key={type.value} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {type.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Generated Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents generated yet</h3>
              <p className="text-gray-500 mb-4">Generate your first document to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Generate Document
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <FileText className="w-10 h-10 text-blue-600" />
                    <div>
                      <h3 className="font-medium">{doc.fileName}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <span>{doc.template?.name}</span>
                        <span>•</span>
                        <span>{doc.project?.name}</span>
                        <span>•</span>
                        <span>{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        doc.status === "generated"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }
                    >
                      {doc.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(doc)}>
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
