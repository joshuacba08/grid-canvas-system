import { createElement, StrictMode, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { createApp, h, onMounted, onUnmounted } from "vue";
import "@angular/compiler";
import { Component, ElementRef, provideZonelessChangeDetection } from "@angular/core";
import { bootstrapApplication } from "@angular/platform-browser";
import { createCanvasRuntime } from "../../dist/runtime/index.js";

const runtimes: ReturnType<typeof createCanvasRuntime>[] = [];
function mount(canvas: HTMLCanvasElement) {
  const runtime = createCanvasRuntime({
    canvas,
    logicalWidth: 40,
    logicalHeight: 40,
    render: (ctx) => {
      ctx.fillStyle = "#ff0000";
      ctx.fillRect(0, 0, 10, 10);
    },
  });
  runtime.renderOnce();
  runtime.start();
  runtimes.push(runtime);
  return runtime;
}

function ReactCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const runtime = mount(ref.current!);
    return () => runtime.destroy();
  }, []);
  return createElement("canvas", { ref });
}

async function exerciseReact() {
  const host = document.createElement("div");
  document.body.append(host);
  const root = createRoot(host);
  root.render(createElement(StrictMode, null, createElement(ReactCanvas)));
  await new Promise<void>((resolve) => {
    const check = () =>
      host.querySelector("canvas")?.width === 40
        ? resolve()
        : requestAnimationFrame(check);
    check();
  });
  root.unmount();
  host.remove();
}

function exerciseVue() {
  const host = document.createElement("div");
  document.body.append(host);
  const app = createApp({
    setup() {
      let canvas: HTMLCanvasElement;
      let runtime: ReturnType<typeof mount>;
      onMounted(() => {
        runtime = mount(canvas);
      });
      onUnmounted(() => runtime.destroy());
      return () =>
        h("canvas", {
          ref: (value) => {
            canvas = value as HTMLCanvasElement;
          },
        });
    },
  });
  app.mount(host);
  app.unmount();
  host.remove();
}

async function exerciseAngular() {
  class AngularCanvas {
    runtime?: ReturnType<typeof mount>;
    constructor(public element: ElementRef<HTMLElement>) {}
    ngAfterViewInit() {
      this.runtime = mount(this.element.nativeElement.querySelector("canvas")!);
    }
    ngOnDestroy() {
      this.runtime?.destroy();
    }
  }
  Component({
    selector: "test-canvas",
    standalone: true,
    template: "<canvas></canvas>",
  })(AngularCanvas);
  const host = document.createElement("test-canvas");
  document.body.append(host);
  // Explicit factory metadata lets this integration fixture use JIT without
  // requiring TypeScript decorator emit or a production Angular build chain.
  (AngularCanvas as any).ctorParameters = () => [{ type: ElementRef }];
  const app = await bootstrapApplication(AngularCanvas, {
    providers: [provideZonelessChangeDetection()],
  });
  app.destroy();
  host.remove();
}

function exerciseCustomElement() {
  class CanvasElement extends HTMLElement {
    runtime?: ReturnType<typeof mount>;
    connectedCallback() {
      const canvas = document.createElement("canvas");
      this.append(canvas);
      this.runtime = mount(canvas);
    }
    disconnectedCallback() {
      this.runtime?.destroy();
    }
  }
  if (!customElements.get("fixture-canvas"))
    customElements.define("fixture-canvas", CanvasElement);
  const host = document.createElement("fixture-canvas");
  document.body.append(host);
  host.remove();
}

Object.assign(window, {
  exerciseFrameworks: async () => {
    await exerciseReact();
    exerciseVue();
    await exerciseAngular();
    exerciseCustomElement();
    return {
      count: runtimes.length,
      destroyed: runtimes.every((runtime) => runtime.isDestroyed()),
    };
  },
});
