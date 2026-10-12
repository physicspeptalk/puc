import { useState, useEffect } from "react";
import { siteConfig, buildWhatsAppUrl } from "../config/siteConfig";
import peptalkLogo from "../assets/peptalklogo.png";
import { useSheetConfig } from "../context/SheetConfigContext";
import { useTheme } from "../context/ThemeContext";
import { useExam } from "../context/ExamContext";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { testimonials, loading, counsellingBatchUrl, headerTagline, comdekTagline } = useSheetConfig();
  const { theme, toggleTheme } = useTheme();
  const { exam } = useExam();

  // Pick the correct tagline based on exam
  // For COMEDK: use comdekTagline from sheet if set, else fallback
  // For KCET: use headerTagline from sheet (same as existing behaviour)
  const displayTagline =
    exam === "COMEDK"
      ? (comdekTagline || `COMEDK ${new Date().getFullYear() + 1} Counselling`)
      : (headerTagline || siteConfig.headerTagline);

  // Hide the Testimonials nav link until we know there are videos
  const hasTestimonials = !loading && testimonials.length > 0;
  const navLinks = siteConfig.navLinks.filter(
    (link) => link.href !== "#testimonials" || hasTestimonials
  );

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        scrolled
          ? "bg-white dark:bg-gray-900 shadow-md dark:shadow-gray-800/50"
          : "bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
      }`}
      role="banner"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Brand */}
          <a
            href="#home"
            className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
            aria-label={`${siteConfig.brandName} — Home`}
          >
            <img
              src={peptalkLogo}
              alt="Physics Pep Talk Logo"
              className="h-10 w-10 md:h-12 md:w-12"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-brand-800 dark:text-brand-200 font-bold text-lg leading-tight">
                {siteConfig.brandName}
              </span>
              <span className="text-brand-500 dark:text-brand-400 text-xs font-medium tracking-wide">
                {displayTagline}
              </span>
            </div>
          </a>

          {/* Desktop nav */}
          <nav
            className="hidden md:flex items-center gap-6"
            aria-label="Main navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-300 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 rounded"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA + theme toggle */}
          <div className="hidden md:flex items-center gap-3">
            {/* Dark mode toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {theme === "dark" ? (
                /* Sun icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71M17.66 17.66l-.71-.71M6.34 6.34l-.71-.71M12 5a7 7 0 100 14A7 7 0 0012 5z" />
                </svg>
              ) : (
                /* Moon icon */
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            <a
              href={counsellingBatchUrl || "#contact"}
              {...(counsellingBatchUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900"
            >
              Get Counselling
            </a>
          </div>

          {/* Mobile: theme toggle + hamburger */}
          <div className="md:hidden flex items-center gap-1">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
            >
              {theme === "dark" ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M12 3v1m0 16v1m8.66-9h-1M4.34 12h-1m15.07-6.07-.71.71M6.34 17.66l-.71.71M17.66 17.66l-.71-.71M6.34 6.34l-.71-.71M12 5a7 7 0 100 14A7 7 0 0012 5z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-lg"
        >
          <nav
            className="flex flex-col px-4 py-3 gap-1"
            aria-label="Mobile navigation"
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={handleNavClick}
                className="py-2.5 px-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-gray-800 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-2 pb-1">
              <a
                href={buildWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 bg-brand-700 hover:bg-brand-800 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-colors w-full focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                Get Counselling Guidance
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
