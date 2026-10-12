const phases = [
  {
    label: "Before Counselling",
    color: "bg-brand-700",
    steps: [
      "Rank and category analysis",
      "College research and shortlisting",
      "Branch preference discussion",
      "Option-entry strategy planning",
    ],
  },
  {
    label: "Option Entry",
    color: "bg-brand-600",
    steps: [
      "Prepare option list",
      "Review and refine choices",
      "Finalize before submission deadline",
    ],
  },
  {
    label: "Round 1",
    color: "bg-brand-500",
    steps: [
      "Evaluate Round 1 allotment",
      "Understand accept/upgrade options",
      "Decide next step based on allotment",
    ],
  },
  {
    label: "Further Rounds",
    color: "bg-accent-500",
    steps: [
      "Review available upgrade opportunities",
      "Adjust strategy if appropriate",
      "Continue counselling support",
    ],
  },
  {
    label: "Final Decision",
    color: "bg-green-600",
    steps: [
      "Evaluate final allotment",
      "Understand reporting and admission process",
      "Make an informed final decision",
    ],
  },
];

export default function RoundSupport() {
  return (
    <section
      id="round-support"
      className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950"
      aria-label="Round-by-round counselling support"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            Round-by-Round Support
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Support Throughout the Counselling Process
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            We provide structured support at each stage, from pre-counselling
            analysis to the final allotment decision. Support is subject to the
            counselling package purchased.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical line */}
          <div
            className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2"
            aria-hidden="true"
          />

          <div className="flex flex-col gap-8">
            {phases.map((phase, index) => (
              <div
                key={phase.label}
                className={`relative flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-0 ${
                  index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content card */}
                <div
                  className={`w-full md:w-5/12 ${
                    index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                  }`}
                >
                  <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-card">
                    <div
                      className={`flex items-center gap-2 mb-3 ${
                        index % 2 === 0 ? "md:justify-end" : ""
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full ${phase.color}`}
                        aria-hidden="true"
                      />
                      <h3 className="text-gray-900 dark:text-white font-bold text-base">
                        {phase.label}
                      </h3>
                    </div>
                    <ul
                      className={`flex flex-col gap-1.5 ${
                        index % 2 === 0 ? "md:items-end" : ""
                      }`}
                      role="list"
                    >
                      {phase.steps.map((step) => (
                        <li
                          key={step}
                          className="text-gray-500 dark:text-gray-400 text-sm flex items-center gap-2"
                        >
                          <svg
                            className={`w-3.5 h-3.5 flex-shrink-0 text-brand-400 ${
                              index % 2 === 0 ? "md:order-last" : ""
                            }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Center dot */}
                <div
                  className="hidden md:flex absolute left-1/2 -translate-x-1/2 w-10 h-10 rounded-full border-4 border-white dark:border-gray-950 shadow items-center justify-center z-10 text-white text-xs font-bold"
                  aria-hidden="true"
                >
                  <span className={`w-full h-full rounded-full flex items-center justify-center ${phase.color}`}>
                    {index + 1}
                  </span>
                </div>

                {/* Empty spacer for opposite side */}
                <div className="hidden md:block w-5/12" />
              </div>
            ))}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-12 max-w-xl mx-auto leading-relaxed">
          Counselling support is provided according to the package purchased.
          This service does not control KEA processes, allotments or seat
          availability. The number of rounds varies by year.
        </p>
      </div>
    </section>
  );
}
