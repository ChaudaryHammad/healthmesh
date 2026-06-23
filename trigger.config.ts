import { config } from "dotenv";
import { defineConfig } from "@trigger.dev/sdk";

config({ path: ".env.local" });
config({ path: ".env" });

const project = process.env.TRIGGER_PROJECT_REF?.trim();

if (!project) {
  throw new Error(
    "TRIGGER_PROJECT_REF is missing. Add it to .env.local (Trigger.dev dashboard → your project → Settings)."
  );
}

/** Env vars required by Trigger.dev tasks (audits, DB, scanners). */
const TASK_ENV_KEYS = [
  "DATABASE_URL",
  "DIRECT_URL",
  "NODE_ENV",
  "NEXT_PUBLIC_APP_URL",
  "USE_TRIGGER_DEV",
  "TRIGGER_SECRET_KEY",
  "TRIGGER_PROJECT_REF",
] as const;

function taskEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  for (const key of TASK_ENV_KEYS) {
    const value = process.env[key];
    if (value) env[key] = value;
  }
  return env;
}

export default defineConfig({
  project,
  runtime: "node",
  logLevel: "log",
  maxDuration: 300,
  dirs: ["./src/trigger"],
  deploy: {
    env: taskEnv(),
  },
  build: {
    external: [
      "puppeteer",
      "puppeteer-core",
      "lighthouse",
      "chrome-launcher",
      "axe-core",
      "cheerio",
    ],
  },
});
