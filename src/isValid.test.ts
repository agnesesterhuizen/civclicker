import { describe, expect, test } from "vitest";
import { isValid } from "./jsutils";

describe("isValid", () => {
  test("returns false for null input", () => {
    expect(isValid(null)).toBe(false);
  });

  test("returns false for undefined input", () => {
    expect(isValid(undefined)).toBe(false);
  });

  test("returns false for NaN input", () => {
    expect(isValid(NaN)).toBe(false);
  });

  [123, "test", {}, []].forEach((input) => {
    test(`returns true for valid input: ${JSON.stringify(input)}`, () => {
      expect(isValid(input)).toBe(true);
    });
  });
});
