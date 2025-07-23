import { describe, test, expect } from "bun:test";
import { readFileSync } from "fs";
import { join } from "path";
import sharp from "sharp";

// Copy of the resizeAndChangeDPI function for testing
async function resizeAndChangeDPI(fileBuffer: Buffer): Promise<Buffer | undefined> {
  try {
    // Get original image metadata
    const metadata = await sharp(fileBuffer).metadata();

    // Safely handle potentially undefined metadata properties
    const currentDPI = metadata.density ?? 96; // Default to 96 DPI if undefined
    const imageWidth = metadata.width ?? 0;
    const imageHeight = metadata.height ?? 0;

    // Log when using default DPI
    if (metadata.density === undefined) {
      console.log(`Image DPI metadata missing, assuming default ${currentDPI} DPI for processing`);
    }

    // Check if image already has 300 DPI or higher
    if (currentDPI >= 300) {
      console.log(`Image already at ${currentDPI} DPI (>= 300 DPI requirement), no processing needed`);
      return fileBuffer;
    }

    // Validate that we have valid dimensions
    if (imageWidth === 0 || imageHeight === 0) {
      console.error("Invalid image dimensions detected");
      return undefined;
    }

    // Calculate scaling factor based on current DPI
    const scale = 300 / currentDPI;
    const newWidth = Math.round(imageWidth * scale);
    const newHeight = Math.round(imageHeight * scale);

    console.log(
      `Image resized from ${imageWidth}x${imageHeight} (${currentDPI} DPI) to ${newWidth}x${newHeight} (300 DPI)`
    );

    return await sharp(fileBuffer)
      .resize(newWidth, newHeight) // Resize to new dimensions
      .withMetadata({ density: 300 }) // Set DPI to 300
      .toBuffer();
  } catch (err) {
    console.error("Error processing image:", err);
    return undefined;
  }
}

describe("resizeAndChangeDPI with real test images", () => {
  test("should process image-too-small.png correctly", async () => {
    const testImagesDir = join(process.cwd(), "src/assets/test-images");
    const smallImagePath = join(testImagesDir, "image-too-small.png");
    const smallImageBuffer = readFileSync(smallImagePath);

    // Get original metadata
    const originalMetadata = await sharp(smallImageBuffer).metadata();
    console.log("Original image-too-small.png metadata:", {
      width: originalMetadata.width,
      height: originalMetadata.height,
      density: originalMetadata.density
    });

    const result = await resizeAndChangeDPI(smallImageBuffer);
    expect(result).toBeDefined();

    if (result) {
      const resultMetadata = await sharp(result).metadata();
      expect(resultMetadata.density).toBe(300);

      // If original had DPI < 300, should be processed
      if ((originalMetadata.density ?? 96) < 300) {
        expect(result).not.toBe(smallImageBuffer);
        console.log("Image was processed as expected");
      } else {
        expect(result).toBe(smallImageBuffer);
        console.log("Image was not processed as it already met DPI requirements");
      }
    }
  });

  test("should process verified-skateboard.jpeg correctly", async () => {
    const testImagesDir = join(process.cwd(), "src/assets/test-images");
    const skateboardImagePath = join(testImagesDir, "verified-skateboard.jpeg");
    const skateboardImageBuffer = readFileSync(skateboardImagePath);

    // Get original metadata
    const originalMetadata = await sharp(skateboardImageBuffer).metadata();
    console.log("Original verified-skateboard.jpeg metadata:", {
      width: originalMetadata.width,
      height: originalMetadata.height,
      density: originalMetadata.density
    });

    const result = await resizeAndChangeDPI(skateboardImageBuffer);
    expect(result).toBeDefined();

    if (result) {
      const resultMetadata = await sharp(result).metadata();
      expect(resultMetadata.density).toBe(300);

      // If original had DPI >= 300, should return original buffer
      if ((originalMetadata.density ?? 96) >= 300) {
        expect(result).toBe(skateboardImageBuffer);
        console.log("Image was not processed as it already met DPI requirements");
      } else {
        expect(result).not.toBe(skateboardImageBuffer);
        console.log("Image was processed as expected");
      }
    }
  });
});
