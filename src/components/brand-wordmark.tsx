import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandWordmarkProps = {
  /** Sidebar / compact chrome */
  compact?: boolean;
  className?: string;
};

/**
 * Text wordmark aligned with marketing side nav — no legacy bird logo.
 */
export function BrandWordmark({ compact, className }: BrandWordmarkProps) {
  return (
    <span
      className={cn(
        "font-heading block font-bold leading-tight tracking-[0.06em] text-foreground",
        compact ? "text-sm" : "text-lg",
        className
      )}
    >
      NEW LEGACY AI
    </span>
  );
}

type BrandWordmarkLinkProps = BrandWordmarkProps & {
  href: string;
  onClick?: () => void;
};

export function BrandWordmarkLink({
  href,
  compact,
  className,
  onClick,
}: BrandWordmarkLinkProps) {
  return (
    <Link
      href={href}
      className={cn("block shrink-0 no-underline", className)}
      onClick={onClick}
    >
      <BrandWordmark compact={compact} />
    </Link>
  );
}
