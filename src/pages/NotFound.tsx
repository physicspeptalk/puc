import { siteConfig } from "../config/siteConfig";

/**
 * Custom 404 — Not Found page.
 *
 * GitHub Pages serves dist/404.html for any path it cannot resolve.
 * The 404.html entry boots this React component.
 *
 * The "Go to Home" button links to the main KCET counselling page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center">
      {/* Brand wordmark */}
      <a
        href={siteConfig.kcetUrl}
        className="mb-10 text-xl font-bold text-brand-600 hover:text-brand-700 transition-colors"
        aria-label="Go to Physics Pep Talk home"
      >
        {siteConfig.brandName}
      </a>

      {/* Error code */}
      <p className="text-8xl font-extrabold text-brand-600 leading-none select-none">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-2xl font-semibold text-gray-900">
        Page not found
      </h1>

      {/* Sub-text */}
      <p className="mt-3 max-w-sm text-gray-500 text-base">
        The page you're looking for doesn't exist or may have been moved.
      </p>

      {/* CTA */}
      <a
        href={siteConfig.kcetUrl}
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 transition-colors"
      >
        {/* Left arrow icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
          aria-hidden="true"
        >
          <path
            fillRule="evenodd"
            d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z"
            clipRule="evenodd"
          />
        </svg>
        Go to Home
      </a>
    </div>
  );
}
