"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function FormField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  tooltip,
  className,
  children,
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <Label htmlFor={htmlFor} className={cn(error && "text-destructive")}>
            {label}
            {required && <span className="text-destructive ml-1">*</span>}
          </Label>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      )}
      {children}
      {description && !error && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  tooltip,
  className,
  inputClassName,
  ...inputProps
}) {
  return (
    <FormField
      label={label}
      htmlFor={htmlFor}
      description={description}
      error={error}
      required={required}
      tooltip={tooltip}
      className={className}
    >
      <Input
        id={htmlFor}
        className={cn(error && "border-destructive focus-visible:ring-destructive", inputClassName)}
        {...inputProps}
      />
    </FormField>
  );
}

export function TextAreaField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  tooltip,
  className,
  textareaClassName,
  rows = 3,
  ...textareaProps
}) {
  return (
    <FormField
      label={label}
      htmlFor={htmlFor}
      description={description}
      error={error}
      required={required}
      tooltip={tooltip}
      className={className}
    >
      <Textarea
        id={htmlFor}
        rows={rows}
        className={cn(error && "border-destructive focus-visible:ring-destructive", textareaClassName)}
        {...textareaProps}
      />
    </FormField>
  );
}

export function SelectField({
  label,
  htmlFor,
  description,
  error,
  required = false,
  tooltip,
  className,
  options = [],
  placeholder = "Select...",
  value,
  onValueChange,
  disabled = false,
}) {
  return (
    <FormField
      label={label}
      htmlFor={htmlFor}
      description={description}
      error={error}
      required={required}
      tooltip={tooltip}
      className={className}
    >
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          id={htmlFor}
          className={cn(error && "border-destructive focus:ring-destructive")}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormField>
  );
}

export default FormField;
