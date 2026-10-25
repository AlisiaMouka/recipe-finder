// Runs every test file. Use: npm test
// Exits with an error if any check fails, so GitHub shows a red ✗.

const files = ["pantry.test.js", "cook.test.js", "page.test.js"];

(async () => {
  let failures = 0;
  for (const file of files) {
    failures += await require(`./${file}`)();
  }
  console.log(failures === 0 ? "\nAll checks passed." : `\n${failures} check(s) failed.`);
  process.exit(failures === 0 ? 0 : 1);
})();
