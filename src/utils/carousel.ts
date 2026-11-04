import type { Course } from "../services/courseService";

export const HERO_SLIDE_DURATION_MS = 5000;

export const DEFAULT_FALLBACK_COURSES: Course[] = [
  {
    courseUrl: "https://physicspeptalk.teachx.in/courses/1-puc-boards-plus-kcet-combo-course-physics-chemistry-mathematics-pcm-1721017042858",
    thumbnailUrl: "",
    description: "KCET 2027 PCM Fastrack Batch & Comprehensive Board Prep",
  },
  {
    courseUrl: "https://counselling.physicspeptalk.com/kcet/",
    thumbnailUrl: "",
    description: "Dhrona 2027 KCET & COMEDK Counselling & Seat Selection Mentorship",
  },
  {
    courseUrl: "https://physicspeptalk.teachx.in/courses/kcet-full-syllabus-test-series-previous-year-questions-solution-keys-669528d7ee22fa64c5026b42",
    thumbnailUrl: "",
    description: "2nd PUC Physics NCERT Mastery with Shortcut Tricks & Marathon Derivations",
  },
];

export interface BannerTheme {
  bg: string;
  glow: string;
  border: string;
  badgeBg: string;
  subBadgeBg: string;
  btnClass: string;
}

export const THEMES: BannerTheme[] = [
  {
    // Theme 0: Coursera Plus signature royal blue
    bg: "bg-gradient-to-br from-[#00255D] via-[#00388D] to-[#0056D2]",
    glow: "bg-blue-400/10",
    border: "border-blue-400/20",
    badgeBg: "bg-white/20 text-white backdrop-blur-md",
    subBadgeBg: "bg-amber-400 text-slate-900 font-bold",
    btnClass: "text-[#0056D2] bg-white hover:bg-blue-50",
  },
  {
    // Theme 1: Coursera Dark Premium Slate
    bg: "bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A]",
    glow: "bg-purple-500/10",
    border: "border-white/10",
    badgeBg: "bg-purple-500/20 text-purple-300 border border-purple-500/30",
    subBadgeBg: "bg-purple-400 text-slate-900 font-bold",
    btnClass: "text-neutral-900 bg-white hover:bg-neutral-100",
  },
  {
    // Theme 2: Deep Sapphire / Cyan
    bg: "bg-gradient-to-br from-[#08203E] via-[#0D3B66] to-[#004E92]",
    glow: "bg-cyan-400/10",
    border: "border-cyan-400/20",
    badgeBg: "bg-cyan-400/20 text-cyan-200 border border-cyan-400/30",
    subBadgeBg: "bg-cyan-400 text-slate-900 font-bold",
    btnClass: "text-[#0D3B66] bg-white hover:bg-cyan-50",
  },
  {
    // Theme 3: Deep Royal Purple
    bg: "bg-gradient-to-br from-[#1C1033] via-[#2E185C] to-[#4C1D95]",
    glow: "bg-fuchsia-400/10",
    border: "border-fuchsia-400/20",
    badgeBg: "bg-fuchsia-400/20 text-fuchsia-200 border border-fuchsia-400/30",
    subBadgeBg: "bg-amber-400 text-slate-900 font-bold",
    btnClass: "text-[#4C1D95] bg-white hover:bg-fuchsia-50",
  },
  {
    // Theme 4: Forest Emerald
    bg: "bg-gradient-to-br from-[#062C24] via-[#0B4D3C] to-[#0D6B53]",
    glow: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    badgeBg: "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30",
    subBadgeBg: "bg-emerald-400 text-slate-900 font-bold",
    btnClass: "text-[#0B4D3C] bg-white hover:bg-emerald-50",
  },
];

export interface CourseCardDetails {
  title: string;
  subtitle: string;
  badge: string;
  subBadge: string;
  tag: string;
  ctaText: string;
  statsText: string;
  themeIndex: number;
}

export function getCourseDetails(course: Course | null, index: number): CourseCardDetails {
  if (!course) {
    return {
      title: "KCET 2027 PCM Fastrack Batch",
      subtitle:
        "Master 1st & 2nd PUC Physics, Chemistry, and Mathematics with syllabus-aligned lessons, shortcut tricks, and full test series.",
      badge: "Physics Pep Talk PLUS",
      subBadge: "2027 Admissions",
      tag: "Fastrack 2027",
      ctaText: "Enroll now",
      statsText: "5,000+ Enrolled Students",
      themeIndex: index % THEMES.length,
    };
  }

  const desc = course.description.trim() || "PUC & KCET Excellence Program";
  const descLower = desc.toLowerCase();

  const isCounselling =
    descLower.includes("counselling") ||
    descLower.includes("choice") ||
    descLower.includes("seat") ||
    descLower.includes("comedk");
  const isBoards =
    descLower.includes("board") ||
    descLower.includes("puc") ||
    descLower.includes("ncert");
  const isKcet =
    descLower.includes("kcet") ||
    descLower.includes("fastrack");

  let badge = "Physics Pep Talk PLUS";
  let subBadge = "2027 Admissions";
  let subtitle =
    "Master 1st & 2nd PUC Physics, Chemistry, and Mathematics with syllabus-aligned lessons, shortcut tricks, and full test series.";
  let tag = "Fastrack 2027";
  let ctaText = "Enroll now";
  let statsText = "5,000+ Students Enrolled";

  if (isCounselling) {
    badge = "⭐ Counselling Series";
    subBadge = "KCET & COMEDK";
    subtitle =
      "Comprehensive step-by-step guidance for engineering option entry, college cut-offs, branch priorities, and round-by-round seat selection.";
    tag = "Dhrona 2027";
    ctaText = "Get started";
    statsText = "1,000+ Students Mentored";
  } else if (isBoards) {
    badge = "NCERT Boards Series";
    subBadge = "Karnataka PUC";
    subtitle =
      "Master core theory derivations, numerical problem solving, blueprint analysis, and board-scoring shortcuts with expert faculty.";
    tag = "Board Exam Booster";
    ctaText = "Enroll now";
    statsText = "Top Board Scoring Track";
  } else if (isKcet) {
    badge = "KCET Fastrack Masterclass";
    subBadge = "Speed & Shortcuts";
    subtitle =
      "Fastrack problem-solving shortcuts, PYQs from 2014-2026, and timed mock test papers to secure top Karnataka engineering ranks.";
    tag = "High Rank Target";
    ctaText = "Join Fastrack";
    statsText = "Karnataka Top Ranks";
  }

  return {
    title: desc,
    subtitle,
    badge,
    subBadge,
    tag,
    ctaText,
    statsText,
    themeIndex: ((index % THEMES.length) + THEMES.length) % THEMES.length,
  };
}

export interface CarouselDimensions {
  gap: number;
  slideWidth: number;
  centerOffset: number;
  peekWidth: number;
}

export function calculateCarouselDimensions(containerWidth: number): CarouselDimensions {
  if (containerWidth <= 0) {
    return { gap: 16, slideWidth: 0, centerOffset: 0, peekWidth: 0 };
  }

  // Desktop (>= 1024px): 2 banners visible side-by-side
  // Phone / Tablet (< 1024px): 1 banner visible
  const isDesktop = containerWidth >= 1024;
  const gap = isDesktop ? 20 : 16;

  const slideWidth = isDesktop
    ? Math.floor((containerWidth - gap) / 2)
    : containerWidth;

  return {
    gap,
    slideWidth,
    centerOffset: 0,
    peekWidth: 0,
  };
}

export function calculateTrackTranslateX({
  centerOffset = 0,
  slideWidth,
  gap,
  currentIndex,
  dragOffset = 0,
}: {
  centerOffset?: number;
  slideWidth: number;
  gap: number;
  currentIndex: number;
  dragOffset?: number;
}): number {
  if (slideWidth <= 0) return 0;
  return centerOffset - (currentIndex - 1) * (slideWidth + gap) + dragOffset;
}

export function getExtendedSlides(courses: Course[]): Course[] {
  if (courses.length <= 1) return courses;
  return [
    courses[courses.length - 1],
    ...courses,
    courses[0],
    courses[1 % courses.length],
  ];
}

export function normalizeActiveIndex(currentIndex: number, totalCourses: number): number {
  if (totalCourses <= 0) return 0;
  if (totalCourses === 1) return 0;
  return ((currentIndex - 1) % totalCourses + totalCourses) % totalCourses;
}
