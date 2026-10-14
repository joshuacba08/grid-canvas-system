import { describe, expect, it, vi } from "vitest";
import { planNpmRelease } from "../scripts/prepare-npm-release.mjs";

const manifest = {
  name: "grid-canvas-system",
  private: false,
  version: "1.2.0-rc.1",
};

describe("npm release eligibility", () => {
  it.each(["refs/heads/main", "refs/tags/v1.2.0-rc.1"])(
    "publishes an unpublished candidate to next from %s",
    async (ref) => {
      const request = vi.fn().mockResolvedValue({ status: 404, ok: false });
      await expect(planNpmRelease({ manifest, ref, request })).resolves.toEqual({
        publish: true,
        version: "1.2.0-rc.1",
        tag: "next",
      });
      expect(request.mock.calls[0][0]).toBe(
        "https://registry.npmjs.org/grid-canvas-system/1.2.0-rc.1",
      );
    },
  );

  it("uses latest for stable versions", async () => {
    const request = vi.fn().mockResolvedValue({ status: 404, ok: false });
    await expect(
      planNpmRelease({
        manifest: { ...manifest, version: "1.2.0" },
        ref: "refs/heads/main",
        request,
      }),
    ).resolves.toMatchObject({ publish: true, tag: "latest" });
  });

  it("skips immutable versions that already exist", async () => {
    const request = vi.fn().mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => manifest,
    });
    await expect(
      planNpmRelease({ manifest, ref: "refs/heads/main", request }),
    ).resolves.toMatchObject({ publish: false });
  });

  it.each(["refs/heads/feature", "refs/tags/v1.1.0"])(
    "rejects a release from %s before accessing the registry",
    async (ref) => {
      const request = vi.fn();
      await expect(planNpmRelease({ manifest, ref, request })).rejects.toThrow(
        "matching package version tag",
      );
      expect(request).not.toHaveBeenCalled();
    },
  );

  it.each(["01.2.0", "1.2", "1.2.0-01", "1.2.0+build", "1.2.0-", "1.2.0\n"])(
    "rejects invalid or noncanonical version %j",
    async (version) => {
      await expect(
        planNpmRelease({
          manifest: { ...manifest, version },
          ref: "refs/heads/main",
          request: vi.fn(),
        }),
      ).rejects.toThrow("canonical SemVer");
    },
  );

  it("rejects other packages and private manifests", async () => {
    for (const change of [{ name: "other" }, { private: true }]) {
      await expect(
        planNpmRelease({
          manifest: { ...manifest, ...change },
          ref: "refs/heads/main",
          request: vi.fn(),
        }),
      ).rejects.toThrow("Only the public");
    }
  });

  it("fails closed on registry outages and malformed successful responses", async () => {
    for (const response of [
      { status: 503, ok: false },
      { status: 200, ok: true, json: async () => ({ ...manifest, version: "1.1.0" }) },
    ]) {
      await expect(
        planNpmRelease({
          manifest,
          ref: "refs/heads/main",
          request: vi.fn().mockResolvedValue(response),
        }),
      ).rejects.toThrow();
    }
  });
});
