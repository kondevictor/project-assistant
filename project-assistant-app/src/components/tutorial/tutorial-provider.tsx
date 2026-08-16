"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  icon?: string;
  targetSelector?: string;
  position?: "top" | "bottom" | "left" | "right";
}

interface Tutorial {
  id: string;
  name: string;
  description: string;
  steps: TutorialStep[];
}

interface TutorialContextType {
  isActive: boolean;
  currentStep: number;
  currentTutorial: Tutorial | null;
  tutorials: Tutorial[];
  completedTutorials: string[];
  startTutorial: (tutorialId: string) => void;
  startFirstTimeTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTutorial: () => void;
  completeTutorial: () => void;
  registerTutorial: (tutorial: Tutorial) => void;
  isTutorialCompleted: (tutorialId: string) => boolean;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const STORAGE_KEY = "project-assistant-tutorials";
const FIRST_VISIT_KEY = "project-assistant-first-visit";

function getCompletedTutorials(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCompletedTutorials(completed: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
  } catch {}
}

function isFirstVisit(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem(FIRST_VISIT_KEY);
}

function markVisited() {
  if (typeof window === "undefined") return;
  localStorage.setItem(FIRST_VISIT_KEY, "true");
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentTutorial, setCurrentTutorial] = useState<Tutorial | null>(null);
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  useEffect(() => {
    setCompletedTutorials(getCompletedTutorials());
  }, []);

  const registerTutorial = useCallback((tutorial: Tutorial) => {
    setTutorials((prev) => {
      if (prev.find((t) => t.id === tutorial.id)) return prev;
      return [...prev, tutorial];
    });
  }, []);

  const startTutorial = useCallback((tutorialId: string) => {
    setTutorials((prev) => {
      const tutorial = prev.find((t) => t.id === tutorialId);
      if (tutorial) {
        setCurrentTutorial(tutorial);
        setCurrentStep(0);
        setIsActive(true);
      }
      return prev;
    });
  }, []);

  const startFirstTimeTutorial = useCallback(() => {
    setTutorials((prev) => {
      const welcomeTutorial = prev.find((t) => t.id === "welcome");
      if (welcomeTutorial) {
        setCurrentTutorial(welcomeTutorial);
        setCurrentStep(0);
        setIsActive(true);
      }
      return prev;
    });
  }, []);

  const nextStep = useCallback(() => {
    if (!currentTutorial) return;
    if (currentStep < currentTutorial.steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      completeTutorial();
    }
  }, [currentStep, currentTutorial]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const skipTutorial = useCallback(() => {
    if (currentTutorial) {
      markVisited();
    }
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
  }, [currentTutorial]);

  const completeTutorial = useCallback(() => {
    if (currentTutorial) {
      const updated = [...getCompletedTutorials(), currentTutorial.id];
      const unique = [...new Set(updated)];
      saveCompletedTutorials(unique);
      setCompletedTutorials(unique);
      markVisited();
    }
    setIsActive(false);
    setCurrentTutorial(null);
    setCurrentStep(0);
  }, [currentTutorial]);

  const isTutorialCompleted = useCallback(
    (tutorialId: string) => completedTutorials.includes(tutorialId),
    [completedTutorials]
  );

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        currentTutorial,
        tutorials,
        completedTutorials,
        startTutorial,
        startFirstTimeTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        registerTutorial,
        isTutorialCompleted,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error("useTutorial must be used within a TutorialProvider");
  }
  return context;
}

export { isFirstVisit, markVisited };
export type { Tutorial, TutorialStep };
