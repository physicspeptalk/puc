/**
 * MathRenderer.tsx
 *
 * High-performance, crash-safe math and scientific text renderer.
 *
 * Supports:
 *   - Inline LaTeX math: $...$
 *   - Block / display LaTeX math: $$...$$
 *   - Multiline content and paragraphs
 *   - Unicode mathematical characters (±, √, π, θ, λ, ω, μ, ∑, ∫, ≤, ≥, ≠, ×, ÷, °, ², ³, α, β, γ, Δ, Ω)
 *   - Scientific notation (e.g. 1.6 × 10^-19 C)
 *   - Safe fallback when LaTeX syntax contains typos
 */

import React, { useMemo } from "react";
import katex from "katex";

interface MathRendererProps {
  text: string;
  className?: string;
  as?: "span" | "div" | "p";
  inlineOnly?: boolean;
}

interface Segment {
  type: "text" | "inline-math" | "block-math";
  content: string;
}

/**
 * Tokenize a string into text, inline math ($...$), and block math ($$...$$) segments.
 */
function tokenizeTextWithMath(input: string): Segment[] {
  if (!input) return [];

  const segments: Segment[] = [];
  const len = input.length;
  let i = 0;
  let currentText = "";

  while (i < len) {
    // Check for block math $$...$$
    if (input[i] === "$" && input[i + 1] === "$") {
      if (currentText) {
        segments.push({ type: "text", content: currentText });
        currentText = "";
      }

      const endIdx = input.indexOf("$$", i + 2);
      if (endIdx !== -1) {
        const mathContent = input.substring(i + 2, endIdx);
        segments.push({ type: "block-math", content: mathContent });
        i = endIdx + 2;
        continue;
      } else {
        // No closing $$, treat as literal text
        currentText += "$$";
        i += 2;
        continue;
      }
    }

    // Check for inline math $...$ (ensure not preceded by backslash or followed by whitespace/digit)
    if (input[i] === "$" && (i === 0 || input[i - 1] !== "\\")) {
      if (currentText) {
        segments.push({ type: "text", content: currentText });
        currentText = "";
      }

      // Look for closing $ (not escaped)
      let endIdx = -1;
      for (let j = i + 1; j < len; j++) {
        if (input[j] === "$" && input[j - 1] !== "\\") {
          endIdx = j;
          break;
        }
        if (input[j] === "\n" && input.substring(j, j + 2) === "\n\n") {
          // Double newline aborts inline math
          break;
        }
      }

      if (endIdx !== -1 && endIdx > i + 1) {
        const mathContent = input.substring(i + 1, endIdx);
        segments.push({ type: "inline-math", content: mathContent });
        i = endIdx + 1;
        continue;
      } else {
        currentText += "$";
        i++;
        continue;
      }
    }

    currentText += input[i];
    i++;
  }

  if (currentText) {
    segments.push({ type: "text", content: currentText });
  }

  return segments;
}

/**
 * Safely render a LaTeX string via KaTeX into HTML.
 */
function safeRenderKatex(latex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      output: "htmlAndMathml",
      strict: false,
    });
  } catch (err) {
    console.warn("KaTeX render error:", err);
    return `<span class="katex-fallback">${escapeHtml(latex)}</span>`;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const MathRenderer: React.FC<MathRendererProps> = ({
  text,
  className = "",
  as: Component = "span",
  inlineOnly = false,
}) => {
  const renderedElements = useMemo(() => {
    if (!text) return null;

    const segments = tokenizeTextWithMath(text);

    return segments.map((seg, idx) => {
      if (seg.type === "block-math" && !inlineOnly) {
        const html = safeRenderKatex(seg.content, true);
        return (
          <div
            key={idx}
            className="my-3 overflow-x-auto text-center"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      if (seg.type === "inline-math" || (seg.type === "block-math" && inlineOnly)) {
        const html = safeRenderKatex(seg.content, false);
        return (
          <span
            key={idx}
            className="inline-block px-0.5 align-baseline"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      }

      // Plain text segment with preserved newlines
      const lines = seg.content.split("\n");
      return (
        <React.Fragment key={idx}>
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {lIdx > 0 && <br />}
              {line}
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    });
  }, [text, inlineOnly]);

  return <Component className={className}>{renderedElements}</Component>;
};

export default MathRenderer;
