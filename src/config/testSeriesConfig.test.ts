import { describe, it, expect } from "vitest";
import {
  SUBJECT_CONFIGS,
  SUBJECT_ORDER,
  getSubjectConfig,
  SPREADSHEET_ID,
} from "./testSeriesConfig";

describe("testSeriesConfig", () => {
  it("defines all four required subjects", () => {
    expect(SUBJECT_ORDER).toEqual(["physics", "chemistry", "maths", "bio"]);
    expect(SUBJECT_CONFIGS.physics).toBeDefined();
    expect(SUBJECT_CONFIGS.chemistry).toBeDefined();
    expect(SUBJECT_CONFIGS.maths).toBeDefined();
    expect(SUBJECT_CONFIGS.bio).toBeDefined();
  });

  it("has the correct spreadsheet ID", () => {
    expect(SPREADSHEET_ID).toBe("14rnATEfz8Y4cQge9TzPM4QUuGocLOWhQLODL33hsvJg");
  });

  it("matches the required subject routes", () => {
    expect(SUBJECT_CONFIGS.physics.route).toBe("/test/physics");
    expect(SUBJECT_CONFIGS.chemistry.route).toBe("/test/chemistry");
    expect(SUBJECT_CONFIGS.maths.route).toBe("/test/maths");
    expect(SUBJECT_CONFIGS.bio.route).toBe("/test/bio");
  });

  it("verifies subject sheet GIDs", () => {
    // Verified GIDs from spreadsheet metadata
    expect(SUBJECT_CONFIGS.physics.sheetGid).toBe("396482003");
    expect(SUBJECT_CONFIGS.chemistry.sheetGid).toBe("338371251");
    expect(SUBJECT_CONFIGS.maths.sheetGid).toBe("742477729");
    expect(SUBJECT_CONFIGS.bio.sheetGid).toBe("1456450225");
  });

  it("resolves route strings and aliases using getSubjectConfig", () => {
    expect(getSubjectConfig("/test/physics")?.id).toBe("physics");
    expect(getSubjectConfig("/test/chemistry/")?.id).toBe("chemistry");
    expect(getSubjectConfig("/test/maths")?.id).toBe("maths");
    expect(getSubjectConfig("math")?.id).toBe("maths");
    expect(getSubjectConfig("/test/bio")?.id).toBe("bio");
    expect(getSubjectConfig("biology")?.id).toBe("bio");
  });
});
