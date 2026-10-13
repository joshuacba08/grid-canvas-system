import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, resolve, sep } from "node:path";
import { build } from "vite";

const isSite = process.argv.includes("--site");
const root = isSite ? resolve("site/dist") : process.cwd();
// Bundle the packed build with the actual optional peers, never mock audio APIs.
if (!isSite)
  await build({
    configFile: false,
    publicDir: false,
    build: {
      outDir: "tests/__artifacts__/browser",
      emptyOutDir: true,
      minify: false,
      lib: {
        entry: "tests/browser/fixture.ts",
        formats: ["es"],
        fileName: () => "fixture.js",
      },
    },
  });
if (!isSite && process.env.GCS_SOAK_SERVER !== "1")
  await build({
    configFile: false,
    publicDir: false,
    define: { "process.env.NODE_ENV": '"development"' },
    build: {
      outDir: "tests/__artifacts__/browser",
      emptyOutDir: false,
      minify: false,
      lib: {
        entry: "tests/browser/framework-fixture.ts",
        formats: ["es"],
        fileName: () => "framework-fixture.js",
      },
    },
  });
const types = {
  ".css": "text/css",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".js": "text/javascript",
  ".html": "text/html",
  ".png": "image/png",
  ".wav": "audio/wav",
};
const server = createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (pathname === "/test.wav") {
      const frames = 4410;
      const wav = Buffer.alloc(44 + frames * 2);
      wav.write("RIFF", 0);
      wav.writeUInt32LE(wav.length - 8, 4);
      wav.write("WAVEfmt ", 8);
      wav.writeUInt32LE(16, 16);
      wav.writeUInt16LE(1, 20);
      wav.writeUInt16LE(1, 22);
      wav.writeUInt32LE(44100, 24);
      wav.writeUInt32LE(88200, 28);
      wav.writeUInt16LE(2, 32);
      wav.writeUInt16LE(16, 34);
      wav.write("data", 36);
      wav.writeUInt32LE(frames * 2, 40);
      for (let i = 0; i < frames; i++)
        wav.writeInt16LE(
          Math.round(Math.sin((i * 440 * Math.PI * 2) / 44100) * 1000),
          44 + i * 2,
        );
      response.writeHead(200, { "content-type": "audio/wav" });
      response.end(wav);
      return;
    }
    if (pathname === "/" && !isSite) {
      response.writeHead(200, { "content-type": "text/html" });
      response.end(
        '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"></head><body><canvas id="canvas"></canvas><button id="audio">Audio</button><script type="module" src="/tests/__artifacts__/browser/fixture.js"></script></body></html>',
      );
      return;
    }
    let path = resolve(root, `.${pathname}`);
    if (path !== root && !path.startsWith(`${root}${sep}`)) {
      response.writeHead(403);
      response.end();
      return;
    }
    if ((await stat(path)).isDirectory()) path = join(path, "index.html");
    if (!(await stat(path)).isFile()) {
      response.writeHead(404);
      response.end();
      return;
    }
    response.writeHead(200, {
      "content-type": types[extname(path)] ?? "application/octet-stream",
    });
    response.end(await readFile(path));
  } catch {
    response.writeHead(404);
    response.end();
  }
});
server.listen(Number(process.env.PORT ?? 43173), "127.0.0.1");
for (const signal of ["SIGTERM", "SIGINT"])
  process.on(signal, () => {
    server.closeAllConnections();
    server.close(() => process.exit(0));
  });
