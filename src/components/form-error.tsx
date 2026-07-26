"use client";

import { AlertCircle } from "lucide-react";

interface FormErrorProps {
  error?: string;
  fieldErrors?: Record<string, string>;
}

export function FormError({ error, fieldErrors }: FormErrorProps) {
  if (!error) return null;

  return (
    <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
      <AlertCircle className="w-4 h-4 shrink-0" />
      <span>{error}</span>
    </div>
  );
}

interface FieldErrorProps {
  fieldName: string;
  fieldErrors?: Record<string, string>;
}

export function FieldError({ fieldName, fieldErrors }: FieldErrorProps) {
  const error = fieldErrors?.[fieldName];
  if (!error) return null;

  return <p className="text-xs text-red-600 mt-1">{error}</p>;
}
