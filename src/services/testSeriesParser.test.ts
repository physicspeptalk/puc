import { describe, it, expect } from "vitest";
import {
  parseSheetCsvToQuestions,
  normalizeOptionLetter,
  cleanCellText,
} from "./testSeriesParser";

describe("testSeriesParser", () => {
  describe("normalizeOptionLetter", () => {
    it("handles plain letters", () => {
      expect(normalizeOptionLetter("A")).toBe("A");
      expect(normalizeOptionLetter("b")).toBe("B");
      expect(normalizeOptionLetter("c")).toBe("C");
      expect(normalizeOptionLetter("D")).toBe("D");
    });

    it("handles variations like 'Option A' or '(B)' or '1'", () => {
      expect(normalizeOptionLetter("Option A")).toBe("A");
      expect(normalizeOptionLetter("(B)")).toBe("B");
      expect(normalizeOptionLetter("3")).toBe("C");
      expect(normalizeOptionLetter("4")).toBe("D");
      expect(normalizeOptionLetter("")).toBe("A");
    });
  });

  describe("cleanCellText", () => {
    it("trims whitespace and normalizes CRLF", () => {
      expect(cleanCellText("  hello world  \r\n")).toBe("hello world");
    });
  });

  describe("parseSheetCsvToQuestions", () => {
    it("skips header row and parses 9-column CSV correctly", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation"
"Physics","Mechanics","What is $F$ when $m=2\\text{ kg}$ and $a=3\\text{ m/s}^2$?","5 N","6 N","1 N","10 N","B","Using Newton's Second Law: $F = m \\cdot a = 2 \\times 3 = 6\\text{ N}$."
"Physics","Optics","Focal length of plane mirror is:","0","Infinity","10 cm","-10 cm","B","The radius of curvature of a plane mirror is infinite, so $f = R/2 = \\infty$."`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");

      expect(result.totalValid).toBe(2);
      expect(result.questions.length).toBe(2);
      expect(result.secureRecords.length).toBe(2);

      // Verify question 1
      const q1 = result.questions[0];
      expect(q1.id).toBe("physics-001");
      expect(q1.topic).toBe("Mechanics");
      expect(q1.question).toBe("What is $F$ when $m=2\\text{ kg}$ and $a=3\\text{ m/s}^2$?");
      expect(q1.options.A).toBe("5 N");
      expect(q1.options.B).toBe("6 N");
      expect(q1.options.C).toBe("1 N");
      expect(q1.options.D).toBe("10 N");

      // CRITICAL SECURITY CHECK: Public question must NOT contain correctAnswer or explanation
      expect((q1 as any).correctAnswer).toBeUndefined();
      expect((q1 as any).explanation).toBeUndefined();

      // Secure record DOES contain correctAnswer and explanation
      const s1 = result.secureRecords[0];
      expect(s1.correctAnswer).toBe("B");
      expect(s1.explanation).toContain("Newton's Second Law");

      // Verify topic aggregation
      expect(result.topics["Mechanics"]).toBe(1);
      expect(result.topics["Optics"]).toBe(1);
    });

    it("handles empty rows and ignores incomplete questions", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation"
"Physics","Mechanics","Valid Q","Opt 1","Opt 2","Opt 3","Opt 4","A","Sol 1"
"","","","","","","","",""
"Physics","Incomplete","Only question without options","","","","","A",""
"Physics","Incomplete 2","","Opt 1","Opt 2","","","A",""`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");
      expect(result.totalValid).toBe(1);
      expect(result.skippedCount).toBe(3);
    });

    it("handles multiline questions with preserved formatting", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation"
"Physics","Circuits","Consider the following statements:
(I) Kirchhoff's current law is based on charge conservation.
(II) Kirchhoff's voltage law is based on energy conservation.
Which is true?","Only I","Only II","Both I and II","Neither","C","Statement I corresponds to charge conservation and Statement II corresponds to energy conservation."`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");
      expect(result.totalValid).toBe(1);
      expect(result.questions[0].question).toContain("(I) Kirchhoff's current law");
      expect(result.questions[0].question).toContain("(II) Kirchhoff's voltage law");
      expect(result.secureRecords[0].correctAnswer).toBe("C");
    });

    it("provides fallback explanation when Column I is empty", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation"
"Physics","Modern","What is charge of an electron?","$-1.6 \\times 10^{-19}\\text{ C}$","$-1.6 \\times 10^{-18}\\text{ C}$","$-3.2 \\times 10^{-19}\\text{ C}$","$0$","A",""`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");
      expect(result.totalValid).toBe(1);
      expect(result.secureRecords[0].explanation).toBe("Explanation not available for this question.");
    });

    it("handles Unicode characters and scientific notation", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation"
"Physics","Waves","The phase difference $\\Delta\\phi$ corresponding to path difference $\\lambda/4$ is:","$\\pi/4$","$\\pi/2$","$\\pi$","$2\\pi$","B","$\\Delta\\phi = \\frac{2\\pi}{\\lambda}\\Delta x = \\frac{2\\pi}{\\lambda}\\left(\\frac{\\lambda}{4}\\right) = \\frac{\\pi}{2}$ rad."`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");
      expect(result.totalValid).toBe(1);
      expect(result.questions[0].question).toContain("\\Delta\\phi");
      expect(result.questions[0].options.B).toBe("$\\pi/2$");
      expect(result.secureRecords[0].correctAnswer).toBe("B");
    });

    it("extracts promotional course from columns K-O (Chemistry/Bio row 1+2 format)", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation","","Course Thumbnail","Course Tag","Course Name","Course Description","course Link"
"Chemistry","Solid State","Sample Q","Opt A","Opt B","Opt C","Opt D","A","Sol","","https://lh3.googleusercontent.com/d/1sJIQAiakF0XBZjycNZtdhkm6r-EUbBaz","Crash Course","Chemistry Mastery 2027","Complete 2nd PUC prep","https://physicspeptalk.com/new-courses/128-sudarshana-2027-kcet-pcm-fastrack"`;

      const result = parseSheetCsvToQuestions(csv, "chemistry", "Chemistry");
      expect(result.totalValid).toBe(1);
      expect(result.promoCourse).toBeDefined();
      expect(result.promoCourse?.title).toBe("Chemistry Mastery 2027");
      expect(result.promoCourse?.tag).toBe("Crash Course");
      expect(result.promoCourse?.description).toBe("Complete 2nd PUC prep");
      expect(result.promoCourse?.buyUrl).toBe("https://physicspeptalk.com/new-courses/128-sudarshana-2027-kcet-pcm-fastrack");
      expect(result.promoCourse?.thumbnailUrl).toContain("wsrv.nl");
    });

    it("extracts promotional course from columns K-O (Physics/Maths row 1 combined text format)", () => {
      const csv = `"SUBJECT","TOPIC","QUESTION","a","b","c","d","Corrrect answer","Explanation","","Course Thumbnail https://lh3.googleusercontent.com/d/1sJIQAiakF0XBZjycNZtdhkm6r-EUbBaz","Course Tag Test","Course Name test name","Course Description test description","course Link https://physicspeptalk.com/new-courses/128-sudarshana-2027-kcet-pcm-fastrack"
"Physics","Optics","Sample Q","Opt A","Opt B","Opt C","Opt D","A","Sol","","","","","",""`;

      const result = parseSheetCsvToQuestions(csv, "physics", "Physics");
      expect(result.totalValid).toBe(1);
      expect(result.promoCourse).toBeDefined();
      expect(result.promoCourse?.title).toBe("test name");
      expect(result.promoCourse?.tag).toBe("Test");
      expect(result.promoCourse?.description).toBe("test description");
      expect(result.promoCourse?.buyUrl).toBe("https://physicspeptalk.com/new-courses/128-sudarshana-2027-kcet-pcm-fastrack");
    });
  });
});
