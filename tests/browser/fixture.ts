import GridCanvasSystem from "../../dist/grid-canvas-system.es.js";
import * as runtime from "../../dist/runtime/index.js";
import * as arcade from "../../dist/audio-arcade/index.js";
import * as audio from "../../dist/audio/index.js";
import * as Tone from "tone";
import { Howler } from "howler";

Object.assign(window, {
  library: {
    GridCanvasSystem,
    ...GridCanvasSystem.runtime,
    ...runtime,
    ...arcade,
    ...audio,
  },
});
Object.assign(window, { peers: { Tone, Howler } });
