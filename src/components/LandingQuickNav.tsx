/**
 * LandingQuickNav.tsx
 *
 * Microsoft Learn inspired quick navigation helper component for the landing page.
 * Features:
 * - Clean Coursera / Physics Pep Talk theme (white card, subtle borders, blue active state).
 * - Smooth one-click jump to sections (#home, #courses, #categories, #feedback, #youtube, #contact).
 * - Real-time active section tracking via IntersectionObserver / scroll spy.
 * - Collapsible toggle (« / ») so it never gets in the student's way.
 * - Quick shortcuts to Blogs & Faculties.
 * - No search bar (per explicit instruction).
 */

import { useState, useEffect, useRef } from "react";

interface SectionItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}

const SECTIONS: SectionItem[] = [
  { id: "home", label: "Fastrack Batches", icon: "🚀", badge: "2027" },
  { id: "courses", label: "New & Popular Courses", icon: "🎓" },
  { id: "categories", label: "Specialized Study Tracks", icon: "🧭" },
  { id: "feedback", label: "Student Success Stories", icon: "⭐", badge: "4.5★" },
  { id: "youtube", label: "Official Video Lectures", icon: "📺" },
  { id: "contact", label: "Admissions & Support", icon: "📞" },
];

export default function LandingQuickNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("home");
  const navRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside on mobile or desktop
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside, { passive: true });
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Track active section as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      // Find the last section whose top is at or above 200px from the viewport top
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const sec = document.getElementById(SECTIONS[i].id);
        if (sec) {
          const rect = sec.getBoundingClientRect();
          if (rect.top <= 200) {
            setActiveSection(SECTIONS[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Auto collapse on mobile viewports so content is visible immediately
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      setIsOpen(false);
    }
  };

  return (
    <aside
      ref={navRef}
      aria-label="Page quick navigation"
      className={`fixed bottom-4 left-4 z-40 select-none font-sans transition-all duration-200 ${
        isOpen
          ? "right-4 sm:right-auto sm:w-72 max-w-[calc(100vw-2rem)]"
          : "w-auto"
      }`}
    >
      {isOpen ? (
        <div className="w-full sm:w-72 bg-white/95 backdrop-blur-md rounded-2xl border border-gray-200/90 shadow-2xl p-3 animate-in fade-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-2 py-1.5 pb-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0056D2]" />
              <span className="text-xs font-bold text-gray-900 uppercase tracking-wider">
                Quick Navigation
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              title="Collapse navigation"
              className="w-7 h-7 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Collapse quick navigation"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Section Items */}
          <nav className="py-2 space-y-1 text-xs" aria-label="Landing page sections">
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 min-h-[38px] rounded-lg text-left transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-50 text-[#0056D2] font-bold border-l-2 border-[#0056D2] shadow-2xs"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-sm">{sec.icon}</span>
                    <span className="truncate">{sec.label}</span>
                  </div>
                  {sec.badge && (
                    <span
                      className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded ${
                        isActive
                          ? "bg-blue-100 text-[#0056D2]"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Academic Shortcuts */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between px-2 text-[11px]">
            <a
              href="/blogs/"
              className="text-[#0056D2] hover:text-[#00419e] font-semibold hover:underline flex items-center gap-1"
            >
              <span>📖 Blogs &amp; Guides</span>
              <span className="text-[10px]">→</span>
            </a>
            <a
              href="/faculties/"
              className="text-gray-600 hover:text-gray-900 font-semibold hover:underline flex items-center gap-1"
            >
              <span>👨‍🏫 Faculties</span>
              <span className="text-[10px]">→</span>
            </a>
          </div>
        </div>
      ) : (
        /* Minimized Floating Pill Button */
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2 px-3 py-2 bg-white/95 hover:bg-white text-gray-800 hover:text-[#0056D2] rounded-full border border-gray-200/90 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer backdrop-blur-md"
          title="Open page quick navigation"
          aria-label="Open page quick navigation"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0056D2]" />
          </span>
          <span className="text-xs font-bold tracking-tight">Navigation</span>
          <svg
            className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#0056D2] transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
      )}
    </aside>
  );
}
