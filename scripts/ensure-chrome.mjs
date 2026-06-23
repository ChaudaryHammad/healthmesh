import { existsSync } from "fs";
import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

function hasSystemChrome() {
  const paths = [
    process.env.CHROME_PATH,
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.platform === "win32" && "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    process.platform === "win32" &&
      `${process.env.LOCALAPPDATA}\\Google\\Chrome\\Application\\chrome.exe`,
    process.platform === "darwin" &&
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    process.platform === "linux" && "/usr/bin/google-chrome",
  ].filter(Boolean);

  return paths.some((p) => existsSync(p));
}

function hasPuppeteerChrome() {
  try {
    const puppeteer = require("puppeteer");
    const path = puppeteer.executablePath();
    return path && existsSync(path);
  } catch {
    return false;
  }
}

if (process.env.SKIP_CHROME_DOWNLOAD === "1" || process.env.SKIP_CHROME_DOWNLOAD === "true") {
  console.log("[postinstall] Skipping Chrome download (SKIP_CHROME_DOWNLOAD is set).");
  process.exit(0);
}

if (hasPuppeteerChrome() || hasSystemChrome()) {
  console.log("[postinstall] Chrome available for Puppeteer audits.");
  process.exit(0);
}

console.log("[postinstall] Downloading Chrome for Puppeteer (one-time)…");
console.log("[postinstall] Tip: install Google Chrome or set SKIP_CHROME_DOWNLOAD=1 to skip.");
execSync("npx puppeteer browsers install chrome", { stdio: "inherit" });
