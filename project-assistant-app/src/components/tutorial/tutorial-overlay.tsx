"use client";

import { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X, Compass } from "lucide-react";
import { useTutorial } from "./tutorial-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function getTargetRect(selector: string | undefined): TargetRect | null {
  if (!selector) return null;
  try {
    const el = document.querySelector(selector);
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      left: rect.left + window.scrollX,
      width: rect.width,
      height: rect.height,
    };
  } catch {
    return null;
  }
}

export function TutorialOverlay() {
  const {
    isActive,
    currentStep,
    currentTutorial,
    nextStep,
    prevStep,
    skipTutorial,
    completeTutorial,
  } = useTutorial();

  const [targetRect, setTargetRect] = useState<TargetRect | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isActive) {
      setMounted(true);
      // Prevent body scroll while tutorial is active
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isActive]);

  const updateTarget = useCallback(() => {
    if (!currentTutorial) return;
    const step = currentTutorial.steps[currentStep];
    setTargetRect(getTargetRect(step.targetSelector));
  }, [currentTutorial, currentStep]);

  useEffect(() => {
    updateTarget();
    window.addEventListener("resize", updateTarget);
    window.addEventListener("scroll", updateTarget, true);
    return () => {
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("scroll", updateTarget, true);
    };
  }, [updateTarget]);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(updateTarget, 250);
      return () => clearTimeout(timer);
    }
  }, [isActive, currentStep, updateTarget]);

  if (!mounted || !isActive || !currentTutorial) return null;

  const step = currentTutorial.steps[currentStep];
  const totalSteps = currentTutorial.steps.length;
  const isLastStep = currentStep === totalSteps - 1;
  const hasTarget = targetRect !== null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Spotlight highlight around target element */}
      {hasTarget && (
        <div
          className="absolute border-2 border-blue-400 rounded-lg shadow-[0_0_0_4px_rgba(59,130,246,0.4)] animate-pulse transition-all duration-300"
          style={{
            top: targetRect.top - 6,
            left: targetRect.left - 6,
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      )}

      {/* Step card */}
      <div
        className={cn(
          "absolute left-1/2 -translate-x-1/2 w-[min(92vw,420px)] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden",
          targetRect ? "top-4" : "top-1/2 -translate-y-1/2"
        )}
        style={
          targetRect
            ? { top: undefined }
            : undefined
        }
      >
        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Step {currentStep + 1} of {totalSteps}
              </span>
            </div>
            <button
              onClick={skipTutorial}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Close tutorial"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.content}</p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between px-5 py-4 border-t bg-gray-50 dark:bg-gray-800/50">
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={skipTutorial}
            >
              Skip
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={prevStep}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </div>
          <Button
            size="sm"
            onClick={isLastStep ? completeTutorial : nextStep}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLastStep ? "Finish" : "Next"}
            {!isLastStep && <ChevronRight className="w-4 h-4 ml-1" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
