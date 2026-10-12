import { useState } from "react";
import { useExam } from "../context/ExamContext";

const kcetFaqs = [
  {
    question: "Is this service free?",
    answer:
      "No. This is a paid KCET counselling guidance service. Contact us for current package details and pricing.",
  },
  {
    question: "Do you guarantee a specific college or branch?",
    answer:
      "No. We do not guarantee admission to any specific college or branch. Final allotments are determined by the Karnataka Examinations Authority (KEA) based on rank, category, seat availability, cutoffs and other factors outside our control. No counselling service can honestly make this guarantee.",
  },
  {
    question: "Can you help with option entry?",
    answer:
      "Yes. We provide guidance for preparing, organizing and reviewing your KCET option-entry strategy. We help you understand how to prioritize your choices based on your rank, category and preferences.",
  },
  {
    question: "Do you support multiple counselling rounds?",
    answer:
      "Yes, according to the counselling package purchased. Support for each round is subject to the package you select. Contact us for details on what is included.",
  },
  {
    question: "Can you tell me exactly which college I will get?",
    answer:
      "No. We can analyze previous-year trends and your specific circumstances to help identify realistic possibilities, but future allotments depend on current-year cutoffs, seat availability and many other factors that cannot be predicted with certainty.",
  },
  {
    question: "Do you consider branch preferences?",
    answer:
      "Yes. Branch preferences are an important part of the counselling discussion. We help you weigh college vs branch priorities based on your individual situation and goals.",
  },
  {
    question: "Can parents participate in the counselling sessions?",
    answer:
      "Yes. Parents are welcome to participate in all counselling discussions. We encourage family involvement in major college and branch decisions.",
  },
  {
    question: "When should I reach out — before or after getting my rank?",
    answer:
      "You can reach out at any time. However, the most practical counselling can begin once your KCET rank is available, as the analysis is specific to your rank and category.",
  },
  {
    question: "Is this only for Karnataka students?",
    answer:
      "KCET counselling is specifically for students eligible for Karnataka Engineering entrance (KEA). If you are eligible for KCET counselling and need guidance, reach out to us.",
  },
];

const comdekFaqs = [
  {
    question: "Is this service free?",
    answer:
      "No. This is a paid COMEDK counselling guidance service. Contact us for current package details and pricing.",
  },
  {
    question: "Do you guarantee a specific college or branch?",
    answer:
      "No. We do not guarantee admission to any specific college or branch. Final allotments are determined by COMEDK authority based on rank, seat availability, cutoffs and other factors outside our control. No counselling service can honestly make this guarantee.",
  },
  {
    question: "Can you help with choice filling?",
    answer:
      "Yes. We provide guidance for preparing, reviewing, and optimising your COMEDK choice filling. We help you understand how to prioritise your choices based on your rank and preferences.",
  },
  {
    question: "Do you support multiple counselling rounds?",
    answer:
      "Yes, according to the counselling package purchased. Support for each round is subject to the package you select. Contact us for details on what is included.",
  },
  {
    question: "Can you tell me exactly which college I will get?",
    answer:
      "No. We can analyse previous-year COMEDK trends and your specific circumstances to help identify realistic possibilities, but future allotments depend on current-year cutoffs, seat availability and many other factors that cannot be predicted with certainty.",
  },
  {
    question: "Do you consider branch preferences?",
    answer:
      "Yes. Branch preferences are a central part of the COMEDK counselling discussion. We help you weigh college vs branch priorities based on your individual situation and goals.",
  },
  {
    question: "Can parents participate in the counselling sessions?",
    answer:
      "Yes. Parents are welcome to participate in all sessions. We encourage family involvement in major college and branch decisions.",
  },
  {
    question: "When should I reach out — before or after getting my COMEDK rank?",
    answer:
      "You can reach out at any time. However, the most practical counselling can begin once your COMEDK rank is available, as the analysis is specific to your rank.",
  },
  {
    question: "Is COMEDK only for Karnataka students?",
    answer:
      "COMEDK is open to students from across India for engineering admissions in Karnataka. If you are eligible for COMEDK counselling and need guidance, reach out to us.",
  },
];

function FAQItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-inset"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span className="text-gray-900 dark:text-white font-medium text-sm md:text-base pr-2">
          {question}
        </span>
        <span
          className={`flex-shrink-0 w-6 h-6 text-brand-600 dark:text-brand-400 transition-transform duration-200 ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-hidden="true"
        >
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </button>

      {isOpen && (
        <div className="px-6 pb-5 bg-white dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { exam } = useExam();
  const faqs = exam === "COMEDK" ? comdekFaqs : kcetFaqs;

  const description =
    exam === "COMEDK"
      ? "Honest answers to common questions about our COMEDK counselling guidance service."
      : "Honest answers to common questions about our KCET counselling guidance service.";

  return (
    <section
      id="faq"
      className="py-20 md:py-28 bg-white dark:bg-gray-900"
      aria-label="Frequently asked questions"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block text-brand-600 dark:text-brand-400 font-semibold text-sm uppercase tracking-widest mb-3">
            FAQs
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            {description}
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto flex flex-col gap-3" role="list">
          {faqs.map((faq, i) => (
            <div key={faq.question} role="listitem">
              <FAQItem
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </div>
          ))}
        </div>

        {/* Still have questions */}
        <div className="text-center mt-12">
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            Have a question not answered above?
          </p>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 border-2 border-brand-700 dark:border-brand-500 text-brand-700 dark:text-brand-400 hover:bg-brand-700 dark:hover:bg-brand-600 hover:text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Ask Us Directly
          </a>
        </div>
      </div>
    </section>
  );
}
