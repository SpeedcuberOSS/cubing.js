import { parse } from "../../src/alg/index";
import { Puzzles } from "../../src/kpuzzle/index";
import { Twisty } from "../../src/twisty/index";

window.addEventListener("load", () => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const elem = document.querySelector("#custom-example")!;
  (window as any).tw = new Twisty(elem, {
    puzzle: Puzzles.pyraminx,
    alg: parse("R U R' U R U R' U"),
  });
});
