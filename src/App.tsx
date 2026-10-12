import Header from "./components/Header";
import Hero from "./components/Hero";
import Services from "./components/Services";
import HowItWorks from "./components/HowItWorks";
import OptionEntry from "./components/OptionEntry";
import WhatYouGet from "./components/WhatYouGet";
import TrustSection from "./components/TrustSection";
import RoundSupport from "./components/RoundSupport";
import FAQ from "./components/FAQ";
import Contact from "./components/Contact";
import FinalCTA from "./components/FinalCTA";
import Footer from "./components/Footer";
import MobileCTA from "./components/MobileCTA";
import Testimonials from "./components/Testimonials";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import KcetPredictor from "./components/KcetPredictor/KcetPredictor";
import KcetPredictorWidget from "./components/KcetPredictorWidget";
import { SheetConfigProvider } from "./context/SheetConfigContext";
import { ExamProvider } from "./context/ExamContext";
import type { ExamType } from "./config/siteConfig";

/**
 * Detect the current page from the URL path.
 *
 * /kcet/                   → exam page (KCET)
 * /comedk/                 → exam page (COMEDK)
 * /privacy-policy          → privacy page
 * /terms                   → terms page
 * /kcet-college-predictor  → KCET college predictor page
 * (anything else)          → 404 not found
 *
 * GitHub Pages serves each path from its own HTML entry point
 * (kcet/index.html, comedk/index.html, privacy-policy.html, terms.html),
 * so direct URL access and browser refresh both work without any server
 * fallback configuration.
 */
function detectPage():
  | { type: "exam"; exam: ExamType }
  | { type: "privacy" | "terms" | "kcet-predictor" | "notfound" } {
  const path = window.location.pathname;

  // Normalise: strip trailing slash for comparison
  const normalised = path.replace(/\/$/, "");

  if (normalised === "/privacy-policy") return { type: "privacy" };
  if (normalised === "/terms") return { type: "terms" };
  if (normalised.startsWith("/kcet-college-predictor")) return { type: "kcet-predictor" };
  if (normalised.startsWith("/comedk")) return { type: "exam", exam: "COMEDK" };
  if (normalised.startsWith("/kcet") || normalised === "") return { type: "exam", exam: "KCET" };

  // The 404.html entry is served by GitHub Pages for any unknown path.
  // When it boots, we show the NotFound component instead of the main page.
  return { type: "notfound" };
}

/**
 * Main landing page layout — shared by both KCET and COMEDK.
 * Wrapped in SheetConfigProvider and ExamProvider so all children
 * can read remote config and the current exam type.
 */
function CounsellingPage({ exam }: { exam: ExamType }) {
  return (
    <ExamProvider exam={exam}>
      <SheetConfigProvider>
        <div className="min-h-screen bg-white pb-14 md:pb-0">
          {/* Fixed sticky header */}
          <Header />

          {/* Main content */}
          <main id="main-content">
            <Hero />
            <Contact />
            <Testimonials />
            <Services />
            <HowItWorks />
            <OptionEntry />
            <WhatYouGet />
            <TrustSection />
            <RoundSupport />
            <FAQ />
            <FinalCTA />
          </main>

          <Footer />

          {/* Fixed mobile bottom CTA bar (hidden on md+) */}
          <MobileCTA />

          {/* Floating KCET College Predictor widget */}
          <KcetPredictorWidget />
        </div>
      </SheetConfigProvider>
    </ExamProvider>
  );
}

export default function App() {
  const page = detectPage();

  if (page.type === "privacy") return <PrivacyPolicy />;
  if (page.type === "terms") return <Terms />;
  if (page.type === "notfound") return <NotFound />;
  if (page.type === "kcet-predictor") return <KcetPredictor />;

  // At this point TypeScript knows page.type === "exam"
  const exam = page.type === "exam" ? page.exam : "KCET";
  return <CounsellingPage exam={exam} />;
}
