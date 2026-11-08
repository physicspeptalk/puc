/**
 * sampleQuestionBank.ts
 *
 * High-yield sample questions for Karnataka PUC & KCET / COMEDK:
 *   - Physics (Electrostatics, Current Electricity, Magnetism, Optics, Modern Physics)
 *   - Chemistry (Solutions, Electrochemistry, Kinetics, Coordination, Organic)
 *   - Mathematics (Matrices, Calculus, Integrals, Vectors, 3D Geometry, Probability)
 *   - Biology (Reproduction, Genetics, Molecular Biology, Biotechnology, Ecology)
 *
 * Each question includes:
 *   - Formatted mathematical equations and scientific notation
 *   - Topics
 *   - Options A, B, C, D
 *   - Correct answer
 *   - Detailed step-by-step explanation (Column I format)
 */

import type { SecureQuestionRecord } from "./testSeriesTypes";

export const SAMPLE_PHYSICS_QUESTIONS: SecureQuestionRecord[] = [
  {
    id: "phy-sample-001",
    subject: "Physics",
    topic: "Electric Charges & Fields",
    question: "Two point charges $+3\\mu\\text{C}$ and $+8\\mu\\text{C}$ repel each other with a force of $40\\text{ N}$. If a charge of $-5\\mu\\text{C}$ is added to each of them, then the force between them will become:",
    options: {
      A: "$-10\\text{ N}$ (attractive)",
      B: "$+10\\text{ N}$ (repulsive)",
      C: "$-20\\text{ N}$ (attractive)",
      D: "$+20\\text{ N}$ (repulsive)",
    },
    correctAnswer: "A",
    explanation: "Initial charges are $q_1 = +3\\mu\\text{C}$ and $q_2 = +8\\mu\\text{C}$. Force $F = k \\frac{q_1 q_2}{r^2} = k \\frac{(3)(8)}{r^2} = \\frac{24k}{r^2} = 40\\text{ N}$.\nWhen $-5\\mu\\text{C}$ is added to each:\n$q_1' = 3 - 5 = -2\\mu\\text{C}$\n$q_2' = 8 - 5 = +3\\mu\\text{C}$\nNew force $F' = k \\frac{|q_1' q_2'|}{r^2} = k \\frac{|(-2)(3)|}{r^2} = \\frac{6k}{r^2}$.\nSince $\\frac{24k}{r^2} = 40\\text{ N}$, we have $\\frac{6k}{r^2} = \\frac{40}{4} = 10\\text{ N}$.\nSince the charges have opposite signs ($-2\\mu\\text{C}$ and $+3\\mu\\text{C}$), the force is attractive ($10\\text{ N}$).",
  },
  {
    id: "phy-sample-002",
    subject: "Physics",
    topic: "Current Electricity",
    question: "A wire of resistance $16\\,\\Omega$ is stretched uniformly to twice its original length. The new resistance of the stretched wire is:",
    options: {
      A: "$32\\,\\Omega$",
      B: "$64\\,\\Omega$",
      C: "$8\\,\\Omega$",
      D: "$16\\,\\Omega$",
    },
    correctAnswer: "B",
    explanation: "When a wire is stretched uniformly, its volume remains constant ($V = A \\cdot L = \\text{constant}$). If the length doubles ($L' = 2L$), the area of cross-section is halved ($A' = A/2$).\nThe resistance is given by $R = \\rho \\frac{L}{A}$.\nTherefore, $R' = \\rho \\frac{L'}{A'} = \\rho \\frac{2L}{A/2} = 4 \\left(\\rho \\frac{L}{A}\\right) = 4R$.\nWith $R = 16\\,\\Omega$, the new resistance is $R' = 4 \\times 16 = 64\\,\\Omega$.",
  },
  {
    id: "phy-sample-003",
    subject: "Physics",
    topic: "Moving Charges & Magnetism",
    question: "A charged particle of mass $m$ and charge $q$ enters a uniform magnetic field $B$ perpendicular to its velocity $v$. The time period of revolution of the particle is independent of its:",
    options: {
      A: "Magnetic field $B$",
      B: "Charge $q$",
      C: "Speed $v$ and radius $r$",
      D: "Mass $m$",
    },
    correctAnswer: "C",
    explanation: "For a circular trajectory in a magnetic field, the magnetic Lorentz force provides the centripetal force: $\\frac{m v^2}{r} = q v B \\implies r = \\frac{m v}{q B}$.\nThe time period is $T = \\frac{2\\pi r}{v} = \\frac{2\\pi m}{q B}$.\nNotice that the speed $v$ and radius $r$ cancel out completely. Hence, the period of revolution depends only on $m$, $q$, and $B$, and is completely independent of the particle's speed and orbital radius.",
  },
  {
    id: "phy-sample-004",
    subject: "Physics",
    topic: "Ray & Wave Optics",
    question: "In Young's double slit experiment, if the distance between the two slits is halved and the distance between the slits and the screen is doubled, the fringe width $\\beta$ will:",
    options: {
      A: "Remain unchanged",
      B: "Be halved",
      C: "Be doubled",
      D: "Become four times",
    },
    correctAnswer: "D",
    explanation: "The fringe width in Young's Double Slit Experiment is given by $\\beta = \\frac{\\lambda D}{d}$, where $D$ is the distance from slits to screen, $d$ is the slit separation, and $\\lambda$ is the wavelength.\nWhen $d' = d/2$ and $D' = 2D$:\n$\\beta' = \\frac{\\lambda D'}{d'} = \\frac{\\lambda (2D)}{d/2} = 4 \\left(\\frac{\\lambda D}{d}\\right) = 4\\beta$.\nThus, the fringe width becomes four times its initial value.",
  },
  {
    id: "phy-sample-005",
    subject: "Physics",
    topic: "Dual Nature of Radiation",
    question: "The de Broglie wavelength of an electron accelerated through a potential difference of $V = 100\\text{ V}$ is approximately:",
    options: {
      A: "$1.227\\text{ Å}$ ($0.123\\text{ nm}$)",
      B: "$12.27\\text{ Å}$",
      C: "$0.1227\\text{ Å}$",
      D: "$122.7\\text{ Å}$",
    },
    correctAnswer: "A",
    explanation: "The de Broglie wavelength of an accelerated electron is given by the formula:\n$\\lambda = \\frac{h}{\\sqrt{2 m e V}} = \\frac{12.27}{\\sqrt{V}}\\text{ Å}$.\nSubstituting $V = 100\\text{ V}$:\n$\\lambda = \\frac{12.27}{\\sqrt{100}} = \\frac{12.27}{10} = 1.227\\text{ Å} = 0.1227\\text{ nm}$.",
  },
  {
    id: "phy-sample-006",
    subject: "Physics",
    topic: "Semiconductors",
    question: "In an unbiased p-n junction diode, the depletion layer is formed due to:",
    options: {
      A: "Drift of holes only",
      B: "Diffusion of majority charge carriers across the junction",
      C: "Application of external voltage",
      D: "Thermal agitation only",
    },
    correctAnswer: "B",
    explanation: "When a p-n junction is formed, the high concentration gradient causes majority holes from the p-side to diffuse into the n-side, and majority electrons from the n-side to diffuse into the p-side. Near the junction, they recombine, leaving behind unneutralized immobile ionized donor and acceptor atoms. This region devoid of free mobile charge carriers forms the depletion region.",
  },
];

export const SAMPLE_CHEMISTRY_QUESTIONS: SecureQuestionRecord[] = [
  {
    id: "chem-sample-001",
    subject: "Chemistry",
    topic: "Solutions",
    question: "An aqueous solution of $0.1\\text{ M } \\text{Al}_2(\\text{SO}_4)_3$ undergoes $100\\%$ dissociation. What is its van 't Hoff factor $i$?",
    options: {
      A: "$i = 3$",
      B: "$i = 4$",
      C: "$i = 5$",
      D: "$i = 2$",
    },
    correctAnswer: "C",
    explanation: "Aluminum sulfate dissociates as: $\\text{Al}_2(\\text{SO}_4)_3 \\rightarrow 2\\text{Al}^{3+} + 3\\text{SO}_4^{2-}$.\nTotal number of ions produced per formula unit $n = 2 + 3 = 5$.\nWith degree of dissociation $\\alpha = 1$ ($100\\%$ dissociation):\n$i = 1 + (n - 1)\\alpha = 1 + (5 - 1)(1) = 5$.",
  },
  {
    id: "chem-sample-002",
    subject: "Chemistry",
    topic: "Electrochemistry",
    question: "According to Kohlrausch's law of independent migration of ions, the limiting molar conductivity of an electrolyte is:",
    options: {
      A: "Equal to the sum of limiting ionic conductivities of its constituent ions",
      B: "Independent of the temperature of the solution",
      C: "Inversely proportional to the concentration of the electrolyte",
      D: "Equal to the product of ionic conductivities",
    },
    correctAnswer: "A",
    explanation: "Kohlrausch's Law states that at infinite dilution, each ion makes a definite and independent contribution towards the equivalent/molar conductivity of the electrolyte regardless of the nature of the co-ion. For an electrolyte $A_x B_y$: $\\Lambda_m^\\circ = x \\lambda_+^\\circ + y \\lambda_-^\\circ$.",
  },
  {
    id: "chem-sample-003",
    subject: "Chemistry",
    topic: "Chemical Kinetics",
    question: "The rate constant of a reaction is $k = 3.2 \\times 10^{-4}\\text{ mol}^{-1}\\cdot\\text{L}\\cdot\\text{s}^{-1}$. What is the overall order of this reaction?",
    options: {
      A: "Zero order",
      B: "First order",
      C: "Second order",
      D: "Third order",
    },
    correctAnswer: "C",
    explanation: "The unit of rate constant for an $n^{\\text{th}}$ order reaction is $(\\text{mol/L})^{1-n}\\cdot\\text{s}^{-1} = \\text{mol}^{1-n}\\cdot\\text{L}^{n-1}\\cdot\\text{s}^{-1}$.\nHere, the unit given is $\\text{mol}^{-1}\\cdot\\text{L}^{1}\\cdot\\text{s}^{-1}$.\nComparing exponents: $1 - n = -1 \\implies n = 2$.\nTherefore, it is a second-order reaction.",
  },
  {
    id: "chem-sample-004",
    subject: "Chemistry",
    topic: "Coordination Compounds",
    question: "Which of the following complex ions is diamagnetic according to Valence Bond Theory (VBT)?",
    options: {
      A: "$[\\text{CoF}_6]^{3-}$",
      B: "$[\\text{Co}(\\text{NH}_3)_6]^{3+}$",
      C: "$[\\text{FeF}_6]^{3-}$",
      D: "$[\\text{NiCl}_4]^{2-}$",
    },
    correctAnswer: "B",
    explanation: "In $[\\text{Co}(\\text{NH}_3)_6]^{3+}$, Cobalt is in $+3$ oxidation state: $\\text{Co}^{3+} = 3d^6$.\n$\\text{NH}_3$ acts as a strong field ligand with $\\text{Co}^{3+}$, causing pairing of all 6 electrons in the $t_{2g}$ orbitals: $t_{2g}^6 e_g^0$.\nSince there are no unpaired electrons ($n = 0$), the complex has $d^2sp^3$ inner orbital hybridization and is diamagnetic.",
  },
  {
    id: "chem-sample-005",
    subject: "Chemistry",
    topic: "Haloalkanes & Haloarenes",
    question: "Which alkyl halide will react fastest via the $\\text{S}_\\text{N}1$ mechanism with aqueous KOH?",
    options: {
      A: "$\\text{CH}_3\\text{CH}_2\\text{Cl}$",
      B: "$\\text{CH}_3\\text{CH}_2\\text{CH}_2\\text{Cl}$",
      C: "$(\\text{CH}_3)_2\\text{CH-Cl}$",
      D: "$(\\text{CH}_3)_3\\text{C-Cl}$",
    },
    correctAnswer: "D",
    explanation: "The rate-determining step of an $\\text{S}_\\text{N}1$ mechanism is the ionization of the alkyl halide to form a carbocation intermediate. The reactivity order corresponds to carbocation stability:\n$3^\\circ > 2^\\circ > 1^\\circ > \\text{methyl}$.\nTert-butyl chloride, $(\\text{CH}_3)_3\\text{C-Cl}$, forms a highly stable tertiary carbocation $(\\text{CH}_3)_3\\text{C}^+$ stabilized by 9 hyperconjugative structures, reacting the fastest.",
  },
];

export const SAMPLE_MATHS_QUESTIONS: SecureQuestionRecord[] = [
  {
    id: "math-sample-001",
    subject: "Mathematics",
    topic: "Matrices & Determinants",
    question: "If $A$ is a square matrix of order $3 \\times 3$ such that $|A| = 5$, then the determinant of its adjoint matrix $|\\text{adj}(A)|$ is equal to:",
    options: {
      A: "$5$",
      B: "$25$",
      C: "$125$",
      D: "$1/5$",
    },
    correctAnswer: "B",
    explanation: "For any square matrix $A$ of order $n$, the determinant of its adjoint is given by:\n$|\\text{adj}(A)| = |A|^{n - 1}$.\nHere, the order is $n = 3$ and $|A| = 5$.\nTherefore, $|\\text{adj}(A)| = 5^{3 - 1} = 5^2 = 25$.",
  },
  {
    id: "math-sample-002",
    subject: "Mathematics",
    topic: "Continuity & Differentiability",
    question: "If $y = e^{\\sin(x^2)}$, then the derivative $\\frac{dy}{dx}$ is given by:",
    options: {
      A: "$2x\\cos(x^2)e^{\\sin(x^2)}$",
      B: "$\\cos(x^2)e^{\\sin(x^2)}$",
      C: "$2x\\sin(x^2)e^{\\cos(x^2)}$",
      D: "$-2x\\cos(x^2)e^{\\sin(x^2)}$",
    },
    correctAnswer: "A",
    explanation: "Apply the chain rule step-by-step:\n$\\frac{dy}{dx} = \\frac{d}{dx}[e^{\\sin(x^2)}] = e^{\\sin(x^2)} \\cdot \\frac{d}{dx}[\\sin(x^2)]$\n$= e^{\\sin(x^2)} \\cdot \\cos(x^2) \\cdot \\frac{d}{dx}[x^2]$\n$= e^{\\sin(x^2)} \\cdot \\cos(x^2) \\cdot (2x) = 2x\\cos(x^2)e^{\\sin(x^2)}$.",
  },
  {
    id: "math-sample-003",
    subject: "Mathematics",
    topic: "Integrals",
    question: "Evaluate the definite integral: $\\int_0^{\\pi/2} \\frac{\\sin^4(x)}{\\sin^4(x) + \\cos^4(x)}\\,dx$",
    options: {
      A: "$\\pi$",
      B: "$\\pi/2$",
      C: "$\\pi/4$",
      D: "$0$",
    },
    correctAnswer: "C",
    explanation: "Let $I = \\int_0^{\\pi/2} \\frac{\\sin^4(x)}{\\sin^4(x) + \\cos^4(x)}\\,dx$  --- (1)\nUsing King's property $\\int_0^a f(x)\\,dx = \\int_0^a f(a - x)\\,dx$:\n$I = \\int_0^{\\pi/2} \\frac{\\sin^4(\\pi/2 - x)}{\\sin^4(\\pi/2 - x) + \\cos^4(\\pi/2 - x)}\\,dx = \\int_0^{\\pi/2} \\frac{\\cos^4(x)}{\\cos^4(x) + \\sin^4(x)}\\,dx$  --- (2)\nAdding (1) and (2):\n$2I = \\int_0^{\\pi/2} \\frac{\\sin^4(x) + \\cos^4(x)}{\\sin^4(x) + \\cos^4(x)}\\,dx = \\int_0^{\\pi/2} 1\\,dx = [x]_0^{\\pi/2} = \\frac{\\pi}{2}$.\nHence, $I = \\frac{\\pi}{4}$.",
  },
  {
    id: "math-sample-004",
    subject: "Mathematics",
    topic: "Vector Algebra",
    question: "If vectors $\\vec{a} = 2\\hat{i} - \\hat{j} + \\hat{k}$ and $\\vec{b} = \\hat{i} + 2\\hat{j} - 3\\hat{k}$ are given, the dot product $\\vec{a} \\cdot \\vec{b}$ is:",
    options: {
      A: "$3$",
      B: "$-3$",
      C: "$0$",
      D: "$-5$",
    },
    correctAnswer: "B",
    explanation: "The dot product of two vectors $\\vec{a} = a_1\\hat{i} + a_2\\hat{j} + a_3\\hat{k}$ and $\\vec{b} = b_1\\hat{i} + b_2\\hat{j} + b_3\\hat{k}$ is:\n$\\vec{a} \\cdot \\vec{b} = a_1 b_1 + a_2 b_2 + a_3 b_3$.\nSubstituting the values:\n$\\vec{a} \\cdot \\vec{b} = (2)(1) + (-1)(2) + (1)(-3) = 2 - 2 - 3 = -3$.",
  },
  {
    id: "math-sample-005",
    subject: "Mathematics",
    topic: "Probability",
    question: "If $P(A) = 0.6$, $P(B) = 0.3$, and $P(A \\cap B) = 0.2$, then the conditional probability $P(A \\mid B)$ is:",
    options: {
      A: "$2/3$",
      B: "$1/3$",
      C: "$2/5$",
      D: "$1/2$",
    },
    correctAnswer: "A",
    explanation: "By the definition of conditional probability:\n$P(A \\mid B) = \\frac{P(A \\cap B)}{P(B)}$.\nGiven $P(A \\cap B) = 0.2$ and $P(B) = 0.3$:\n$P(A \\mid B) = \\frac{0.2}{0.3} = \\frac{2}{3}$.",
  },
];

export const SAMPLE_BIOLOGY_QUESTIONS: SecureQuestionRecord[] = [
  {
    id: "bio-sample-001",
    subject: "Biology",
    topic: "Sexual Reproduction in Flowering Plants",
    question: "Double fertilization is a characteristic feature unique to angiosperms. It involves which two fusion events?",
    options: {
      A: "Syngamy and Triple Fusion",
      B: "Apomixis and Polyembryony",
      C: "Parthenogenesis and Parthenocarpy",
      D: "Autogamy and Geitonogamy",
    },
    correctAnswer: "A",
    explanation: "Double fertilization consists of:\n1. Syngamy: One male gamete ($n$) fuses with the egg cell ($n$) to form the diploid zygote ($2n$).\n2. Triple Fusion: The second male gamete ($n$) fuses with the diploid central cell containing two polar nuclei ($2n$) to form the triploid Primary Endosperm Nucleus (PEN, $3n$).",
  },
  {
    id: "bio-sample-002",
    subject: "Biology",
    topic: "Principles of Inheritance & Variation",
    question: "What is the phenotypic dihybrid test cross ratio in Mendelian genetics?",
    options: {
      A: "$9:3:3:1$",
      B: "$1:1:1:1$",
      C: "$3:1$",
      D: "$9:7$",
    },
    correctAnswer: "B",
    explanation: "A test cross crosses an unknown dominant genotype with a homozygous recessive parent ($AaBb \\times aabb$).\nGametes from $AaBb$ are $AB, Ab, aB, ab$ in equal proportion ($1:1:1:1$).\nThe homozygous recessive parent produces only $ab$ gametes.\nTherefore, the offspring have phenotypes in the ratio $1:1:1:1$.",
  },
  {
    id: "bio-sample-003",
    subject: "Biology",
    topic: "Molecular Basis of Inheritance",
    question: "During DNA replication, which enzyme is responsible for synthesizing short RNA primers required for DNA polymerase activity?",
    options: {
      A: "DNA Ligase",
      B: "RNA Primase",
      C: "Topoisomerase",
      D: "Helicase",
    },
    correctAnswer: "B",
    explanation: "DNA polymerase cannot initiate the synthesis of a new DNA strand de novo; it requires a free $3'\\text{-OH}$ group. RNA Primase (an RNA polymerase) synthesizes a short RNA primer complementary to the template strand, providing the free $3'\\text{-OH}$ group for DNA polymerase III to extend.",
  },
  {
    id: "bio-sample-004",
    subject: "Biology",
    topic: "Biotechnology: Principles & Processes",
    question: "The enzyme EcoRI cuts double-stranded DNA specifically at which palindromic recognition sequence?",
    options: {
      A: "$5'\\text{-GGATCC-}3'$",
      B: "$5'\\text{-GAATTC-}3'$",
      C: "$5'\\text{-AAGCTT-}3'$",
      D: "$5'\\text{-CTGCAG-}3'$",
    },
    correctAnswer: "B",
    explanation: "EcoRI is a type II restriction endonuclease isolated from Escherichia coli strain RY13. It recognizes the specific 6 base-pair palindromic hexanucleotide sequence $5'\\text{-GAATTC-}3'$ and cleaves between G and A, producing sticky / cohesive ends with a 4-base $5'$ overhang.",
  },
  {
    id: "bio-sample-005",
    subject: "Biology",
    topic: "Organisms and Populations",
    question: "Which type of ecological interaction is exemplified by the association between clownfish and sea anemones?",
    options: {
      A: "Mutualism",
      B: "Commensalism",
      C: "Parasitism",
      D: "Amensalism",
    },
    correctAnswer: "B",
    explanation: "Commensalism is an interaction where one species benefits while the other is neither harmed nor benefited ($+/0$). The clownfish finds shelter and protection from predators within the stinging tentacles of the sea anemone, while the sea anemone does not appear to derive any significant benefit or harm.",
  },
];

export const SAMPLE_QUESTIONS_BY_SUBJECT: Record<string, SecureQuestionRecord[]> = {
  physics: SAMPLE_PHYSICS_QUESTIONS,
  chemistry: SAMPLE_CHEMISTRY_QUESTIONS,
  maths: SAMPLE_MATHS_QUESTIONS,
  bio: SAMPLE_BIOLOGY_QUESTIONS,
};
