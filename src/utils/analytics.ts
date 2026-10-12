/**
 * GA4 event tracking helpers.
 *
 * Rules:
 * - Never send PII (names, phone numbers, email addresses, form content).
 * - Use descriptive event names meaningful to the counselling business.
 * - All parameters are safe, non-identifying labels.
 */

declare function gtag(...args: unknown[]): void;

function safeGtag(event: string, params: Record<string, string>) {
  try {
    if (typeof gtag !== "undefined") {
      gtag("event", event, params);
    }
  } catch {
    // Silently ignore if GA4 is blocked by an ad-blocker
  }
}

/** User clicked a WhatsApp button */
export function trackWhatsAppClick(location: string) {
  safeGtag("whatsapp_click", { event_category: "engagement", event_label: location });
}

/** User clicked a Call button */
export function trackCallClick(location: string) {
  safeGtag("call_click", { event_category: "engagement", event_label: location });
}

/** User clicked a primary CTA (enrol / counselling batch) */
export function trackCTAClick(label: string) {
  safeGtag("cta_click", { event_category: "engagement", event_label: label });
}

/** User clicked an external link (e.g. parent website) */
export function trackExternalLink(destination: string) {
  safeGtag("external_link_click", { event_category: "navigation", event_label: destination });
}
