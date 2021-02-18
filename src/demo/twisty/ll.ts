import { parseAlg } from "../../cubing/alg/index";
import { KPuzzle, KPuzzleSVGWrapper } from "../../cubing/kpuzzle";
import { puzzles } from "../../cubing/puzzles";
import "../../cubing/twisty/dom/TwistyPlayer";

window.addEventListener("load", async () => {
  const def = await puzzles["3x3x3"].def();
  const llSVG = await puzzles["3x3x3"].llSVG!(); // TODO: Avoid the need for an assertion?
  const kpuzzle = new KPuzzle(def);

  {
    const svg = new KPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("R U R' U' R' F R2 U' R' U' R U R' F'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new KPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("((M' U')4 x y)3"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }

  {
    const svg = new KPuzzleSVGWrapper(def, llSVG);
    kpuzzle.reset();
    kpuzzle.applyAlg(parseAlg("r U R' U R U2 r'"));
    svg.draw(def, kpuzzle.state);
    document.body.appendChild(svg.element);
  }
});
