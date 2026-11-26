const fs = require("fs");
const path = require("path");

const rootDir = path.join(process.cwd(), "node_modules", "react-native-css");
if (!fs.existsSync(rootDir)) {
  process.exit(0);
}

const getterSnippet =
  'get AssetRegistry() {\n    return require("react-native").AssetRegistry;\n  },\n  get AppRegistry() {';

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.name === "index.cjs" && fullPath.includes("components")) {
      const content = fs.readFileSync(fullPath, "utf8");
      if (!content.includes("get AssetRegistry()")) {
        const updated = content.replace("get AppRegistry() {", getterSnippet);
        if (updated !== content) {
          fs.writeFileSync(fullPath, updated, "utf8");
          console.log(`Patched ${fullPath}`);
        }
      }
    }
  }
}

walk(rootDir);
