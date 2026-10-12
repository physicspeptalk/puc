/**
 * SheetConfigContext.tsx
 *
 * Fetches remote config from Google Sheets and:
 *  1. Exposes values via useSheetConfig() hook
 *  2. Patches siteConfig in-place so every existing component that reads
 *     siteConfig.phoneNumber / .whatsappNumber / .email etc. automatically
 *     gets the live value — no changes needed in those components.
 *
 * Sheet tab: "config" (gid=0)
 * Format:  Column A = variable name (lowercase),  Column B = value
 *
 * Variable names in your sheet:
 * ┌──────────────────────────┬─────────────────────────────────────────────┐
 * │ Variable name (col A)    │ What it controls                            │
 * ├──────────────────────────┼─────────────────────────────────────────────┤
 * │ year                     │ Counselling year shown everywhere (e.g. 2027)│
 * │ whatsappnumber           │ WhatsApp number, no + or spaces (919xxxxxxx)│
 * │ phonenumber              │ Phone number shown in UI (e.g. 9986555819)  │
 * │ email                    │ Contact email address                       │
 * │ brandname                │ Brand name in header/footer                 │
 * │ headertagline            │ KCET tagline under logo in header           │
 * │ counsellingbatchurl      │ Enrol button link                           │
 * │ counsellingbatchthumbnail│ Batch thumbnail image URL                   │
 * │ comedk_tagline           │ COMEDK tagline under logo in header (NEW)   │
 * └──────────────────────────┴─────────────────────────────────────────────┘
 *
 * The new comedk_tagline variable is ADDITIVE — the existing KCET site
 * continues to work as-is because the parser is forward-compatible with
 * unknown keys (it just stores them in the config map).
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { fetchSheetConfig, type SheetConfig } from "../utils/sheetConfig";
import { fetchTestimonials, type Testimonial } from "../utils/testimonialsConfig";
import { siteConfig } from "../config/siteConfig";

// ─── Defaults (fallback when sheet is unavailable) ────────────────────────────
const DEFAULTS: SheetConfig = {
  year: "2027",
  whatsappnumber: siteConfig.whatsappNumber,
  phonenumber: siteConfig.phoneNumber,
  email: siteConfig.email,
  brandname: siteConfig.brandName,
  headertagline: siteConfig.headerTagline,
  counsellingbatchurl: "",
  counsellingbatchthumbnail: "",
  // comedk_tagline is intentionally not set in defaults so it can be
  // distinguished from "not loaded yet" vs "set in sheet".
  // Components will fall back gracefully when it is absent.
};

// ─── Patch siteConfig with live sheet values ──────────────────────────────────
// Called once after the sheet fetch resolves. Components that already read
// siteConfig.* will re-render because the provider state update triggers them.
function patchSiteConfig(remote: SheetConfig) {
  if (remote.whatsappnumber)   siteConfig.whatsappNumber  = remote.whatsappnumber;
  if (remote.phonenumber)      siteConfig.phoneNumber     = remote.phonenumber;
  if (remote.email)            siteConfig.email           = remote.email;
  if (remote.brandname)        siteConfig.brandName       = remote.brandname;
  if (remote.headertagline)    siteConfig.headerTagline   = remote.headertagline;
  // comedk_tagline is NOT patched into siteConfig — it is consumed directly
  // from the context by COMEDK-specific logic (see Header, Hero etc.)
}

// ─── Context shape ────────────────────────────────────────────────────────────

interface SheetConfigState {
  /** Raw merged config map (sheet values + defaults) */
  config: SheetConfig;
  /** Counselling year string (e.g. "2027") */
  year: string;
  /** Batch enrolment URL */
  counsellingBatchUrl: string;
  /** Batch thumbnail image URL */
  counsellingBatchThumbnail: string;
  /** KCET tagline (from headertagline in sheet) */
  headerTagline: string;
  /**
   * COMEDK tagline loaded from the "comedk_tagline" variable in gid=0.
   * Empty string if not set in the sheet — callers should fall back to
   * a sensible default in that case.
   */
  comdekTagline: string;
  /** Testimonial videos from the testimonials sheet tab */
  testimonials: Testimonial[];
  /** True while the initial fetch is in-flight */
  loading: boolean;
  /** Non-null if the fetch failed (app still works via defaults) */
  error: Error | null;
}

const SheetConfigContext = createContext<SheetConfigState>({
  config: DEFAULTS,
  year: DEFAULTS.year,
  counsellingBatchUrl: "",
  counsellingBatchThumbnail: "",
  headerTagline: DEFAULTS.headertagline,
  comdekTagline: "",
  testimonials: [],
  loading: true,
  error: null,
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SheetConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SheetConfig>(DEFAULTS);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [remote, testimonialsData] = await Promise.all([
          fetchSheetConfig(),
          fetchTestimonials(),
        ]);
        if (!cancelled) {
          const merged = { ...DEFAULTS, ...remote };
          // Patch siteConfig so existing components get live values automatically
          patchSiteConfig(merged);
          setConfig(merged);
          setTestimonials(testimonialsData);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error(String(err)));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const value: SheetConfigState = {
    config,
    year:                       config.year                    ?? DEFAULTS.year,
    counsellingBatchUrl:        config.counsellingbatchurl     ?? "",
    counsellingBatchThumbnail:  config.counsellingbatchthumbnail ?? "",
    headerTagline:              config.headertagline           ?? DEFAULTS.headertagline,
    // comedk_tagline is the new variable — read it directly from the config map
    // (key as stored by the parser, which lowercases it: "comedk_tagline")
    comdekTagline:              config["comedk_tagline"]       ?? "",
    testimonials,
    loading,
    error,
  };

  return (
    <SheetConfigContext.Provider value={value}>
      {children}
    </SheetConfigContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useSheetConfig(): SheetConfigState {
  return useContext(SheetConfigContext);
}
