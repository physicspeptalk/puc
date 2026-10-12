import { useExam } from "../context/ExamContext";

const kcetSteps = [
  {
    number: "01",
    title: "Share Your Details",
    description:
      "Tell us your KCET rank, category, branch interests, college preferences, and location priorities. The more we know about you, the more personalised your option entry strategy will be.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Analyse Your Options",
    description:
      "We dig into previous-year seat matrix data alongside your rank and category to show you exactly what's realistic, what's a stretch, and what's a safe backup — no guesswork, just data.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Build Your Option Strategy",
    description:
      "We build your option-entry list together in a one-on-one session — priorities set by you, order optimised by us using seat matrix data. Reviewed, refined, and submitted before the deadline.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Continue Through Counselling",
    description:
      "We follow up and stay with you through every round of counselling — evaluating allotments, guiding upgrade decisions, until you've confirmed a seat you're happy with.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

const comdekSteps = [
  {
    number: "01",
    title: "Share Your Details",
    description:
      "Tell us your COMEDK rank, branch interests, college preferences, and location priorities. The more context you share, the more tailored your choice filling strategy will be.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Analyse Your Options",
    description:
      "We review previous-year COMEDK seat data alongside your rank to show you exactly what's achievable, what's a stretch, and what makes a reliable backup — backed by numbers, not assumptions.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Build Your Choice Filling Strategy",
    description:
      "We build your COMEDK choice list together in a one-on-one session — your priorities, our data. Reviewed, refined, and locked in before the submission deadline.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Continue Through Counselling",
    description:
      "We follow up and stay with you through every COMEDK round — evaluating allotments, guiding upgrade decisions, until you've confirmed a seat you're satisfied with.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  const { exam } = useExam();
  const steps = exam === "COMEDK" ? comdekSteps : kcetSteps;

  return (
    <section
      id="how-it-works"
      className="py-20 md:py-28 bg-gray-50 dark:bg-gray-950"
      aria-label="How the counselling process works"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            How It Works
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            A Clear, Step-by-Step Process
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            Every student gets one-on-one attention at each stage — from your
            first call to confirming your final seat.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative flex flex-col gap-4">
              {/* Connector line (hidden on last item) */}
              {index < steps.length - 1 && (
                <div
                  className="hidden lg:block absolute top-6 left-full w-full h-0.5 bg-brand-100 dark:bg-brand-900 z-0"
                  aria-hidden="true"
                  style={{ width: "calc(100% - 48px)", left: "48px" }}
                />
              )}

              {/* Step number + icon */}
              <div className="relative z-10 flex items-center gap-3">
                <div className="flex-shrink-0 w-12 h-12 rounded-full bg-brand-700 text-white flex items-center justify-center shadow-sm">
                  {step.icon}
                </div>
                <span className="text-3xl font-bold text-brand-100 dark:text-brand-900 select-none" aria-hidden="true">
                  {step.number}
                </span>
              </div>

              <h3 className="text-gray-900 dark:text-white font-semibold text-base">
                {step.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-14">
          <a
            href="#contact"
            className="inline-flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
          >
            Start Your Counselling Journey
          </a>
        </div>
      </div>
    </section>
  );
}
