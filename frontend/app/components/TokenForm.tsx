"use client";

import type * as React from "react";
import { Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface FormField {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  tooltip?: string;
}

interface TokenFormProps {
  fields: FormField[];
  onSubmit: (data: Record<string, string>) => void;
  isLoading?: boolean;
  className?: string;
  initialValues?: Record<string, string>;
  hideButton?: boolean;
}

export function TokenForm({
  fields,
  onSubmit,
  isLoading,
  className,
  initialValues,
  hideButton = false,
}: TokenFormProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data = Object.fromEntries(formData.entries()) as Record<
      string,
      string
    >;
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className={cn("space-y-3", className)}>
      <div className="space-y-2">
        {fields.map((field) => (
          <div
            key={field.name}
            className="grid grid-cols-[200px_1fr] items-center gap-4"
          >
            <div className="flex items-center gap-2">
              <Label htmlFor={field.name} className="text-sm font-medium">
                {field.label}
              </Label>
              {field.tooltip && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger type="button">
                      <Info className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-[15rem] text-sm">{field.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Input
              type={field.type}
              name={field.name}
              id={field.name}
              placeholder={field.placeholder}
              defaultValue={initialValues?.[field.name]}
              className="w-full bg-background/60 backdrop-blur-xl border-primary/20"
              required
            />
          </div>
        ))}
      </div>
      {!hideButton && (
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-400/90 hover:to-blue-500/90 text-primary-foreground"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Token...
            </>
          ) : (
            "Create Token"
          )}
        </Button>
      )}
    </form>
  );
}
