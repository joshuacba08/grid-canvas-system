export const PAGE_PLAYGROUND_EXAMPLE_ID = "page-example";

export interface PlaygroundLaunch {
  description: string;
  html: string;
  javascript: string;
  title: string;
}

export function createPlaygroundLaunchUrl(launch: PlaygroundLaunch): string {
  const params = new URLSearchParams({
    description: launch.description,
    example: PAGE_PLAYGROUND_EXAMPLE_ID,
    html: launch.html,
    javascript: launch.javascript,
    title: launch.title,
  });

  return `/playground/?${params.toString()}`;
}

export function readPlaygroundLaunch(search: string): PlaygroundLaunch | null {
  const params = new URLSearchParams(search);

  if (params.get("example") !== PAGE_PLAYGROUND_EXAMPLE_ID) {
    return null;
  }

  const javascript = params.get("javascript");

  if (javascript === null || javascript.trim() === "") {
    return null;
  }

  return {
    description:
      params.get("description") ?? "A scene loaded directly from another page.",
    html:
      params.get("html") ??
      '<canvas id="canvas" aria-label="Grid Canvas preview"></canvas>',
    javascript,
    title: params.get("title") ?? "Page example",
  };
}
