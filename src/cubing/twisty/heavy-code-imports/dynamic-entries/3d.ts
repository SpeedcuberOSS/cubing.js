import { cube3x3x3, PuzzleLoader } from "../../../puzzles";
import type { AlgCursor } from "../../old/animation/cursor/AlgCursor";
import type { HintFaceletStyle } from "../../old/dom/TwistyPlayerConfig";
import { Cube3D, Cube3DOptions } from "../../views/3D/puzzles/Cube3D";
import { PG3D } from "../../views/3D/puzzles/PG3D";

// Mangled to avoid autocompleting.
// This must not be imported directly.
export * as T3I from "three";
export { Twisty3DCanvas } from "../../old/dom/viewers/Twisty3DCanvas";
export { Cube3D } from "../../views/3D/puzzles/Cube3D";
export { PG3D } from "../../views/3D/puzzles/PG3D";
export { Twisty3DScene } from "../../views/3D/Twisty3DScene";

export async function cube3DShim(options?: Cube3DOptions): Promise<Cube3D> {
  const cursorShim = { addPositionListener: () => {} } as any as AlgCursor; // TODO
  const renderCallbackShim = () => {};
  return new Cube3D(
    await cube3x3x3.def(),
    cursorShim,
    renderCallbackShim,
    options,
  );
}

// TODO: take loader?
export async function pg3dShim(
  puzzleLoader: PuzzleLoader,
  hintFacelets: HintFaceletStyle,
): Promise<PG3D> {
  const cursorShim = { addPositionListener: () => {} } as any as AlgCursor; // TODO
  const renderCallbackShim = () => {};
  return new PG3D(
    cursorShim,
    renderCallbackShim,
    await puzzleLoader.def(),
    (await puzzleLoader.pg!()).get3d(),
    true,
    hintFacelets === "floating",
  );
}
