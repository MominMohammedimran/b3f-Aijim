import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const filePath = join(__dirname, "..", "public", "version.json");
const version = Date.now();

writeFileSync(filePath, JSON.stringify({ version }, null, 2));

console.log("version.json updated:", version);
