import * as React from "react"
import { Input } from "./input"
import { cn } from "@/lib/utils"

interface ValidatedInputProps extends React.ComponentProps<"input"> {
  errorMessage?: string;
}

const ValidatedInput = React.forwardRef<HTMLInputElement, ValidatedInputProps>(
  ({ className, errorMessage, ...props }, ref) => {
    const defaultErrorMessage = errorMessage || "Vui lòng điền thông tin này";
    
    return (
      <Input
        className={cn(className)}
        ref={ref}
        title={defaultErrorMessage}
        onInvalid={(e) => {
          e.preventDefault();
          const target = e.target as HTMLInputElement;
          target.setCustomValidity(defaultErrorMessage);
        }}
        onInput={(e) => {
          const target = e.target as HTMLInputElement;
          target.setCustomValidity("");
        }}
        {...props}
      />
    )
  }
)
ValidatedInput.displayName = "ValidatedInput"

export { ValidatedInput }
