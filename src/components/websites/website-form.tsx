"use client";

import React, { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { websiteSchema } from "@/lib/validations/website";
import { addWebsiteAction, editWebsiteAction } from "@/actions/websites";
import { ScanFrequency } from "@prisma/client";
import { Loader2, Plus, Edit } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WebsiteFormProps {
  websiteId?: string;
  defaultValues?: {
    name: string;
    url: string;
    scanFrequency: ScanFrequency;
  };
  onSuccess?: () => void;
}

export function WebsiteForm({ websiteId, defaultValues, onSuccess }: WebsiteFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const isEditMode = !!websiteId;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(websiteSchema),
    defaultValues: defaultValues || {
      name: "",
      url: "",
      scanFrequency: ScanFrequency.MANUAL,
    },
  });

  const onSubmit = (data: {
    name: string;
    url: string;
    scanFrequency: ScanFrequency;
  }) => {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const res = isEditMode
        ? await editWebsiteAction(websiteId!, data)
        : await addWebsiteAction(data);

      if (res.success) {
        setSuccess(
          isEditMode
            ? "Website details updated successfully!"
            : "Website connected successfully!"
        );
        if (!isEditMode) reset();
        onSuccess?.();
      } else {
        setError(res.error || "Failed to process form.");
      }
    });
  };

  return (
    <Card className="border-border/30 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          {isEditMode ? <Edit className="w-4 h-4 text-primary" /> : <Plus className="w-4 h-4 text-primary" />}
          {isEditMode ? "Edit connected website" : "Connect new website"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="border-green-500/20 bg-green-500/10 text-green-500">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Friendly name</Label>
            <Input
              id="name"
              placeholder="My Personal Blog"
              disabled={isPending}
              aria-invalid={!!errors.name}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Website URL</Label>
            <Input
              id="url"
              placeholder="https://example.com"
              disabled={isPending}
              aria-invalid={!!errors.url}
              {...register("url")}
            />
            {errors.url && (
              <p className="text-xs text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Scan frequency</Label>
            <Controller
              name="scanFrequency"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isPending}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ScanFrequency.MANUAL}>Manual scans only</SelectItem>
                    <SelectItem value={ScanFrequency.DAILY}>Daily scheduled audits</SelectItem>
                    <SelectItem value={ScanFrequency.WEEKLY}>Weekly scheduled audits</SelectItem>
                    <SelectItem value={ScanFrequency.MONTHLY}>Monthly scheduled audits</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.scanFrequency && (
              <p className="text-xs text-destructive">{errors.scanFrequency.message}</p>
            )}
          </div>

          <Button type="submit" disabled={isPending} className="w-full" size="lg">
            {isPending ? (
              <>
                <Loader2 className="animate-spin" />
                Saving website...
              </>
            ) : isEditMode ? (
              "Save changes"
            ) : (
              "Connect website"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
