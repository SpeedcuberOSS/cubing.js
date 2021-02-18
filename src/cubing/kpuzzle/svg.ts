import type {
  FaceletMeshAppearance,
  PuzzleAppearance,
} from "../twisty/3D/puzzles/appearance"; // TODO
import { KPuzzleDefinition, Transformation } from "./definition_types";
import { KPuzzle } from "./kpuzzle";

const xmlns = "http://www.w3.org/2000/svg";

// Unique ID mechanism to keep SVG gradient element IDs unique. TODO: Is there
// something more performant, and that can't be broken by other elements of the
// page? (And also doesn't break if this library is run in parallel.)
let svgCounter = 0;
function nextSVGID(): string {
  svgCounter += 1;
  return "svg" + svgCounter.toString();
}

// TODO: This is hardcoded to 3x3x3 SVGs
const colorMaps: Partial<Record<
  FaceletMeshAppearance,
  Record<string, string>
>> = {
  dim: {
    "white": "#dddddd",
    "orange": "#884400",
    "limegreen": "#008800",
    "red": "#660000",
    "rgb(34, 102, 255)": "#000088", // TODO
    "yellow": "#888800",
  },
  oriented: {
    "white": "#ff88ff",
    "orange": "#ff88ff",
    "limegreen": "#ff88ff",
    "red": "#ff88ff",
    "rgb(34, 102, 255)": "#ff88ff", // TODO
    "yellow": "#ff88ff",
  },
  ignored: {
    "white": "#444444",
    "orange": "#444444",
    "limegreen": "#444444",
    "red": "#444444",
    "rgb(34, 102, 255)": "#444444", // TODO
    "yellow": "#444444",
  },
  invisible: {
    "white": "#00000000",
    "orange": "#00000000",
    "limegreen": "#00000000",
    "red": "#00000000",
    "rgb(34, 102, 255)": "#00000000", // TODO
    "yellow": "#00000000",
  },
};

export class KPuzzleSVGWrapper {
  public element: HTMLElement;
  public gradientDefs: SVGDefsElement;
  private originalColors: { [type: string]: string } = {};
  private gradients: { [type: string]: SVGGradientElement } = {};
  private svgID: string;
  constructor(
    public kPuzzleDefinition: KPuzzleDefinition,
    svgSource: string,
    experimentalAppearance?: PuzzleAppearance,
  ) {
    if (!svgSource) {
      throw new Error(
        `No SVG definition for puzzle type: ${kPuzzleDefinition.name}`,
      );
    }

    this.svgID = nextSVGID();

    this.element = document.createElement("div");
    this.element.classList.add("svg-wrapper");
    // TODO: Sanitization.
    this.element.innerHTML = svgSource;

    const svgElem = this.element.querySelector("svg");
    if (!svgElem) {
      throw new Error("Could not get SVG element");
    }
    if (xmlns !== svgElem.namespaceURI) {
      throw new Error("Unexpected XML namespace");
    }
    svgElem.style.maxWidth = "100%";
    svgElem.style.maxHeight = "100%";
    this.gradientDefs = document.createElementNS(
      xmlns,
      "defs",
    ) as SVGDefsElement;
    svgElem.insertBefore(this.gradientDefs, svgElem.firstChild);

    for (const orbitName in kPuzzleDefinition.orbits) {
      const orbitDefinition = kPuzzleDefinition.orbits[orbitName];

      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (
          let orientation = 0;
          orientation < orbitDefinition.orientations;
          orientation++
        ) {
          const id = this.elementID(orbitName, idx, orientation);
          const elem = this.elementByID(id);
          let originalColor: string = elem.style.fill;
          /// TODO: Allow setting appearance dynamically.
          if (experimentalAppearance) {
            (() => {
              // TODO: dedup with Cube3D,,factor out fallback calculations
              const a = experimentalAppearance.orbits;
              if (!a) {
                return;
              }
              const orbitAppearance = a[orbitName];
              if (!orbitAppearance) {
                return;
              }
              const pieceAppearance = orbitAppearance.pieces[idx];
              if (!pieceAppearance) {
                return;
              }
              const faceletAppearance = pieceAppearance.facelets[orientation];
              if (!faceletAppearance) {
                return;
              }
              const appearance =
                typeof faceletAppearance === "string"
                  ? faceletAppearance
                  : faceletAppearance?.appearance;
              const colorMap = colorMaps[appearance];
              if (colorMap) {
                originalColor = colorMap[originalColor];
              }
            })();
          } else {
            originalColor = elem.style.fill as string;
          }
          this.originalColors[id] = originalColor;
          this.gradients[id] = this.newGradient(id, originalColor);
          this.gradientDefs.appendChild(this.gradients[id]);
          elem.setAttribute("style", `fill: url(#grad-${this.svgID}-${id})`);
        }
      }
    }
  }

  public drawKPuzzle(
    kpuzzle: KPuzzle,
    nextState?: Transformation,
    fraction?: number,
  ): void {
    this.draw(kpuzzle.definition, kpuzzle.state, nextState, fraction);
  }

  // TODO: save definition in the constructor?
  public draw(
    definition: KPuzzleDefinition,
    state: Transformation,
    nextState?: Transformation,
    fraction?: number,
  ): void {
    for (const orbitName in definition.orbits) {
      const orbitDefinition = definition.orbits[orbitName];

      const curOrbitState = state[orbitName];
      const nextOrbitState = nextState
        ? (nextState as Transformation)[orbitName]
        : null;
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        for (
          let orientation = 0;
          orientation < orbitDefinition.orientations;
          orientation++
        ) {
          const id = this.elementID(orbitName, idx, orientation);
          const fromCur = this.elementID(
            orbitName,
            curOrbitState.permutation[idx],
            (orbitDefinition.orientations -
              curOrbitState.orientation[idx] +
              orientation) %
              orbitDefinition.orientations,
          );
          let singleColor = false;
          if (nextOrbitState) {
            const fromNext = this.elementID(
              orbitName,
              nextOrbitState.permutation[idx],
              (orbitDefinition.orientations -
                nextOrbitState.orientation[idx] +
                orientation) %
                orbitDefinition.orientations,
            );
            if (fromCur === fromNext) {
              singleColor = true; // TODO: Avoid redundant work during move.
            }
            fraction = fraction || 0; // TODO Use the type system to tie this to nextState?
            const easedBackwardsPercent =
              100 * (1 - fraction * fraction * (2 - fraction * fraction)); // TODO: Move easing up the stack.
            this.gradients[id].children[0].setAttribute(
              "stop-color",
              this.originalColors[fromCur],
            );
            this.gradients[id].children[1].setAttribute(
              "stop-color",
              this.originalColors[fromCur],
            );
            this.gradients[id].children[1].setAttribute(
              "offset",
              `${Math.max(easedBackwardsPercent - 5, 0)}%`,
            );
            this.gradients[id].children[2].setAttribute(
              "offset",
              `${Math.max(easedBackwardsPercent - 5, 0)}%`,
            );
            this.gradients[id].children[3].setAttribute(
              "offset",
              `${easedBackwardsPercent}%`,
            );
            this.gradients[id].children[4].setAttribute(
              "offset",
              `${easedBackwardsPercent}%`,
            );
            this.gradients[id].children[4].setAttribute(
              "stop-color",
              this.originalColors[fromNext],
            );
            this.gradients[id].children[5].setAttribute(
              "stop-color",
              this.originalColors[fromNext],
            );
          } else {
            singleColor = true; // TODO: Avoid redundant work during move.
          }
          if (singleColor) {
            this.gradients[id].children[0].setAttribute(
              "stop-color",
              this.originalColors[fromCur],
            );
            this.gradients[id].children[1].setAttribute(
              "stop-color",
              this.originalColors[fromCur],
            );
            this.gradients[id].children[1].setAttribute("offset", `100%`);
            this.gradients[id].children[2].setAttribute("offset", `100%`);
            this.gradients[id].children[3].setAttribute("offset", `100%`);
            this.gradients[id].children[4].setAttribute("offset", `100%`);
          }
          // this.gradients[id]
          // this.elementByID(id).style.fill = this.originalColors[from];
        }
      }
    }
  }

  private newGradient(id: string, originalColor: string): SVGGradientElement {
    const grad = document.createElementNS(
      xmlns,
      "radialGradient",
    ) as SVGGradientElement;
    grad.setAttribute("id", `grad-${this.svgID}-${id}`);
    grad.setAttribute("r", `70.7107%`); // TODO: Adapt to puzzle.
    const stopDefs = [
      { offset: 0, color: originalColor },
      { offset: 0, color: originalColor },
      { offset: 0, color: "black" },
      { offset: 0, color: "black" },
      { offset: 0, color: originalColor },
      { offset: 100, color: originalColor },
    ];
    for (const stopDef of stopDefs) {
      const stop = document.createElementNS(xmlns, "stop") as SVGStopElement;
      stop.setAttribute("offset", `${stopDef.offset}%`);
      stop.setAttribute("stop-color", stopDef.color);
      stop.setAttribute("stop-opacity", "1");
      grad.appendChild(stop);
    }
    return grad;
  }

  private elementID(
    orbitName: string,
    idx: number,
    orientation: number,
  ): string {
    return orbitName + "-l" + idx + "-o" + orientation;
  }

  private elementByID(id: string): HTMLElement {
    // TODO: Use classes and scope selector to SVG element.
    return this.element.querySelector("#" + id) as HTMLElement;
  }
}
