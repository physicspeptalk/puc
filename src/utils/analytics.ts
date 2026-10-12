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
    // Silently ignore if GA4 is blocked or not loaded
  }
}

// ─── Engagement ───────────────────────────────────────────────────────────────

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

// ─── Dark mode ────────────────────────────────────────────────────────────────

export function trackDarkModeToggle(newMode: "dark" | "light") {
  safeGtag("dark_mode_toggle", { event_category: "ui", event_label: newMode });
}

// ─── Courses carousel ────────────────────────────────────────────────────────

export function trackCarouselNav(direction: "prev" | "next" | "dot", slideIndex?: number) {
  safeGtag("carousel_navigate", {
    event_category: "engagement",
    event_label: direction,
    ...(slideIndex !== undefined ? { slide_index: String(slideIndex) } : {}),
  });
}

// ─── Student feedback videos ─────────────────────────────────────────────────

export function trackVideoPlay(caption: string) {
  safeGtag("video_play", { event_category: "engagement", event_label: caption.slice(0, 100) });
}

// ─── Blog navigation ─────────────────────────────────────────────────────────

export function trackBlogArticleOpen(slug: string, title: string) {
  safeGtag("blog_article_open", { event_category: "content", event_label: slug, blog_title: title.slice(0, 100) });
}

export function trackBlogDropdownOpen() {
  safeGtag("blog_dropdown_open", { event_category: "navigation", event_label: "header_dropdown" });
}

export function trackBlogViewAll(source: string) {
  safeGtag("blog_view_all", { event_category: "navigation", event_label: source });
}

// ─── Page views (for blog pages rendered as SPAs without full page reload) ───

export function trackPageView(path: string, title: string) {
  safeGtag("page_view", { event_category: "navigation", page_path: path, page_title: title });
}
