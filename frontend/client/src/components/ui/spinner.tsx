import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva(
  "inline-block animate-spin rounded-full border-4 border-t-transparent border-b-transparent",
  {
    variants: {
      size: {
        xs: "h-4 w-4 border-2",
        sm: "h-6 w-6 border-2.5",
        md: "h-8 w-8 border-3",
        lg: "h-12 w-12 border-4",
        xl: "h-16 w-16 border-5",
      },
      variant: {
        primary: "border-[hsl(var(--primary))] border-t-[hsl(var(--primary-foreground))] border-b-[hsl(var(--primary-foreground))]",
        accent: "border-[hsl(var(--accent))] border-t-[hsl(var(--accent-foreground))] border-b-[hsl(var(--accent-foreground))]",
        neutral: "border-[hsl(var(--muted-foreground))] border-t-[hsl(var(--muted-foreground))] border-b-[hsl(var(--muted-foreground))]",
        light: "border-white border-t-white border-b-white",
        dark: "border-[hsl(var(--foreground))] border-t-[hsl(var(--foreground))] border-b-[hsl(var(--foreground))]",
        rainbow: "border-t-red-500 border-r-yellow-500 border-b-green-500 border-l-blue-500",
      },
      glow: {
        true: "shadow-lg shadow-[hsl(var(--primary)/0.5)]",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "primary",
    },
  }
);


export interface SpinnerProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const Spinner = ({
  className,
  size,
  variant,
  label,
  glow,
  ...props
}: SpinnerProps) => (
  <span
    role="status"
    aria-live="polite"
    aria-label={label}
    className={cn("inline-flex items-center justify-center", className)}
    {...props}
  >
    <span
      className={cn(
        spinnerVariants({ size, variant, glow }),
        "bg-clip-border border-solid"
      )}
      aria-hidden="true"
    />
    <span className="sr-only">{label}</span>
  </span>
);

Spinner.displayName = "Spinner";

export { Spinner, spinnerVariants };
