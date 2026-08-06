"use client";

import { ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function BottomDrawer({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: ReactNode;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton={false}
        className="bg-panel border-t-2 border-border-custom rounded-t-2xl px-4 pt-4 pb-8 gap-0 data-[side=bottom]:data-starting-style:translate-y-full data-[side=bottom]:data-ending-style:translate-y-full"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border-custom" />
        {title && (
          <SheetHeader className="px-0 pb-4">
            <SheetTitle className="font-heading text-sm font-bold tracking-widest text-cream uppercase">
              {title}
            </SheetTitle>
          </SheetHeader>
        )}
        {children}
      </SheetContent>
    </Sheet>
  );
}
