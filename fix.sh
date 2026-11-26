#!/usr/bin/env bash
set -euo pipefail

PROJECT_DIR="${1:-.}"
cd "$PROJECT_DIR"

echo "=== 1. Babel Config ==="
for cfg in babel.config.js babel.config.cjs babel.config.mjs babel.config.ts; do
  if [ -f "$cfg" ]; then
    echo "--- $cfg ---"
    cat "$cfg"
  fi
done

echo ""
echo "=== 2. All components/index* files in react-native-css ==="
find node_modules/react-native-css -path "*/components/index*" -type f

echo ""
echo "=== 3. Patch any components/index.cjs missing AssetRegistry ==="
node -e '
const fs = require("fs");
const path = require("path");

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.name === "index.cjs" && full.includes("components")) {
      let src = fs.readFileSync(full, "utf8");
      if (!src.includes("AssetRegistry")) {
        const target = "get AppRegistry() {";
        if (src.includes(target)) {
          src = src.replace(
            target,
            "get AssetRegistry() {\n    return require(\"react-native\").AssetRegistry;\n  },\n  " + target
          );
          fs.writeFileSync(full, src, "utf8");
          console.log("Patched:", full);
        } else {
          console.log("Could not find AppRegistry anchor in:", full);
        }
      } else {
        console.log("Already patched:", full);
      }
    }
  }
}

walk("node_modules/react-native-css");
'
