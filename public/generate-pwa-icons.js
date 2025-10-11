// generate-pwa-icons.js
import sharp from "sharp";
import fs from "fs";
import path from "path";

const sourceFile = "./public/aijim-uploads/aijim-white.png"; // your logo
const outputDir = "./public/aijim-uploads/";

const sizes = [192, 512];
if (!fs.existsSync(sourceFile)) {
  console.error("❌ Source image not found:", sourceFile);
  process.exit(1);
}

(async () => {
  try {
    for (const size of sizes) {
      const outputFile = path.join(outputDir, `aijim-${size}.png`);
      await sharp(sourceFile)
        .resize(size, size)
        .toFile(outputFile);
      console.log(`✅ Generated ${outputFile}`);
    }
    console.log("🎉 All icons generated successfully!");
  } catch (err) {
    console.error("⚠️ Error generating icons:", err);
  }
})();
