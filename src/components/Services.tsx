import { useExam } from "../context/ExamContext";

const kcetServices = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Rank-Based College Guidance",
    description:
      "We analyse your KCET rank, category, and preferences against previous-year seat matrix data to identify the best realistic colleges and branches for your specific situation — not generic advice.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "College & Branch Selection",
    description:
      "One-on-one sessions to help you pick the right college and the right course. We weigh your interests, career goals, location, and rank together — because the right fit is different for every student.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Option Entry Guidance",
    description:
      "Our option entry strategy is built on actual previous-year seat matrix data — giving you a much higher chance of securing a better college. We set your priorities, build the list, and submit it with you.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Counselling-Round Support",
    description:
      "We don't disappear after option entry. We follow up and guide you through every counselling round until you get a good seat — helping you evaluate allotments and decide your next step each time.",
  },
];

const comdekServices = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Rank-Based College Guidance",
    description:
      "We analyse your COMEDK rank, category, and preferences against previous-year seat data to identify the best realistic colleges and branches for your specific situation — not generic advice.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    title: "College & Branch Selection",
    description:
      "One-on-one sessions to help you pick the right college and the right engineering branch for your COMEDK rank. We weigh your interests, career goals, location, and score together.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    title: "Choice Filling Guidance",
    description:
      "Our choice filling strategy is built on actual previous-year COMEDK seat data — giving you a higher chance of securing a better college. We build and review your choice list together.",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Counselling-Round Support",
    description:
      "We stay with you through every COMEDK counselling round — evaluating allotments, advising on upgrades, and guiding you until you confirm a seat you're satisfied with.",
  },
];

export default function Services() {
  const { exam } = useExam();
  const services = exam === "COMEDK" ? comdekServices : kcetServices;

  const sectionHeading =
    exam === "COMEDK"
      ? "Guidance Across Every Stage of COMEDK Counselling"
      : "Guidance Across Every Stage of KCET Counselling";

  return (
    <section
      id="services"
      className="py-20 md:py-28 bg-white dark:bg-gray-900"
      aria-label="Our services"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section header */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            What We Offer
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {sectionHeading}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-2xl mx-auto">
            One-on-one support across every stage — from understanding your
            realistic options to securing the right seat.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <article
              key={service.title}
              className="group bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7 shadow-card hover:shadow-md hover:border-brand-200 dark:hover:border-brand-600 transition-all duration-300 flex flex-col gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/60 transition-colors">
                {service.icon}
              </div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-base leading-snug">
                {service.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
                {service.description}
              </p>
            </article>
          ))}
        </div>

        {/* CTA nudge */}
        <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-10">
          Contact us for current package details and pricing.{" "}
          <a href="#contact" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
            Get in touch →
          </a>
        </p>
      </div>
    </section>
  );
}
