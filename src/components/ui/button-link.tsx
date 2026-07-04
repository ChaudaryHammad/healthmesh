import { ReliableLink } from "@/components/ui/reliable-link";
import type { ComponentProps } from "react";
import { Button, type buttonVariants } from "@/components/ui/button";
import type { VariantProps } from "class-variance-authority";

type ButtonLinkProps = VariantProps<typeof buttonVariants> &
  Omit<ComponentProps<typeof Button>, "render" | "nativeButton"> & {
    href: string;
  };

export function ButtonLink({ href, children, ...props }: ButtonLinkProps) {
  return (
    <Button render={<ReliableLink href={href} />} nativeButton={false} {...props}>
      {children}
    </Button>
  );
}
