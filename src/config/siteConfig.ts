/**
 * Central configuration for the counselling website.
 * All configurable values live here — do NOT duplicate them across components.
 *
 * This file supports both /kcet/ and /comedk/ pages.
 * The exam-specific content is determined at runtime via ExamContext.
 */

export type ExamType = "KCET" | "COMEDK";

export const siteConfig = {
  /** Brand name shown in header and footer */
  brandName: "Physics Pep Talk",

  /** Short tagline shown in header subtitle — patched by Google Sheet for KCET */
  headerTagline: "KCET 2027 Counselling",

  /** Production base URL (used for canonical, OG, sitemap) */
  websiteBaseUrl: "https://counselling.physicspeptalk.com",

  /** KCET-specific URL */
  kcetUrl: "https://counselling.physicspeptalk.com/kcet/",

  /** COMEDK-specific URL */
  comdekUrl: "https://counselling.physicspeptalk.com/comedk/",

  /** Parent brand website */
  parentWebsite: "https://physicspeptalk.com",

  /** YouTube — main Physics Pep Talk channel */
  youtubeMainUrl: "https://youtube.com/@physicspeptalk",

  /** YouTube — KCET / CET counselling info channel */
  youtubeKcetUrl: "https://youtube.com/@peptalkinfokcet",

  /** Instagram */
  instagramUrl: "https://www.instagram.com/physics_pep_talk",

  /** Privacy Policy URL (hosted on parent site) */
  privacyPolicyUrl: "https://physicspeptalk.com/privacy-policy",

  /** Terms & Disclaimer URL (hosted on parent site) */
  termsUrl: "https://physicspeptalk.com/terms",

  /**
   * WhatsApp number in international format WITHOUT + or spaces.
   * Example: "919876543210" for +91 98765 43210
   */
  whatsappNumber: "9986555819",

  /** Phone number for tel: links */
  phoneNumber: "9986555819",

  /** Contact email */
  email: "Physicspeptalk@gmail.com",

  /** Google Analytics 4 Measurement ID */
  ga4MeasurementId: "G-LSBBH9XZ5X",

  /** Default WhatsApp message pre-filled when user clicks WhatsApp buttons */
  whatsappDefaultMessage:
    "Hi, I am interested in KCET 2027 counselling guidance. I would like to know about the counselling package and pricing.",

  /** COMEDK-specific WhatsApp default message */
  comdekWhatsappDefaultMessage:
    "Hi, I am interested in COMEDK 2027 counselling guidance. I would like to know about the counselling package and pricing.",

  /** SEO for KCET page */
  seo: {
    title: "KCET 2027 Counselling Guidance | College Selection & Option Entry",
    description:
      "Get KCET 2027 counselling guidance for college and branch selection, option entry, choice filling and seat allotment. Get support throughout the KCET counselling process.",
    ogImage:
      "https://counselling.physicspeptalk.com/images/og-image.png",
    targetTopics: [
      "KCET 2027 counselling",
      "KCET counselling 2027",
      "KCET 2027 counselling guidance",
      "KCET counselling guidance",
      "KCET counselling help",
      "KCET option entry",
      "KCET option entry 2027",
      "KCET option entry guidance",
      "KCET choice filling",
      "KCET choice filling 2027",
      "KEA option entry",
      "KEA choice filling",
      "KCET college selection",
      "KCET college selection 2027",
      "KCET branch selection",
      "KCET branch selection guidance",
      "KCET seat allotment",
      "KCET seat allotment 2027",
      "KCET document verification",
      "KCET documents required",
      "KCET rank analysis",
      "KCET previous year cutoff",
      "KCET closing rank",
      "KEA counselling 2027",
      "Karnataka engineering counselling",
      "Karnataka engineering admission 2027",
      "Physics Pep Talk KCET",
      "Physics Pep Talk counselling",
    ],
  },

  /** Nav links */
  navLinks: [
    { label: "Home", href: "#home" },
    { label: "Contact", href: "#contact" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "Services", href: "#services" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "FAQs", href: "#faq" },
  ],
};

/**
 * Build a WhatsApp click-to-chat URL.
 * Falls back to wa.me without a number if whatsappNumber is empty (opens WhatsApp).
 */
export function buildWhatsAppUrl(message?: string, exam?: ExamType): string {
  const num = siteConfig.whatsappNumber;
  const defaultMsg =
    exam === "COMEDK"
      ? siteConfig.comdekWhatsappDefaultMessage
      : siteConfig.whatsappDefaultMessage;
  const text = encodeURIComponent(message ?? defaultMsg);
  if (!num) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${num}?text=${text}`;
}

/**
 * Build a tel: URL. Returns "#" if phoneNumber is empty.
 */
export function buildPhoneUrl(): string {
  if (!siteConfig.phoneNumber) return "#";
  return `tel:${siteConfig.phoneNumber}`;
}