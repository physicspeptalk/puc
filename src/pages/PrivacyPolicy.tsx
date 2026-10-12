import { useEffect } from "react";
import { siteConfig } from "../config/siteConfig";

/**
 * Redirects to the Privacy Policy on the parent site (physicspeptalk.com).
 * This site does not host its own privacy policy.
 */
export default function PrivacyPolicy() {
  useEffect(() => {
    window.location.replace(siteConfig.privacyPolicyUrl);
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <p className="text-gray-500 text-sm">
        Redirecting to Privacy Policy…{" "}
        <a
          href={siteConfig.privacyPolicyUrl}
          className="text-brand-600 hover:underline"
        >
          Click here if you are not redirected.
        </a>
      </p>
    </div>
  );
}
