// The owner removed the 3D bowl. This check keeps it from coming back by accident
// (for example by copying files from an older ZIP).
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const project = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(project, file), "utf8");

test("the 3D bowl is fully removed: no Three.js, no bowl code, no bowl buttons", () => {
  for (const file of ["hero.js", "vendor/three.min.js", "images/plates/hero.svg"])
    assert.ok(!fs.existsSync(path.join(project, file)), `${file} should be gone`);
  const page = read("index.html") + read("app.js");
  for (const piece of ["3D bowl", "bowl-dialog", "hero-scene", "hero-animation-toggle", "settings-bowl", "three.min.js"])
    assert.ok(!page.includes(piece), `"${piece}" should be gone from the page`);
});
