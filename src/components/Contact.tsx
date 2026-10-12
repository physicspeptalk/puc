import { buildWhatsAppUrl, buildPhoneUrl, siteConfig } from "../config/siteConfig";
import { trackWhatsAppClick, trackCallClick, trackCTAClick } from "../utils/analytics";
import { useSheetConfig } from "../context/SheetConfigContext";
import { useExam } from "../context/ExamContext";

export default function Contact() {
  const { year, counsellingBatchUrl, counsellingBatchThumbnail, loading } =
    useSheetConfig();
  const { exam } = useExam();

  const batchHeading =
    exam === "COMEDK"
      ? `Join the COMEDK ${year} Counselling Batch`
      : `Join the KCET ${year} Counselling Batch`;

  const batchSubheading =
    exam === "COMEDK"
      ? "Get personalised guidance for college selection, branch selection, and choice filling — from enrolment to final allotment."
      : "Get personalized guidance for college selection, branch selection, and option entry — from enrolment to final allotment.";

  const thumbnailAlt =
    exam === "COMEDK"
      ? `COMEDK ${year} Counselling Batch — Physics Pep Talk`
      : `KCET ${year} Counselling Batch — Physics Pep Talk`;

  const thumbnailLabel =
    exam === "COMEDK"
      ? `COMEDK ${year} Counselling Batch`
      : `KCET ${year} Counselling Batch`;

  return (
    <section
      id="contact"
      className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950"
      aria-label="Enrol in counselling batch"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-12">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Enrol Now
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {batchHeading}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mx-auto">
            {batchSubheading}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: batch thumbnail + enrol CTA */}
          <div className="flex flex-col items-center lg:items-start gap-6">
            {/* Thumbnail */}
            <div className="w-full rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 aspect-video flex items-center justify-center">
              {loading ? (
                /* Skeleton while sheet loads */
                <div className="w-full h-full animate-pulse bg-gray-200" />
              ) : counsellingBatchThumbnail ? (
                <>
                  <img
                    src={counsellingBatchThumbnail}
                    alt={thumbnailAlt}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="640"
                    height="360"
                    onError={(e) => {
                      const img = e.currentTarget as HTMLImageElement;
                      console.error("[Thumbnail] Image failed to load.", img.src);
                      img.style.display = "none";
                      const fallback = img.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = "flex";
                    }}
                  />
                  {/* Shown only if image URL fails to load */}
                  <div className="hidden flex-col items-center gap-3 text-gray-400 p-8">
                    <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                    </svg>
                    <span className="text-sm font-medium">{thumbnailLabel}</span>
                  </div>
                </>
              ) : (
                /* Placeholder when no thumbnail configured in sheet */
                <div className="flex flex-col items-center gap-3 text-gray-400 p-8">
                  <svg className="w-14 h-14" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.069A1 1 0 0121 8.868V15.13a1 1 0 01-1.447.899L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                  </svg>
                  <span className="text-sm font-medium">{thumbnailLabel}</span>
                </div>
              )}
            </div>

            {/* Enrol button */}
            {counsellingBatchUrl ? (
              <a
                href={counsellingBatchUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackCTAClick(`enrol_counselling_batch_${exam.toLowerCase()}`)}
                className="w-full flex items-center justify-center gap-2.5 bg-accent-500 hover:bg-accent-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400 focus-visible:ring-offset-2"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Enrol in the Counselling Batch
              </a>
            ) : (
              /* Batch link not set yet — show coming soon */
              <div className="w-full flex items-center justify-center gap-2 bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-semibold px-8 py-4 rounded-xl text-base cursor-not-allowed select-none">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Enrolment Opening Soon
              </div>
            )}

            <p className="text-xs text-gray-400 dark:text-gray-500 text-center lg:text-left leading-relaxed">
              This is a paid counselling guidance service. Enrolment link opens
              the official batch registration page. No specific college or
              branch is guaranteed.
            </p>
          </div>

          {/* Right: contact options */}
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-gray-900 dark:text-white font-bold text-xl mb-2">
                Have a question before enrolling?
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                Reach out on WhatsApp or call us directly. We'll help you
                decide if this batch is the right fit for your rank and goals.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* WhatsApp */}
              <a
                href={buildWhatsAppUrl(undefined, exam)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick(`contact_section_${exam.toLowerCase()}`)}
                className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-green-200 dark:hover:border-green-700 hover:shadow-md transition-all group"
              >
                <span className="w-11 h-11 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 flex-shrink-0 group-hover:bg-green-200 dark:group-hover:bg-green-900/60 transition-colors">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </span>
                <div>
                  <p className="text-gray-900 dark:text-white font-semibold text-sm">WhatsApp Us</p>
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {siteConfig.whatsappNumber ? `+${siteConfig.whatsappNumber}` : "Message us on WhatsApp"}
                  </p>
                </div>
                <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>

              {/* Call */}
              {siteConfig.phoneNumber && (
                <a
                  href={buildPhoneUrl()}
                  onClick={() => trackCallClick(`contact_section_${exam.toLowerCase()}`)}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-brand-200 dark:hover:border-brand-600 hover:shadow-md transition-all group"
                >
                  <span className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-400 flex-shrink-0 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/60 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">Call Us</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{siteConfig.phoneNumber}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}

              {/* Email */}
              {siteConfig.email && (
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4 shadow-sm hover:border-brand-200 dark:hover:border-brand-600 hover:shadow-md transition-all group"
                >
                  <span className="w-11 h-11 rounded-full bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-brand-700 dark:text-brand-400 flex-shrink-0 group-hover:bg-brand-200 dark:group-hover:bg-brand-900/60 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-gray-900 dark:text-white font-semibold text-sm">Email</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">{siteConfig.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
