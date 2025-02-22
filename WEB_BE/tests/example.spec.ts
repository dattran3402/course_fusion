// example.test.ts
const addFunc = (a: number, b: number): number => {
  return a + b;
};

test("add function", () => {
  expect(addFunc(1, 2)).toBe(3);
});