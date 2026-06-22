import React from "react";
import Link from "next/link";
import { unsubscribeFromNewsletter } from "@/actions/newsletter";
import { CheckCircle, XCircle } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export const metadata = {
  title: "Unsubscribe — LoopNode",
};

export default async function NewsletterUnsubscribePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <UnsubscribeResult
        success={false}
        message="Missing unsubscribe token. Use the link from your newsletter email."
      />
    );
  }

  const result = await unsubscribeFromNewsletter(token);

  return (
    <UnsubscribeResult
      success={result.success}
      message={result.success ? result.message! : result.error ?? "Unsubscribe failed."}
    />
  );
}

function UnsubscribeResult({ success, message }: { success: boolean; message: string }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div
          className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center border ${
            success
              ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400"
              : "bg-rose-500/10 border-rose-500/25 text-rose-400"
          }`}
        >
          {success ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            {success ? "Unsubscribed" : "Unable to unsubscribe"}
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
