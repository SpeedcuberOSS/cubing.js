// Stub file for testing.
// Feel free to add code here if you need a quick place to run some code, but avoid committing any changes.

import {
  TwistyDerivedProp,
  TwistyPropSource,
} from "../../../../cubing/twisty/dom/twisty-player-model/ManagedSource";

// Note: this file needs to contain code to avoid a Snowpack error.
// So we put a `console.log` here for now.
console.log("Loading stub file.");

class A extends TwistyPropSource<number> {
  defaultValue: 4;
}

class B extends TwistyDerivedProp<{ a: number }, number> {
  async derive(input: { a: number }): Promise<number> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 100),
    );
    return (input.a * 2) % 17;
  }
}

class C extends TwistyDerivedProp<{ a: number }, number> {
  async derive(input: { a: number }): Promise<number> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 10),
    );
    return (input.a * 3) % 17;
  }
}

class D extends TwistyDerivedProp<{ b: number; c: number }, boolean> {
  async derive(input: { b: number; c: number }): Promise<boolean> {
    await new Promise(async (resolve) =>
      setTimeout(resolve, Math.random() * 10),
    );
    return input.b > input.c;
  }
}

const a = new A(2);
const b = new B({ a });
const c = new C({ a });
const d = new D({ b, c });

console.log(await a.get(), await b.get(), await c.get(), await d.get());
a.set(6);
console.log(await a.get(), await b.get(), await c.get(), await d.get());
a.set(8);
console.log(await a.get(), await b.get(), await c.get(), await d.get());
for (let i = 0; i < 17; i++) {
  a.set(i);
  console.log(await a.get(), await d.get());
}

for (let i = 0; i < 17; i++) {
  a.set(i);
  d.get().then(async (dv) => console.log(i, await a.get(), dv));
  await new Promise(async (resolve) => setTimeout(resolve, Math.random() * 5));
}
