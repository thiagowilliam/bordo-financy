import { describe, expect, it } from "vitest";

import { filterPhotoFiles, MAX_PHOTO_BYTES } from "./photos";

const file = (name: string, type: string, size = 1000) => {
  const result = new File(["x"], name, { type });
  Object.defineProperty(result, "size", { value: size });
  return result;
};

describe("filterPhotoFiles", () => {
  it("accepts JPG and PNG", () => {
    const result = filterPhotoFiles([file("a.jpg", "image/jpeg"), file("b.png", "image/png")], 0);
    expect(result.accepted).toHaveLength(2);
    expect(result.hasInvalid).toBe(false);
  });

  it("ignores other types and files over 10 MB", () => {
    const result = filterPhotoFiles(
      [
        file("a.gif", "image/gif"),
        file("big.jpg", "image/jpeg", MAX_PHOTO_BYTES + 1),
        file("ok.jpg", "image/jpeg", MAX_PHOTO_BYTES),
      ],
      0,
    );
    expect(result.accepted.map((item) => item.name)).toEqual(["ok.jpg"]);
    expect(result.hasInvalid).toBe(true);
  });

  it("stops at 10 photos", () => {
    const files = Array.from({ length: 4 }, (_, i) => file(`${i}.jpg`, "image/jpeg"));
    const result = filterPhotoFiles(files, 8);
    expect(result.accepted).toHaveLength(2);
    expect(result.hasOverflow).toBe(true);
    expect(filterPhotoFiles(files, 10).accepted).toHaveLength(0);
  });
});
