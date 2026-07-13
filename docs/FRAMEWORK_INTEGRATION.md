# Framework Integration

The runtime is framework-independent. Create it after the canvas element exists, connect observers owned by the component, and clean up both observers and runtime during unmount.

## Angular Pattern

```ts
ngAfterViewInit(): void {
  this.runtime = createCanvasRuntime({
    canvas: this.canvasRef.nativeElement,
    logicalWidth: 160,
    logicalHeight: 160,
    pixelRatio: "auto",
    imageSmoothing: false,
    pauseWhenHidden: true,
    render: (context) => this.render(context),
  });

  this.resizeObserver = new ResizeObserver(() => {
    this.runtime?.resizeToDisplaySize();
  });

  this.resizeObserver.observe(this.canvasRef.nativeElement);
  this.runtime.renderOnce();
  this.runtime.start();
}

ngOnDestroy(): void {
  this.resizeObserver?.disconnect();
  this.runtime?.destroy();
}
```

## React, Vue and Web Components

- Create the runtime in the mount lifecycle after the `<canvas>` reference is set.
- Store every `Unsubscribe` returned by runtime, animator or state machine subscriptions.
- Disconnect `ResizeObserver` and call `runtime.destroy()` during unmount.
- Importing the package is SSR-safe; creating a runtime still requires a real canvas.

## Pixel Art

Use `imageSmoothing: false` and CSS `image-rendering: pixelated` when rendering crisp pixel sprites across DPR 1 and DPR 2 screens.
