/**
 * KcetInputForm
 *
 * Step-by-step form for the KCET Rank & College Predictor.
 *
 * Steps:
 *   1. PUC PCM marks (Physics, Chemistry, Maths — each 0–100)
 *   2. KCET marks    (Physics, Chemistry, Maths — each 0–60)
 *   3. Category      (dropdown from detected sheet categories)
 *   4. 371(J)        (yes/no toggle)
 *   5. Location      (disabled — no reliable location data in source sheet)
 */

import React, { useState, useId } from "react";
import { validateEngineeringInputs } from "../../lib/kcetCalculations";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KcetFormValues {
  // PUC PCM (0–100 each)
  pucPhysics: string;
  pucChemistry: string;
  pucMathematics: string;
  // KCET marks (0–60 each)
  kcetPhysics: string;
  kcetChemistry: string;
  kcetMathematics: string;
  // Category
  category: string;
  // 371(J) eligibility
  is371J: boolean;
}

export interface KcetFormProps {
  /** Available RK category options from the Google Sheet */
  availableCategories: string[];
  onSubmit: (values: KcetFormValues) => void;
  loading: boolean;
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

const INITIAL_VALUES: KcetFormValues = {
  pucPhysics: "",
  pucChemistry: "",
  pucMathematics: "",
  kcetPhysics: "",
  kcetChemistry: "",
  kcetMathematics: "",
  category: "",
  is371J: false,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface MarkInputProps {
  id: string;
  label: string;
  value: string;
  max: number;
  error?: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function MarkInput({ id, label, value, max, error, onChange, disabled }: MarkInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-medium text-gray-700">
        {label}
        <span className="ml-1 text-xs text-gray-400 font-normal">/ {max}</span>
      </label>
      <input
        id={id}
        type="number"
        min={0}
        max={max}
        step={1}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full rounded-lg border px-4 py-3 text-base
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error
            ? "border-red-400 bg-red-50 focus:ring-red-400"
            : "border-gray-300 bg-white hover:border-indigo-400"
          }
        `}
        placeholder={`0 – ${max}`}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && (
        <p id={`${id}-error`} className="text-xs text-red-600 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

interface StepHeadingProps {
  step: number;
  title: string;
}

function StepHeading({ step, title }: StepHeadingProps) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-sm font-bold shrink-0">
        {step}
      </span>
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function KcetInputForm({
  availableCategories,
  onSubmit,
  loading,
}: KcetFormProps) {
  const uid = useId();
  const [values, setValues] = useState<KcetFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof KcetFormValues, string>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // -------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------

  function field(key: keyof KcetFormValues) {
    return {
      id: `${uid}-${key}`,
      value: values[key] as string,
      error: submitAttempted ? fieldErrors[key] : undefined,
      onChange: (v: string) => setValues((prev) => ({ ...prev, [key]: v })),
    };
  }

  function parseNum(s: string): number {
    const n = parseFloat(s);
    return isNaN(n) ? NaN : n;
  }

  // -------------------------------------------------------------------
  // Validation
  // -------------------------------------------------------------------

  function validate(): boolean {
    const errors: Partial<Record<keyof KcetFormValues, string>> = {};

    const engineeringErrors = validateEngineeringInputs({
      pucPhysics: parseNum(values.pucPhysics),
      pucChemistry: parseNum(values.pucChemistry),
      pucMathematics: parseNum(values.pucMathematics),
      kcetPhysics: parseNum(values.kcetPhysics),
      kcetChemistry: parseNum(values.kcetChemistry),
      kcetMathematics: parseNum(values.kcetMathematics),
    });

    // Map errors back to field keys
    for (const err of engineeringErrors) {
      if (err.includes("PUC Physics")) errors.pucPhysics = err;
      else if (err.includes("PUC Chemistry")) errors.pucChemistry = err;
      else if (err.includes("PUC Mathematics")) errors.pucMathematics = err;
      else if (err.includes("KCET Physics")) errors.kcetPhysics = err;
      else if (err.includes("KCET Chemistry")) errors.kcetChemistry = err;
      else if (err.includes("KCET Mathematics")) errors.kcetMathematics = err;
    }

    if (!values.category) {
      errors.category = "Please select your category";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // -------------------------------------------------------------------
  // Submit
  // -------------------------------------------------------------------

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (validate()) {
      onSubmit(values);
    }
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-8">

      {/* STEP 1 — PUC PCM Marks */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <StepHeading step={1} title="Your PUC / Board Marks (PCM)" />
        <p className="text-sm text-gray-500 mb-5">
          Enter your PUC / 2nd PUC or equivalent board marks for Physics, Chemistry,
          and Mathematics only.
          <span className="block mt-1 text-xs text-amber-700 font-medium">
            ⚠️ Do NOT enter Biology marks here. This predictor uses PCM for Engineering.
          </span>
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MarkInput
            {...field("pucPhysics")}
            label="Physics"
            max={100}
            disabled={loading}
          />
          <MarkInput
            {...field("pucChemistry")}
            label="Chemistry"
            max={100}
            disabled={loading}
          />
          <MarkInput
            {...field("pucMathematics")}
            label="Mathematics"
            max={100}
            disabled={loading}
          />
        </div>
      </section>

      {/* STEP 2 — KCET Marks */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <StepHeading step={2} title="Your KCET Marks" />
        <p className="text-sm text-gray-500 mb-5">
          Enter your KCET 2026 marks for Physics, Chemistry, and Mathematics.
          Each subject is out of 60.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <MarkInput
            {...field("kcetPhysics")}
            label="KCET Physics"
            max={60}
            disabled={loading}
          />
          <MarkInput
            {...field("kcetChemistry")}
            label="KCET Chemistry"
            max={60}
            disabled={loading}
          />
          <MarkInput
            {...field("kcetMathematics")}
            label="KCET Mathematics"
            max={60}
            disabled={loading}
          />
        </div>
      </section>

      {/* STEP 3 — Category */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <StepHeading step={3} title="Your Category" />
        <p className="text-sm text-gray-500 mb-5">
          Select your KEA category as printed on your KCET admit card / rank card.
          Available categories are loaded directly from the official KEA dataset.
        </p>
        <div>
          <label
            htmlFor={`${uid}-category`}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Category
          </label>
          <select
            id={`${uid}-category`}
            value={values.category}
            disabled={loading || availableCategories.length === 0}
            onChange={(e) => setValues((prev) => ({ ...prev, category: e.target.value }))}
            className={`
              w-full sm:w-64 rounded-lg border px-4 py-3 text-base bg-white
              focus:outline-none focus:ring-2 focus:ring-indigo-500
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${submitAttempted && fieldErrors.category
                ? "border-red-400 focus:ring-red-400"
                : "border-gray-300 hover:border-indigo-400"
              }
            `}
            aria-invalid={!!(submitAttempted && fieldErrors.category)}
          >
            <option value="">-- Select Category --</option>
            {availableCategories.length === 0 && (
              <option disabled>Loading categories from sheet…</option>
            )}
            {availableCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {submitAttempted && fieldErrors.category && (
            <p className="text-xs text-red-600 mt-1" role="alert">
              {fieldErrors.category}
            </p>
          )}
        </div>
      </section>

      {/* STEP 4 — 371(J) */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <StepHeading step={4} title="371(J) Kalyana Karnataka Eligibility" />
        <p className="text-sm text-gray-500 mb-5">
          If you are eligible for the 371(J) Hyderabad-Karnataka reservation, the
          corresponding H-category cutoffs from the KEA dataset will be used.
          Only select Yes if you have the required domicile certificate.
        </p>
        <div className="flex gap-4">
          {(["No", "Yes"] as const).map((label) => {
            const isYes = label === "Yes";
            const active = values.is371J === isYes;
            return (
              <button
                key={label}
                type="button"
                disabled={loading}
                onClick={() => setValues((prev) => ({ ...prev, is371J: isYes }))}
                className={`
                  px-6 py-3 rounded-lg border-2 font-semibold text-sm transition-colors
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  disabled:cursor-not-allowed
                  ${active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-gray-300 text-gray-700 hover:border-indigo-400 bg-white"
                  }
                `}
                aria-pressed={active}
              >
                {label}
              </button>
            );
          })}
        </div>
        {values.is371J && (
          <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-4 py-2 border border-amber-200">
            371(J) selected: The predictor will use the H-category cutoff columns
            from the KEA dataset where available.
          </p>
        )}
      </section>

      {/* STEP 5 — Location (Disabled) */}
      <section className="bg-gray-50 rounded-2xl border border-gray-200 p-6 shadow-sm opacity-70">
        <StepHeading step={5} title="Preferred Location (Optional)" />
        <div className="flex items-start gap-3 text-sm text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-amber-500 shrink-0 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z"
            />
          </svg>
          <p>
            Location filter is not available. The current KEA cutoff dataset does not
            include a reliable city or district column. To enable location filtering,
            please supply an official KEA college master sheet with location data.
          </p>
        </div>
      </section>

      {/* Submit */}
      <div className="text-center pb-4">
        <button
          type="submit"
          disabled={loading}
          className="
            inline-flex items-center justify-center gap-2
            bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800
            disabled:bg-indigo-400 disabled:cursor-not-allowed
            text-white font-bold text-lg
            px-10 py-4 rounded-2xl
            shadow-lg shadow-indigo-200
            transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2
          "
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Loading data…
            </>
          ) : (
            <>🎓 Predict My Colleges</>
          )}
        </button>
        <p className="mt-3 text-xs text-gray-400">
          Results use only the official KEA cutoff dataset. No third-party data is used.
        </p>
      </div>

    </form>
  );
}
