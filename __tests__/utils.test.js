import { isCorrectVal, isObject, isEmptyObject } from "../src/utils";

test('test isCorrectVal(val)', () => {
  expect(isCorrectVal('')).toBe(false);
  expect(isCorrectVal('string')).toBe(true);
  expect(isCorrectVal(6)).toBe(true);
  expect(isCorrectVal(null)).toBe(false);
  expect(isCorrectVal(undefined)).toBe(false);
  expect(isCorrectVal({ a: 1 })).toBe(true);
  expect(isCorrectVal([])).toBe(false);
  expect(isCorrectVal([1])).toBe(true);
});

test("test isObject(obj)", () => {
  expect(isObject({})).toBe(true);
});

test("test isEmptyObject(obj)", () => {
  expect(isEmptyObject({})).toBe(true);
  expect(isEmptyObject({ a: 1 })).toBe(false);
});