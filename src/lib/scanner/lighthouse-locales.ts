import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

/**
 * Trigger.dev bundles task code in a way that breaks Lighthouse's import.meta.url,
 * so locale files are resolved to `/app/locales/*.json` instead of node_modules.
 * Copy the real locale files there once before importing lighthouse.
 */
export function ensureLighthouseLocales(): void {
  const shimDir = path.join(process.cwd(), "locales");
  if (fs.existsSync(path.join(shimDir, "ar.json"))) return;

  let lighthouseRoot: string;
  try {
    lighthouseRoot = path.dirname(require.resolve("lighthouse/package.json"));
  } catch {
    return;
  }

  const srcDir = path.join(lighthouseRoot, "shared", "localization", "locales");
  if (!fs.existsSync(path.join(srcDir, "ar.json"))) return;

  fs.mkdirSync(shimDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    if (!file.endsWith(".json")) continue;
    fs.copyFileSync(path.join(srcDir, file), path.join(shimDir, file));
  }
}
