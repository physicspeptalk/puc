import { describe, it, expect } from "vitest";
import { parseRoute } from "./App";

describe("Route parser", () => {
  it("parses root home route", () => {
    expect(parseRoute("/")).toEqual({ page: "home" });
    expect(parseRoute("")).toEqual({ page: "home" });
  });

  it("parses blog routes", () => {
    expect(parseRoute("/blogs")).toEqual({ page: "blog-listing" });
    expect(parseRoute("/blogs/")).toEqual({ page: "blog-listing" });
    expect(parseRoute("/blogs/kcet-strategy-2025")).toEqual({
      page: "blog-article",
      slug: "kcet-strategy-2025",
    });
  });

  it("parses faculties route", () => {
    expect(parseRoute("/faculties")).toEqual({ page: "faculties" });
    expect(parseRoute("/faculties/")).toEqual({ page: "faculties" });
  });

  it("parses test hub routes (/test and /tests)", () => {
    expect(parseRoute("/test")).toEqual({ page: "test-hub" });
    expect(parseRoute("/test/")).toEqual({ page: "test-hub" });
    expect(parseRoute("/tests")).toEqual({ page: "test-hub" });
    expect(parseRoute("/tests/")).toEqual({ page: "test-hub" });
  });

  it("parses all four subject routes under /test and /tests", () => {
    // 1. Physics
    expect(parseRoute("/test/physics")).toEqual({
      page: "test-subject",
      subject: "physics",
    });
    expect(parseRoute("/tests/physics")).toEqual({
      page: "test-subject",
      subject: "physics",
    });
    expect(parseRoute("/tests/physics/")).toEqual({
      page: "test-subject",
      subject: "physics",
    });

    // 2. Chemistry
    expect(parseRoute("/test/chemistry")).toEqual({
      page: "test-subject",
      subject: "chemistry",
    });
    expect(parseRoute("/tests/chemistry")).toEqual({
      page: "test-subject",
      subject: "chemistry",
    });

    // 3. Mathematics
    expect(parseRoute("/test/maths")).toEqual({
      page: "test-subject",
      subject: "maths",
    });
    expect(parseRoute("/tests/maths")).toEqual({
      page: "test-subject",
      subject: "maths",
    });

    // 4. Biology
    expect(parseRoute("/test/bio")).toEqual({
      page: "test-subject",
      subject: "bio",
    });
    expect(parseRoute("/tests/bio")).toEqual({
      page: "test-subject",
      subject: "bio",
    });
    expect(parseRoute("/tests/biology")).toEqual({
      page: "test-subject",
      subject: "bio",
    });
  });
});
