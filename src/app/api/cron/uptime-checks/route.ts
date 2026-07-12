import { NextRequest, NextResponse } from "next/server";
import { env } from "@/lib/env";
import {
  processDueUptimeChecks,
  pruneOldUptimeChecks,
} from "@/lib/uptime/run-check";
import {
  UPTIME_CHECK_RETENTION_DAYS,
  UPTIME_CRON_BATCH_SIZE,
} from "@/lib/uptime/constants";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * Uptime check safety net / manual runner.
 *
 * Primary schedule: Trigger.dev task `uptime-checks` (`* * * * *`).
 * This route remains for:
 * - Vercel daily cron (vercel.json) as a backup
 * - Local/manual: GET/POST with Authorization: Bearer $CRON_SECRET
 */
function authorize(request: NextRequest): boolean {
  const secret = env.CRON_SECRET?.trim();
  const header = request.headers.get("authorization");
  const vercelCron = request.headers.get("x-vercel-cron");

  if (!secret) {
    // Local/dev without secret: allow. Production should always set CRON_SECRET.
    return env.NODE_ENV !== "production";
  }

  if (header === `Bearer ${secret}`) return true;

  // Vercel Cron invocations include x-vercel-cron and Authorization when CRON_SECRET is set
  if (vercelCron === "1" && header === `Bearer ${secret}`) return true;

  return false;
}

async function handle(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { processed, errors } = await processDueUptimeChecks(UPTIME_CRON_BATCH_SIZE);
  const pruned = await pruneOldUptimeChecks(UPTIME_CHECK_RETENTION_DAYS);

  return NextResponse.json({
    ok: true,
    processed,
    errors,
    pruned,
    at: new Date().toISOString(),
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}
