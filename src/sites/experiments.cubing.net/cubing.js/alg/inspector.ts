import { Alg, type AlgNode } from "../../../../cubing/alg";
import type { Parsed } from "../../../../cubing/alg/parseAlg";
import { extract } from "./extractor";

const algElem = document.querySelector("#alg") as HTMLTextAreaElement;
const inspectorElem = document.querySelector("#inspector") as HTMLPreElement;

function bracket(n: number): string {
  console.log({ n });
  if (n < 2) {
    return Array(n).fill("␣").join("");
  }
  return `└${new Array(n - 2).fill("─").join("")}┘`;
}

function updateInspector(s: string): void {
  const singleLineS = s.replaceAll("\n", "⏎");
  inspectorElem.textContent = "";
  try {
    const parsed = Alg.fromString(s);
    for (const [name, v] of extract(parsed)) {
      const parsed = v as Parsed<Alg | AlgNode>;
      inspectorElem.textContent += "\n";
      inspectorElem.textContent += `${name}: `.padStart(12, " ");
      inspectorElem.textContent += "".padStart(parsed.startCharIndex, " ");
      inspectorElem.textContent += singleLineS.slice(
        parsed.startCharIndex,
        parsed.endCharIndex,
      );
      inspectorElem.textContent += "\n";
      inspectorElem.textContent += "".padEnd(12 + parsed.startCharIndex, " ");
      inspectorElem.textContent += bracket(
        parsed.endCharIndex - parsed.startCharIndex,
      );
    }
  } catch (e) {
    console.error(e);
    inspectorElem.textContent +=
      "\n--------\nERROR:\n" + (e as Error).toString();
  }
}

algElem.addEventListener("input", () => updateInspector(algElem.value));

updateInspector(algElem.value);
