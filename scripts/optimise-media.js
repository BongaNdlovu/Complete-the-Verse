#!/usr/bin/env node
/**
 * Media optimization runner for Complete the Verse.
 * Runs Python/Pillow asset optimization pipeline.
 */
const { spawn } = require("child_process");
const path = require("path");

const pyScript = path.join(__dirname, "optimise-media.py");
const py = process.platform === "win32" ? "python" : "python3";

console.log("Invoking media optimization pipeline via Python Pillow...");
const proc = spawn(py, [pyScript], { stdio: "inherit" });

proc.on("close", (code) => {
  if (code === 0) {
    console.log("Media optimization completed successfully.");
  } else {
    console.error(`Media optimization failed with code ${code}.`);
    process.exit(code || 1);
  }
});
