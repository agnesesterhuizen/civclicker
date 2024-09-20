// @vitest-environment jsdom

import { beforeEach, describe, expect, test } from "vitest";
import { CivObj } from "./CivObj";
import { copyProps } from "./jsutils";

export const isEmptyObject = (v: any) => JSON.stringify(v) === "{}";

declare global {
  interface Window {
    curCiv: Record<string, any>;
  }
}

const basePropertyNames = [
  "id",
  "name",
  "subType",
  "owned",
  "prereqs",
  "require",
  "salable",
  "vulnerable",
  "effectText",
  "prestige",
  "initOwned",
  "init",
  "reset",
  "limit",
  "hasVariableCost",
];

describe("Base object", () => {
  beforeEach(() => {
    window.curCiv = {};
  });

  test("defaults", () => {
    const obj = new CivObj({});
    expect(obj.subType).toBe("normal");
    expect(isEmptyObject(obj.prereqs)).toBe(true);
    expect(isEmptyObject(obj.require)).toBe(true);
    expect(obj.salable).toBe(false);
    expect(obj.vulnerable).toBe(true);
    expect(obj.effectText).toBe("");
    expect(obj.prestige).toBe(false);
    expect(obj.initOwned).toBe(0);
  });

  test("constructor creates object with properties from list", () => {
    const props = basePropertyNames.reduce((p, prop) => ({ ...p, [prop]: "test" }), {});
    const obj = new CivObj(props);

    basePropertyNames.forEach((name) => {
      expect(obj[name]).toBeDefined();
    });
  });

  test("derived obj", () => {
    function Derived(props) {
      if (!(this instanceof Derived)) {
        // @ts-expect-error
        return new Derived(props);
      }
      CivObj.call(this, props);
      copyProps(this, props, null, true);
      return this;
    }
    Derived.prototype = new CivObj(
      {
        constructor: Derived,
        type: "derived",
      },
      true,
    );

    // @ts-expect-error
    const obj = new Derived({});
    expect(obj instanceof CivObj).toBe(true);
  });

  test("init, fullInit=undefined", () => {
    const testId = "test_id";
    const fullInit = undefined;
    const obj = new CivObj({ id: testId }, true);

    window.curCiv[testId] = null;
    obj.init(fullInit);

    expect(window.curCiv[testId]).toMatchObject({ owned: 0 });
  });

  test("init, fullInit=false, prestige=true", () => {
    const testId = "test_id";
    const fullInit = false;
    const obj = new CivObj({ id: testId, prestige: true }, true);

    window.curCiv[testId] = null;
    obj.init(fullInit);

    expect(window.curCiv[testId]).toBeNull();
  });

  test("init, fullInit=false, prestige=false", () => {
    const testId = "test_id";
    const fullInit = false;
    const obj = new CivObj({ id: testId, prestige: false }, true);

    window.curCiv[testId] = null;
    obj.init(fullInit);

    expect(window.curCiv[testId]).toMatchObject({ owned: 0 });
  });

  test("init, fullInit=true, prestige=false", () => {
    const testId = "test_id";
    const fullInit = true;
    const obj = new CivObj({ id: testId, prestige: false }, true);

    window.curCiv[testId] = null;
    obj.init(fullInit);

    // does not modify data
    expect(window.curCiv[testId]).toMatchObject({ owned: 0 });
  });

  test("init, fullInit=true, prestige=true", () => {
    const testId = "test_id";
    const fullInit = true;
    const obj = new CivObj({ id: testId, prestige: false }, true);

    window.curCiv[testId] = null;
    obj.init(fullInit);

    // does not modify data
    expect(window.curCiv[testId]).toMatchObject({ owned: 0 });
  });

  test("init, fullInit=true, initOwned=undefined", () => {
    const testId = "test_id";
    const fullInit = true;
    const obj = new CivObj({ id: testId, prestige: false }, true);

    window.curCiv[testId] = null;
    obj.initOwned = undefined;
    obj.init(fullInit);

    // does not modify data
    expect(isEmptyObject(window.curCiv[testId])).toBe(true);
  });

  test("reset,prestige=true", () => {
    const testId = "test_id";
    const obj = new CivObj({ id: testId, prestige: true }, true);

    window.curCiv[testId] = null;
    obj.reset();

    expect(window.curCiv[testId]).toBeNull();
  });

  test("reset, prestige=false", () => {
    const testId = "test_id";
    const obj = new CivObj({ id: testId, prestige: false }, true);

    window.curCiv[testId] = null;
    obj.reset();

    expect(window.curCiv[testId]).toMatchObject({ owned: 0 });
  });

  test("data getter gets value with object id", () => {
    const testId = "test_id";
    const testData = "test_data";

    const obj = new CivObj({ id: testId });

    window.curCiv[testId] = testData;

    expect(obj.data).toBe(testData);
  });

  test("data setter sets value with object id", () => {
    const testId = "test_id";
    const testData = "test_data";

    const obj = new CivObj({ id: testId });

    obj.data = testData;

    expect(window.curCiv[testId]).toBe(testData);
  });

  test("owned getter gets value with object id", () => {
    const testId = "test_id";

    const obj = new CivObj({ id: testId });

    window.curCiv[testId] = { owned: 123 };

    expect(obj.owned).toBe(123);
  });

  test("owned setter sets value with object id", () => {
    const testId = "test_id";

    const obj = new CivObj({ id: testId });

    window.curCiv[testId] = {};

    obj.owned = 123;

    expect(window.curCiv[testId].owned).toBe(123);
  });

  test("limit, initOwned=number", () => {
    const obj = new CivObj({});
    obj.initOwned = 123;

    expect(obj.limit).toBe(Infinity);
  });

  test("limit, initOwned=true", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.initOwned = true;

    expect(obj.limit).toBe(true);
  });

  test("limit, initOwned=other", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.initOwned = {};

    expect(obj.limit).toBe(0);
  });

  test("hasVariableCost, no require property", () => {
    const obj = new CivObj({});
    delete obj.require;
    expect(obj.hasVariableCost()).toBe(false);
  });

  test("hasVariableCost, require is getter", () => {
    const obj = new CivObj({
      get require() {
        return 1;
      },
    });
    expect(obj.hasVariableCost()).toBe(true);
  });

  test("hasVariableCost, require contains function", () => {
    const obj = new CivObj({
      require: [123, function () {}],
    });
    expect(obj.hasVariableCost()).toBe(true);
  });

  test("hasVariableCost, no matches", () => {
    const obj = new CivObj({
      require: [123],
    });
    expect(obj.hasVariableCost()).toBe(false);
  });

  test("getQtyName, singular", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.singular = "thing";
    // @ts-expect-error
    obj.plural = "things";
    expect(obj.getQtyName(1)).toBe("thing");
  });

  test("getQtyName, multiple", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.singular = "thing";
    // @ts-expect-error
    obj.plural = "things";
    expect(obj.getQtyName(2)).toBe("things");
  });

  test("getQtyName, defaults to name if options not defined", () => {
    const obj = new CivObj({ name: "name" });
    expect(obj.getQtyName(123)).toBe("name");
  });

  test("getQtyName, defaults to singular if name not defined", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.name = null;
    // @ts-expect-error
    obj.singular = "thing";

    expect(obj.getQtyName(123)).toBe("thing");
  });

  test("getQtyName, defaults to (UNNAMED) if name or singular not defined", () => {
    const obj = new CivObj({});
    // @ts-expect-error
    obj.name = null;
    // @ts-expect-error
    obj.singular = null;

    expect(obj.getQtyName(123)).toBe("(UNNAMED)");
  });
});
