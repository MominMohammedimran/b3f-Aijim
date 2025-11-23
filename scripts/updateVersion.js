const fs = require("fs");
const version = Date.now(); // or use git commit hash
fs.writeFileSync("public/version.json", JSON.stringify({ version }));

