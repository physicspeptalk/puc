/**
 * Central configuration for puc.physicspeptalk.com
 * All configurable values live here — do NOT duplicate them across components.
 */

// ─── Site identity ──────────────────────────────────────────────────────────

export const siteConfig = {
  brandName: "Physics Pep Talk",
  tagline: "KCET & Board Preparation",
  siteUrl: "https://puc.physicspeptalk.com",
  parentWebsite: "https://physicspeptalk.com",
  blogUrl: "" as string, // MISSING — set when available

  // Social
  instagramUrl: "https://www.instagram.com/physics_pep_talk",
  youtubeMainUrl: "https://youtube.com/@physicspeptalk",
  youtubeKcetUrl: "https://youtube.com/@peptalkinfokcet",

  // Contact
  whatsappNumber: "9986555819",
  phoneNumber: "9986555819",
  email: "Physicspeptalk@gmail.com",

  // Legal
  privacyPolicyUrl: "https://physicspeptalk.com/privacy-policy",
  termsUrl: "https://physicspeptalk.com/terms",

  // Analytics
  ga4MeasurementId: "G-LSBBH9XZ5X",

  // WhatsApp enquiry message
  whatsappMessage:
    "Hi, I am interested in Physics Pep Talk PUC courses and resources. Please share more details.",
};

// ─── Navigation ─────────────────────────────────────────────────────────────

export const navLinks = [
  { label: "Courses", href: "#courses" },
  { label: "YouTube", href: "#youtube" },
  { label: "Feedback", href: "#feedback" },
  { label: "Faculties", href: "/faculties/" },
  { label: "Contact", href: "#contact" },
  { label: "Main Website", href: "https://physicspeptalk.com", external: true },
  { label: "Instagram", href: "https://www.instagram.com/physics_pep_talk", external: true },
] as const;

// ─── YouTube channels ────────────────────────────────────────────────────────

export interface YouTubeChannel {
  id: string;
  name: string;
  handle: string;
  url: string;
  description: string;
}

export const youtubeChannels: YouTubeChannel[] = [
  {
    id: "physicspeptalk",
    name: "Physics Pep Talk",
    handle: "physicspeptalk",
    url: "https://www.youtube.com/@physicspeptalk",
    description:
      "Physics, Chemistry & Mathematics lessons, PUC board exam preparation and KCET, concept explanations, and educational resources for students preparing for board exams and competitive entrances.",
  },
  {
    id: "peptalkinfokcet",
    name: "Pep Talk Info KCET",
    handle: "peptalkinfokcet",
    url: "https://www.youtube.com/@peptalkinfokcet",
    description:
      "KCET and COMEDK exam guidance, counselling insights, college selection tips, and tried-and-tested strategies to help you secure a better engineering college in Karnataka.",
  },
];

// ─── Course category blocks ──────────────────────────────────────────────────

export interface CategoryBlock {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  description: string;
  ctaLabel: string;
  ctaUrl: string;
}

export const categoryBlocks: CategoryBlock[] = [
  {
    id: "puc-board",
    emoji: "📚",
    title: "PUC / Board Courses",
    subtitle: "First & Second PUC",
    description:
      "Comprehensive PUC board exam preparation. Structured PCM lessons and revision materials aligned to the Karnataka syllabus.",
    ctaLabel: "Explore Board Courses",
    ctaUrl: "https://physicspeptalk.com",
  },
  {
    id: "cet-comedk",
    emoji: "🏆",
    title: "KCET / COMEDK",
    subtitle: "Competitive Entrance Preparation",
    description:
      "Targeted preparation for KCET and COMEDK entrance exams. Physics, Chemistry, and Mathematics with exam-focused practice and strategy.",
    ctaLabel: "Explore KCET / COMEDK Courses",
    ctaUrl: "https://physicspeptalk.com",
  },
  {
    id: "counselling",
    emoji: "🧭",
    title: "Counselling Guidance",
    subtitle: "KCET & COMEDK Admissions",
    description:
      "Personalised KCET and COMEDK counselling — college selection, branch selection, option entry, and choice filling, round by round.",
    ctaLabel: "Explore Counselling",
    ctaUrl: "https://counselling.physicspeptalk.com/kcet/",
  },
];

// ─── Utility functions ───────────────────────────────────────────────────────

export function buildWhatsAppUrl(message?: string): string {
  const num = siteConfig.whatsappNumber;
  const text = encodeURIComponent(message ?? siteConfig.whatsappMessage);
  if (!num) return `https://wa.me/?text=${text}`;
  return `https://wa.me/${num}?text=${text}`;
}

export function buildPhoneUrl(): string {
  if (!siteConfig.phoneNumber) return "#";
  return `tel:${siteConfig.phoneNumber}`;
}
