import { useExam } from "../context/ExamContext";

const kcetDeliverables = [
  { title: "Rank Analysis", description: "A deep one-on-one review of your KCET rank and category to identify exactly what's within reach — and what to target — in this year's counselling." },
  { title: "College Shortlist", description: "A personalised shortlist of colleges realistically within reach, built from previous-year seat matrix data — not generic lists." },
  { title: "Branch Guidance", description: "A focused discussion on which branches suit your interests and career goals at each shortlisted college, so you're choosing a future, not just a seat." },
  { title: "Seat Matrix Analysis", description: "We use actual previous-year seat matrix data to show you closing ranks by college, branch, and category — so your option entry is grounded in real numbers." },
  { title: "Option-Entry Strategy", description: "Your priorities, our data. We build your option list together — ordered to maximise your chances of getting the best possible college for your rank." },
  { title: "Option-List Review", description: "Before you hit submit, we review your entire option list one more time to catch any gaps, ordering mistakes, or missed opportunities." },
  { title: "Round-by-Round Follow-up", description: "We stay with you through every counselling round — evaluating each allotment, advising on upgrades, and guiding you until you've confirmed a seat you're happy with." },
  { title: "PCM Teaching — Zero Extra Cost", description: "Struggling with Physics, Chemistry, or Maths for Boards or KCET? We cover PCM teaching as part of the package — at absolutely zero extra cost." },
];

const comdekDeliverables = [
  { title: "Rank Analysis", description: "A deep one-on-one review of your COMEDK rank to identify exactly what's within reach — and what to target — in this year's counselling." },
  { title: "College Shortlist", description: "A personalised shortlist of COMEDK colleges realistically within your reach, built from previous-year seat data — not generic lists." },
  { title: "Branch Guidance", description: "A focused discussion on which engineering branches suit your interests and career goals at each shortlisted college, so you're choosing a future, not just a seat." },
  { title: "Seat Data Analysis", description: "We use actual previous-year COMEDK seat data to show you closing ranks by college and branch — so your choice filling is grounded in real numbers." },
  { title: "Choice Filling Strategy", description: "Your priorities, our data. We build your COMEDK choice list together — ordered to maximise your chances of getting the best possible college for your rank." },
  { title: "Choice List Review", description: "Before you submit, we review your entire choice list one final time to catch any gaps, ordering issues, or missed opportunities." },
  { title: "Round-by-Round Follow-up", description: "We stay with you through every COMEDK counselling round — evaluating each allotment, advising on upgrades, and guiding you until you've confirmed a seat you're happy with." },
  { title: "PCM Teaching — Zero Extra Cost", description: "Struggling with Physics, Chemistry, or Maths for Boards or COMEDK? We cover PCM teaching as part of the package — at absolutely zero extra cost." },
];

export default function WhatYouGet() {
  const { exam } = useExam();
  const deliverables = exam === "COMEDK" ? comdekDeliverables : kcetDeliverables;

  const heading =
    exam === "COMEDK"
      ? "Everything You Need to Navigate COMEDK Counselling"
      : "Everything You Need to Navigate Counselling";

  const subheading =
    exam === "COMEDK"
      ? "Everything included in one package — from rank analysis to final seat confirmation, plus PCM teaching at zero extra cost."
      : "Everything included in one package — from rank analysis to final seat confirmation, plus PCM teaching at zero extra cost.";

  return (
    <section
      id="what-you-get"
      className="py-20 md:py-28 bg-brand-950 dark:bg-gray-950 text-white"
      aria-label="What you get"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-accent-400 font-semibold text-sm uppercase tracking-widest mb-3">
            What You Get
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {heading}
          </h2>
          <p className="text-brand-300 text-lg max-w-2xl mx-auto">
            {subheading}
          </p>
        </div>

        {/* Deliverables grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {deliverables.map((item) => (
            <div
              key={item.title}
              className="bg-brand-800/50 border border-brand-700/60 rounded-2xl p-6 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <h3 className="text-white font-semibold text-sm">
                  {item.title}
                </h3>
              </div>
              <p className="text-brand-300 text-xs leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Pricing disclaimer */}
        <div className="text-center">
          <div className="inline-block bg-brand-800/60 border border-brand-600/40 rounded-2xl px-8 py-5">
            <p className="text-brand-200 text-sm mb-3">
              Limited seats available. Contact us for current pricing.
              <br />
              Note: No refunds once enrolled.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-400"
            >
              Contact us for package details and pricing
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
