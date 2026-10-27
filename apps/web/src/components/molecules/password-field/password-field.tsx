"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";

import { TextField, type TextFieldProps } from "@/components/atoms/text-field";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "icon" | "trailing">;

/** Password input with a lock icon and a show/hide toggle. Use inside `FormField`. */
export function PasswordField({ ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      icon={<Lock />}
      trailing={
        <button
          type="button"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
          className="flex size-9 items-center justify-center rounded-md text-subtle-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <Icon aria-hidden className="size-4.5" />
        </button>
      }
    />
  );
}
