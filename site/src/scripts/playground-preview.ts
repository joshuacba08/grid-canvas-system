import GridCanvasSystem from "grid-canvas-system";

interface PlaygroundMessage {
  type?: string;
  code?: string;
  html?: string;
}

function send(type: string, message?: string): void {
  window.parent.postMessage({ type, message }, window.location.origin);
}

function stringify(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

const nativeLog = console.log.bind(console);

console.log = (...values: unknown[]) => {
  nativeLog(...values);
  send("playground-log", values.map(stringify).join(" "));
};

window.addEventListener("error", (event) => {
  send("playground-error", event.error?.message ?? event.message);
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  send(
    "playground-error",
    reason instanceof Error ? reason.message : stringify(reason),
  );
});

window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || typeof event.data !== "object") {
    return;
  }

  const message = event.data as PlaygroundMessage;

  if (
    message.type !== "playground-run" ||
    typeof message.code !== "string" ||
    typeof message.html !== "string"
  ) {
    return;
  }

  const root = document.querySelector<HTMLElement>("#preview-root");

  if (root === null) {
    send("playground-error", "Preview root was not found.");
    return;
  }

  root.innerHTML = message.html;

  const canvas = root.querySelector<HTMLCanvasElement>("#canvas");

  if (canvas === null) {
    send("playground-error", "Preview canvas was not found.");
    return;
  }

  try {
    const execute = new Function(
      "GridCanvasSystem",
      "canvas",
      "root",
      `"use strict";\n${message.code}\n//# sourceURL=grid-canvas-playground.js`,
    );

    execute(GridCanvasSystem, canvas, root);
    send("playground-running", "Scene running.");
  } catch (error) {
    send("playground-error", error instanceof Error ? error.message : stringify(error));
  }
});

send("playground-ready");
