import { describe, expect, it, vi } from "vitest";
import { waitForNpmRelease } from "../scripts/wait-for-npm-release.mjs";

const name = "grid-canvas-system";
const version = "1.2.0";
const tag = "latest";
const integrity = "sha512-expected";
const metadata = { name, version, dist: { integrity } };
const visible = () => Response.json(metadata);
const tagged = () => Response.json({ "dist-tags": { [tag]: version } });

describe("npm publication propagation", () => {
  it("waits for version visibility after npm accepts publication", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(visible())
      .mockResolvedValueOnce(tagged());
    const pause = vi.fn();
    await expect(
      waitForNpmRelease({ name, version, tag, integrity, request, pause }),
    ).resolves.toEqual(metadata);
    expect(pause).toHaveBeenCalledOnce();
    expect(request.mock.calls.map(([url]) => url)).toEqual([
      "https://registry.npmjs.org/grid-canvas-system/1.2.0",
      "https://registry.npmjs.org/grid-canvas-system/1.2.0",
      "https://registry.npmjs.org/grid-canvas-system",
    ]);
  });

  it("also waits for the selected dist-tag to propagate", async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(visible())
      .mockResolvedValueOnce(Response.json({ "dist-tags": { latest: "1.1.0" } }))
      .mockResolvedValueOnce(visible())
      .mockResolvedValueOnce(tagged());
    const pause = vi.fn();
    await expect(
      waitForNpmRelease({ name, version, tag, integrity, request, pause }),
    ).resolves.toEqual(metadata);
    expect(pause).toHaveBeenCalledOnce();
  });

  it("rejects a different published tarball immediately", async () => {
    const request = vi
      .fn()
      .mockResolvedValue(
        Response.json({ ...metadata, dist: { integrity: "different" } }),
      );
    const pause = vi.fn();
    await expect(
      waitForNpmRelease({ name, version, tag, integrity, request, pause }),
    ).rejects.toThrow("integrity differs");
    expect(pause).not.toHaveBeenCalled();
  });

  it("rejects unexpected metadata and access errors", async () => {
    for (const response of [
      Response.json({ ...metadata, version: "1.1.0" }),
      new Response(null, { status: 403 }),
    ]) {
      const pause = vi.fn();
      await expect(
        waitForNpmRelease({
          name,
          version,
          tag,
          integrity,
          request: vi.fn().mockResolvedValue(response),
          pause,
        }),
      ).rejects.toThrow();
      expect(pause).not.toHaveBeenCalled();
    }
  });

  it("bounds waiting without retrying the publish operation", async () => {
    const request = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    const pause = vi.fn();
    await expect(
      waitForNpmRelease({ name, version, tag, integrity, request, pause, attempts: 2 }),
    ).rejects.toThrow("inspect the registry before publishing again");
    expect(pause).toHaveBeenCalledOnce();
    expect(request).toHaveBeenCalledTimes(2);
  });
});
