import { buildWhatsAppUrl } from "../config/siteConfig";
import { trackWhatsAppClick, trackCTAClick } from "../utils/analytics";
import { useSheetConfig } from "../context/SheetConfigContext";
import { useExam } from "../context/ExamContext";

const examContent = {
  KCET: {
    badge: (year: string) => `KCET ${year} Counselling Guidance`,
    heading: (year: string) => (
      <>
        KCET {year} Counselling Guidance —{" "}
        <span className="text-accent-400">Make the Most of Your Rank</span>
      </>
    ),
    subheading:
      "One-on-one personalised guidance for option entry, college & branch selection — built around your rank, category, and priorities. We follow up with you through every round until you get a good seat.",
    trustLine:
      "Option entry based on previous-year seat matrix data. PCM teaching for Boards & KCET included at zero extra cost. Limited seats only.",
    honestMessage:
      "Seat allotment is solely by KEA. We guide you to make the smartest possible choice — honestly, without false promises.",
    ctaLabel: "Get Counselling Guidance",
    stats: [
      { value: "1-on-1", label: "Personalised Guidance" },
      { value: "Limited", label: "Seats Available" },
      { value: "Zero Cost", label: "PCM Boards + KCET teaching" },
    ],
  },
  COMEDK: {
    badge: (year: string) => `COMEDK ${year} Counselling Guidance`,
    heading: (year: string) => (
      <>
        COMEDK {year} Counselling Guidance —{" "}
        <span className="text-accent-400">Make the Most of Your Rank</span>
      </>
    ),
    subheading:
      "One-on-one personalised guidance for choice filling, college & branch selection — built around your COMEDK rank, category, and priorities. We support you through every round until you secure a good seat.",
    trustLine:
      "Choice filling based on previous-year seat data. PCM teaching for Boards & COMEDK included at zero extra cost. Limited seats only.",
    honestMessage:
      "Seat allotment is solely by COMEDK authority. We guide you to make the smartest possible choice — honestly, without false promises.",
    ctaLabel: "Get Counselling Guidance",
    stats: [
      { value: "1-on-1", label: "Personalised Guidance" },
      { value: "Limited", label: "Seats Available" },
      { value: "Zero Cost", label: "PCM Boards + COMEDK teaching" },
    ],
  },
} as const;

export default function Hero() {
  const { year, counsellingBatchUrl } = useSheetConfig();
  const { exam } = useExam();
  const content = examContent[exam];

  return (
    <section
      id="home"
      className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 dark:from-gray-950 dark:via-gray-900 dark:to-gray-800 text-white pt-28 pb-20 md:pt-36 md:pb-28 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" aria-hidden="true">
        <svg width="100%" height="100%">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-brand-700/60 border border-brand-500/40 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" aria-hidden="true"></span>
            <span className="text-sm font-medium text-brand-200">
              {content.badge(year)}
            </span>
          </div>

          {/* Main heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6">
            {content.heading(year)}
          </h1>

          {/* Subheading */}
          <p className="text-lg md:text-xl text-brand-200 leading-relaxed mb-4 max-w-2xl">
            {content.subheading}
          </p>

          {/* Trust line */}
          <p className="text-brand-300 text-sm md:text-base mb-8 max-w-xl">
            {content.trustLine}
          </p>

          {/* Honest message */}
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-5 py-3 mb-10">
            <p className="text-brand-100 text-sm md:text-base font-medium">
              {content.honestMessage}
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={counsellingBatchUrl || "#contact"}
              {...(counsellingBatchUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              onClick={() => trackCTAClick(`hero_get_guidance_${exam.toLowerCase()}`)}
              className="inline-flex items-center justify-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              {content.ctaLabel}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href={buildWhatsAppUrl(undefined, exam)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackWhatsAppClick(`hero_${exam.toLowerCase()}`)}
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand-900"
            >
              {/* WhatsApp icon */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              WhatsApp Us
            </a>
          </div>
        </div>

        {/* Stats strip */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl">
          {content.stats.map((stat) => (
            <div key={stat.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{stat.value}</span>
              <span className="text-sm text-brand-300">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
