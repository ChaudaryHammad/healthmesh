import { copyLighthouseLocalesTo } from "../../lib/scanner/lighthouse-locales";
import { join } from "node:path";

type BuildContext = {
  workingDir: string;
  logger: {
    debug: (message: string, ...args: unknown[]) => void;
    warn: (message: string, ...args: unknown[]) => void;
  };
};

type BuildManifest = {
  outputPath: string;
};

/** Copy Lighthouse locale JSON into the deploy bundle at `/app/locales`. */
export function lighthouseLocalesExtension() {
  return {
    name: "lighthouse-locales",
    async onBuildComplete(context: BuildContext, manifest: BuildManifest) {
      const targets = [
        join(context.workingDir, "locales"),
        join(manifest.outputPath, "locales"),
      ];

      try {
        for (const target of targets) {
          const copied = copyLighthouseLocalesTo(target);
          context.logger.debug(
            `[lighthouse-locales] Copied ${copied} locale files to ${target}`
          );
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        context.logger.warn(`[lighthouse-locales] ${message}`);
      }
    },
  };
}
