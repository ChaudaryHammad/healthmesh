import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface BillingSettingsClientProps {
  websiteCount: number;
  websiteLimit: number;
  planName: string;
  planDescription: string;
}

export function BillingSettingsClient({
  websiteCount,
  websiteLimit,
  planName,
  planDescription,
}: BillingSettingsClientProps) {
  const usagePercent = Math.min(100, Math.round((websiteCount / websiteLimit) * 100));

  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="rounded-2xl border-border/30">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>Current plan</CardTitle>
              <CardDescription>{planDescription}</CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm uppercase tracking-wide">
              {planName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Online billing is not connected yet. Stripe checkout and subscription
              management will be added in a future update. You can review plans on
              the pricing page.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Connected websites</span>
              <span className="font-medium tabular-nums">
                {websiteCount} / {websiteLimit}
              </span>
            </div>
            <Progress value={usagePercent} className="h-2" />
          </div>

          <div className="flex flex-wrap gap-3">
            <ButtonLink href="/pricing">View plans</ButtonLink>
            <ButtonLink href="/contact" variant="outline">
              Contact sales
            </ButtonLink>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border/30">
        <CardHeader>
          <CardTitle>What&apos;s included</CardTitle>
          <CardDescription>Features on your current development plan</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Real Lighthouse, accessibility, SEO, and security audits</li>
            <li>Broken link checker with live progress</li>
            <li>Dashboard history and per-site audit reports</li>
            <li>Email notifications via your SMTP settings</li>
          </ul>
          <p className="mt-4 text-xs text-muted-foreground">
            Need Agency features or hourly scans?{" "}
            <Link href="/pricing" className="text-primary hover:underline">
              Compare plans
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
