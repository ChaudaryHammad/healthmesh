"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import {
  removeProfileImageAction,
  uploadProfileImageAction,
} from "@/actions/settings";
import { cn, formatDate } from "@/lib/utils";
import { getUserDisplayName } from "@/lib/user-display";
import { UserAvatar } from "@/components/user-avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SettingsHeaderProps {
  user: {
    name: string | null;
    email: string;
    emailVerified: Date | string | null;
    role: string;
    createdAt: Date | string;
    image: string | null;
    websiteCount: number;
  };
}

export function SettingsHeader({ user }: SettingsHeaderProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [image, setImage] = useState<string | null>(user.image);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploadPending, startUploadTransition] = useTransition();
  const [isRemovePending, startRemoveTransition] = useTransition();

  const isPending = isUploadPending || isRemovePending;
  const displayName = getUserDisplayName(user.name, user.email);

  useEffect(() => {
    setImage(user.image);
  }, [user.image]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMessage(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    startUploadTransition(async () => {
      const res = await uploadProfileImageAction(formData);
      if (res.success) {
        setImage(res.imageUrl ?? null);
        setMessage(res.message ?? "Profile photo updated.");
        router.refresh();
      } else {
        setError(res.error ?? "Failed to upload profile photo.");
      }
      if (fileInputRef.current) fileInputRef.current.value = "";
    });
  };

  const handleRemove = () => {
    if (!image || isPending) return;
    if (!confirm("Remove your profile photo?")) return;

    setMessage(null);
    setError(null);

    startRemoveTransition(async () => {
      const res = await removeProfileImageAction();
      if (res.success) {
        setImage(null);
        setMessage(res.message ?? "Profile photo removed.");
        router.refresh();
      } else {
        setError(res.error ?? "Failed to remove profile photo.");
      }
    });
  };

  return (
    <Card className="overflow-hidden rounded-2xl border-border/40">
      <div className="h-24 bg-gradient-to-r from-primary/15 via-primary/5 to-transparent" />
      <CardContent className="relative space-y-4 px-6 pb-6">
        <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="group relative size-24 shrink-0">
              <UserAvatar
                name={user.name}
                email={user.email}
                image={image}
                size="xl"
                className="ring-4 ring-background shadow-md"
              />

              <div
                className={cn(
                  "absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-full bg-background/80 opacity-0 backdrop-blur-[1px] transition-opacity",
                  "group-hover:opacity-100 group-focus-within:opacity-100",
                  isPending && "opacity-100"
                )}
              >
                {isPending ? (
                  <Loader2 className="size-6 animate-spin text-primary" />
                ) : (
                  <>
                    <Button
                      type="button"
                      size="icon-sm"
                      className="size-8 rounded-full shadow-md"
                      title={image ? "Change photo" : "Upload photo"}
                      onClick={() => fileInputRef.current?.click()}
                      aria-label={image ? "Change profile photo" : "Upload profile photo"}
                    >
                      <Pencil className="size-3.5" />
                    </Button>

                    {image && (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="destructive"
                        className="size-8 rounded-full shadow-md"
                        title="Remove photo"
                        onClick={handleRemove}
                        aria-label="Remove profile photo"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                disabled={isPending}
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-2 pb-1">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {displayName}
                </h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {user.emailVerified ? (
                  <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
                    <ShieldCheck className="size-3" />
                    Verified
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-amber-500/30 text-amber-600">
                    <ShieldOff className="size-3" />
                    Not verified
                  </Badge>
                )}
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {user.role}
                </Badge>
                <Badge variant="outline">Member since {formatDate(user.createdAt)}</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3 text-sm">
            <p className="text-muted-foreground">Connected websites</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {user.websiteCount}
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {message && (
          <Alert>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
