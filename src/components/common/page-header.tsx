import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  tabs?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

/**
 * Standard page header contract (§4.4):
 * optional eyebrow, title, 1-line subtitle, trailing primary action,
 * optional tabs below. Left-aligned everywhere by default.
 */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
  action,
  tabs,
  align = "left",
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      <div
        className={cn(
          "flex flex-wrap items-start gap-3",
          align === "center" ? "justify-center" : "justify-between",
        )}
      >
        <div className={cn("min-w-0 flex-1", align === "center" && "flex flex-col items-center")}>
          {eyebrow ? <p className="page-header-eyebrow">{eyebrow}</p> : null}
          <h1 className="page-header-title mt-1">{title}</h1>
          {subtitle ? <p className="page-header-subtitle mt-1">{subtitle}</p> : null}
        </div>
        {action ? <div className="flex shrink-0 items-center gap-2">{action}</div> : null}
      </div>
      {tabs ? <div className="w-full">{tabs}</div> : null}
    </div>
  );
}
