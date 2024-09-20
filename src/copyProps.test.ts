import { describe, expect, test } from "vitest";
import { copyProps } from "./jsutils";

describe("copyProps", () => {
  test("copies all properties if names array null", () => {
    const dest = {};
    const src = {
      propA: 1,
      probB: 2,
    };

    copyProps(dest, src, null, false);

    expect(dest).toMatchObject({
      propA: 1,
      probB: 2,
    });
  });

  test("only copies properties in names array", () => {
    const dest = {};
    const src = {
      propA: 1,
      propB: 2,
    };

    const names = ["propB"];

    copyProps(dest, src, names, false);

    expect(dest).toMatchObject({
      propB: 2,
    });
  });

  test("skips named properties not in source object", () => {
    const dest = {};
    const src = {
      propA: 1,
    };

    const names = ["propB"];

    copyProps(dest, src, names, false);

    expect(dest).toMatchObject({});
  });

  test("source object is unmodified if deleteOld = false", () => {
    const dest = {};
    const src = {
      propA: 1,
    };

    copyProps(dest, src, null, false);

    expect(dest).toMatchObject({
      propA: 1,
    });
    expect(src.propA).toBeDefined();
  });

  test("deletes property from source object if deleteOld = true", () => {
    const dest = {};
    const src = {
      propA: 1,
    };

    copyProps(dest, src, null, true);

    expect(dest).toMatchObject({
      propA: 1,
    });
    expect(src.propA).toBeUndefined();
  });
});
