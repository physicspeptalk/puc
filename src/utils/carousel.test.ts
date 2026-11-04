import { describe, it, expect } from "vitest";
import {
  calculateCarouselDimensions,
  calculateTrackTranslateX,
  getExtendedSlides,
  normalizeActiveIndex,
  getCourseDetails,
  THEMES,
  DEFAULT_FALLBACK_COURSES,
} from "./carousel";
import type { Course } from "../services/courseService";

describe("calculateCarouselDimensions", () => {
  it("handles zero or negative container width safely", () => {
    expect(calculateCarouselDimensions(0)).toEqual({
      gap: 16,
      slideWidth: 0,
      centerOffset: 0,
      peekWidth: 0,
    });
    expect(calculateCarouselDimensions(-50)).toEqual({
      gap: 16,
      slideWidth: 0,
      centerOffset: 0,
      peekWidth: 0,
    });
  });

  it("calculates desktop dimensions with 2 banners side-by-side (e.g. 1200px container)", () => {
    const dim = calculateCarouselDimensions(1200);
    expect(dim.gap).toBe(20);
    // (1200 - 20) / 2 = 590
    expect(dim.slideWidth).toBe(590);
    expect(dim.slideWidth * 2 + dim.gap).toBe(1200);
    expect(dim.centerOffset).toBe(0);
    expect(dim.peekWidth).toBe(0);
  });

  it("calculates desktop dimensions on large 1600px screens (2 banners side-by-side)", () => {
    const dim = calculateCarouselDimensions(1600);
    expect(dim.gap).toBe(20);
    expect(dim.slideWidth).toBe(Math.floor((1600 - 20) / 2));
    expect(dim.slideWidth * 2 + dim.gap).toBe(1600);
  });

  it("calculates tablet dimensions as 1 banner (< 1024px)", () => {
    const dim = calculateCarouselDimensions(768);
    expect(dim.gap).toBe(16);
    expect(dim.slideWidth).toBe(768);
    expect(dim.centerOffset).toBe(0);
  });

  it("calculates mobile dimensions as 1 banner (e.g. 390px container)", () => {
    const dim = calculateCarouselDimensions(390);
    expect(dim.gap).toBe(16);
    expect(dim.slideWidth).toBe(390);
    expect(dim.centerOffset).toBe(0);
  });
});

describe("calculateTrackTranslateX", () => {
  it("returns 0 if slideWidth <= 0", () => {
    expect(
      calculateTrackTranslateX({
        centerOffset: 0,
        slideWidth: 0,
        gap: 20,
        currentIndex: 1,
      })
    ).toBe(0);
  });

  it("aligns slide 1 (the first real slide) at x = 0", () => {
    const dim = calculateCarouselDimensions(1200);
    const tx = calculateTrackTranslateX({
      centerOffset: dim.centerOffset,
      slideWidth: dim.slideWidth,
      gap: dim.gap,
      currentIndex: 1,
    });
    // tx = -(1 - 1) * (slideWidth + gap) = 0
    expect(tx).toBe(0);
  });

  it("translates track smoothly when advancing to slide 2", () => {
    const dim = calculateCarouselDimensions(1200);
    const tx = calculateTrackTranslateX({
      centerOffset: dim.centerOffset,
      slideWidth: dim.slideWidth,
      gap: dim.gap,
      currentIndex: 2,
    });
    // tx = -(2 - 1) * (slideWidth + gap) = -(590 + 20) = -610
    expect(tx).toBe(-(dim.slideWidth + dim.gap));
  });

  it("smoothly incorporates interactive drag offset during touch gesture", () => {
    const dim = calculateCarouselDimensions(1200);
    const tx = calculateTrackTranslateX({
      centerOffset: dim.centerOffset,
      slideWidth: dim.slideWidth,
      gap: dim.gap,
      currentIndex: 1,
      dragOffset: 45,
    });
    expect(tx).toBe(45);
  });
});

describe("getExtendedSlides", () => {
  it("returns original array for empty or single-item lists", () => {
    expect(getExtendedSlides([])).toEqual([]);
    const single: Course[] = [
      { courseUrl: "url", thumbnailUrl: "thumb", description: "Course 1" },
    ];
    expect(getExtendedSlides(single)).toEqual(single);
  });

  it("prepends last item and appends two items for seamless 2-card desktop loop (N=3)", () => {
    const courses: Course[] = [
      { courseUrl: "url0", thumbnailUrl: "", description: "Course 0" },
      { courseUrl: "url1", thumbnailUrl: "", description: "Course 1" },
      { courseUrl: "url2", thumbnailUrl: "", description: "Course 2" },
    ];
    const extended = getExtendedSlides(courses);
    expect(extended).toHaveLength(6);
    expect(extended[0].description).toBe("Course 2"); // clone of last
    expect(extended[1].description).toBe("Course 0"); // real first
    expect(extended[2].description).toBe("Course 1");
    expect(extended[3].description).toBe("Course 2"); // real last
    expect(extended[4].description).toBe("Course 0"); // clone of first
    expect(extended[5].description).toBe("Course 1"); // clone of second
  });
});

describe("normalizeActiveIndex", () => {
  it("handles empty or single course sets", () => {
    expect(normalizeActiveIndex(0, 0)).toBe(0);
    expect(normalizeActiveIndex(1, 1)).toBe(0);
  });

  it("correctly maps 1..N to 0..N-1", () => {
    const N = 4;
    expect(normalizeActiveIndex(1, N)).toBe(0);
    expect(normalizeActiveIndex(2, N)).toBe(1);
    expect(normalizeActiveIndex(3, N)).toBe(2);
    expect(normalizeActiveIndex(4, N)).toBe(3);
  });

  it("correctly maps boundary clones (0 and N+1) to legitimate slide indices", () => {
    const N = 4;
    // index 0 is clone of last course (index 3)
    expect(normalizeActiveIndex(0, N)).toBe(3);
    // index 5 is clone of first course (index 0)
    expect(normalizeActiveIndex(5, N)).toBe(0);
  });
});

describe("getCourseDetails", () => {
  it("returns defaults for null course", () => {
    const details = getCourseDetails(null, 0);
    expect(details.title).toContain("KCET");
    expect(details.badge).toBe("Physics Pep Talk PLUS");
    expect(details.themeIndex).toBe(0);
  });

  it("categorizes counselling courses properly", () => {
    const course: Course = {
      courseUrl: "https://counselling.physicspeptalk.com",
      thumbnailUrl: "",
      description: "KCET & COMEDK Choice Filling & Counselling Guidance",
    };
    const details = getCourseDetails(course, 1);
    expect(details.badge).toContain("Counselling Series");
    expect(details.ctaText).toBe("Get started");
    expect(details.themeIndex).toBe(1 % THEMES.length);
  });

  it("categorizes boards courses properly", () => {
    const course: Course = {
      courseUrl: "https://physicspeptalk.teachx.in",
      thumbnailUrl: "",
      description: "1st PUC Physics NCERT Boards Theory & Derivations",
    };
    const details = getCourseDetails(course, 2);
    expect(details.badge).toContain("NCERT Boards Series");
    expect(details.ctaText).toBe("Enroll now");
    expect(details.themeIndex).toBe(2 % THEMES.length);
  });

  it("cycles theme indices safely", () => {
    expect(THEMES.length).toBe(5);
    for (let i = 0; i < 15; i++) {
      const details = getCourseDetails(DEFAULT_FALLBACK_COURSES[0], i);
      expect(details.themeIndex).toBeGreaterThanOrEqual(0);
      expect(details.themeIndex).toBeLessThan(THEMES.length);
    }
  });
});
