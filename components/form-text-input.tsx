"use client";

import { HTMLInputTypeAttribute, ReactNode, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import BarLabel from "./bar-label";
import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { Button } from "./ui/button";
import { useTranslations } from "next-intl";

export default function FormTextInput<TFieldValues extends FieldValues>({
  register,
  errors,
  label,
  id,
  type,
  field,
  validationOpts,
  placeholder,
  symbol,
}: {
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  label: string;
  id: string;
  type: HTMLInputTypeAttribute;
  field: Path<TFieldValues>;
  validationOpts?: { [key: string]: string | object };
  placeholder?: string;
  symbol?: ReactNode;
}) {
  const isPw = type === "password";
  const [showPw, setShowPw] = useState(false);

  const t = useTranslations("FormTextInput");

  return (
    <>
      <Label htmlFor={field}>
        <BarLabel className="text-sm text-sand">{label}</BarLabel>
      </Label>

      <div className="relative">
        {symbol && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-sand">
            {symbol}
          </span>
        )}
        <Input
          id={id}
          type={isPw ? (showPw ? "text" : "password") : type}
          className="w-full bg-hull border-[1.5px] border-border-custom rounded-lg py-3.5 pl-10 pr-4 text-[13px] font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber focus:shadow-[0_0_0_3px_rgba(217,140,69,0.12)] transition-all placeholder:text-panel2"
          placeholder={placeholder}
          {...register(field, validationOpts)}
        />
        {type === "password" && (
          <Button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3.5 top-1 text-[10px] text-sand tracking-wider cursor-pointer hover:text-cream transition-colors bg-transparent border-none"
          >
            {showPw ? t("labelHide") : t("labelShow")}
          </Button>
        )}
      </div>

      {errors[field] && (
        <p className="text-sm text-destructive">
          {errors[field].message as string | undefined}
        </p>
      )}
    </>
  );
}
