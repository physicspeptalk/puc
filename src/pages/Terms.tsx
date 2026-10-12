import { useEffect } from "react";
import { siteConfig } from "../config/siteConfig";

/**
 * Redirects to the Terms & Disclaimer on the parent site (physicspeptalk.com).
 * This site does not host its own terms page.
 */
export default function Terms() {
  useEffect(() => {
    window.location.replace(siteConfig.termsUrl);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500 text-sm">
        Redirecting to Terms &amp; Disclaimer…{" "}
        <a
          href={siteConfig.termsUrl}
          className="text-brand-600 hover:underline"
        >
          Click here if you are not redirected.
        </a>
      </p>
    </div>
  );
}
