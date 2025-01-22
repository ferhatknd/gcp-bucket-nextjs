import * as React from "react";
import { cn } from "@/lib/utils";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
    hover?: boolean;
  }
>(({ className, gradient, hover, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-primary/10 bg-card text-card-foreground shadow-sm transition-all duration-300",
      gradient && [
        "bg-gradient-to-b from-card/50 to-card shadow-lg",
        "before:absolute before:inset-0 before:-z-10 before:rounded-xl",
        "before:bg-gradient-to-b before:from-primary/5 before:to-primary/10",
        "before:blur-xl before:transition-all before:duration-300",
      ],
      hover && "hover:shadow-lg hover:border-primary/20 hover:scale-[1.01]",
      className,
    )}
    {...props}
  />
));
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    gradient?: boolean;
  }
>(({ className, gradient, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 p-6",
      gradient && "bg-gradient-to-b from-primary/5 to-transparent",
      "border-b border-primary/10",
      className,
    )}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-tight tracking-tight",
      "bg-gradient-to-br from-foreground to-foreground/70",
      "bg-clip-text text-transparent",
      className,
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
