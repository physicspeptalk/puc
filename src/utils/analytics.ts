/**
 * GA4 event tracking helpers.
 * Never sends PII — only descriptive labels.
 */

declare function gtag(...args: unknown[]): void;

function safeGtag(event: string, params: Record<string, string>) {
  try {
    if (typeof gtag !== "undefined") {
      gtag("event", event, params);
    }
  } catch {
    // Silently ignore if GA4 is blocked
  }
}

export function trackWhatsAppClick(location: string) {
  safeGtag("whatsapp_click", { event_category: "engagement", event_label: location });
}

export function trackCallClick(location: string) {
  safeGtag("call_click", { event_category: "engagement", event_label: location });
}

export function trackCTAClick(label: string) {
  safeGtag("cta_click", { event_category: "engagement", event_label: label });
}

export function trackExternalLink(destination: string) {
  safeGtag("external_link_click", { event_category: "navigation", event_label: destination });
}
