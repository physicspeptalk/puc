/**
 * ExamContext.tsx
 *
 * Provides the current exam type ("KCET" | "COMEDK") to all components.
 * The exam is determined by the URL path:
 *   /kcet/    → exam = "KCET"
 *   /comedk/  → exam = "COMEDK"
 *
 * This allows all existing components to remain largely unchanged
 * while rendering exam-appropriate content based on the current page.
 */

import { createContext, useContext, type ReactNode } from "react";
import type { ExamType } from "../config/siteConfig";

interface ExamContextValue {
  exam: ExamType;
}

const ExamContext = createContext<ExamContextValue>({ exam: "KCET" });

export function ExamProvider({
  exam,
  children,
}: {
  exam: ExamType;
  children: ReactNode;
}) {
  return (
    <ExamContext.Provider value={{ exam }}>{children}</ExamContext.Provider>
  );
}

export function useExam(): ExamContextValue {
  return useContext(ExamContext);
}
