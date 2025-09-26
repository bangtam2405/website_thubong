import * as React from "react"
import { cn } from "@/lib/utils"

interface ValidatedTextareaProps extends React.ComponentProps<"textarea"> {
  errorMessage?: string;
}

const ValidatedTextarea = React.forwardRef<HTMLTextAreaElement, ValidatedTextareaProps>(
  ({ className, errorMessage, ...props }, ref) => {
    const defaultErrorMessage = errorMessage || "Vui lòng điền thông tin này";
    
    return (
      <textarea
        className={cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        )}
        ref={ref}
        title={defaultErrorMessage}
        onInvalid={(e) => {
          e.preventDefault();
          const target = e.target as HTMLTextAreaElement;
          target.setCustomValidity(defaultErrorMessage);
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.setCustomValidity("");
        }}
        {...props}
      />
    )
  }
)
ValidatedTextarea.displayName = "ValidatedTextarea"

export { ValidatedTextarea }
