"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building, Code, GraduationCap, Users, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const clerkPubKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const ROLES = [
  { value: "freelancer", label: "Freelancer", description: "Independent contractor working on client projects", icon: Briefcase },
  { value: "consultant", label: "Consultant", description: "Expert advisor providing specialized guidance", icon: Building },
  { value: "developer", label: "Developer", description: "Software engineer building applications", icon: Code },
  { value: "project_manager", label: "Project Manager", description: "Leading teams and delivering projects", icon: Users },
  { value: "executive", label: "Executive", description: "Leadership role overseeing strategy", icon: Zap },
  { value: "student", label: "Student", description: "Learning project management", icon: GraduationCap },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!clerkPubKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Authentication Not Configured</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Clerk API keys are not set up. Please configure environment variables.</p>
          <Button className="mt-4" onClick={() => router.push("/")}>Go to Dashboard</Button>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);
    try {
      localStorage.setItem("userRole", selectedRole);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Onboarding failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">What's your role?</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">This helps us customize your experience</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ROLES.map((role) => (
            <Button
              key={role.value}
              variant={selectedRole === role.value ? "default" : "outline"}
              className="h-32 flex flex-col items-center justify-center gap-3 text-left w-full"
              onClick={() => setSelectedRole(role.value)}
            >
              <role.icon className="w-8 h-8" />
              <span className="font-semibold">{role.label}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">{role.description}</span>
            </Button>
          ))}
        </div>

        <Button
          className="w-full mt-8 py-3 text-lg"
          onClick={handleSubmit}
          disabled={!selectedRole || isSubmitting}
        >
          {isSubmitting ? "Saving..." : "Continue to Dashboard"}
        </Button>
      </div>
    </div>
  );
}
