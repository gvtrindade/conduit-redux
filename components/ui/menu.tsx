"use client"

import * as React from "react"
import { Menu as MenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function Menu({ ...props }: MenuPrimitive.Root.Props) {
  return <MenuPrimitive.Root data-slot="menu" {...props} />
}

function MenuTrigger({ ...props }: MenuPrimitive.Trigger.Props) {
  return <MenuPrimitive.Trigger data-slot="menu-trigger" {...props} />
}

function MenuPositioner({
  className,
  ...props
}: MenuPrimitive.Positioner.Props) {
  return (
    <MenuPrimitive.Portal>
      <MenuPrimitive.Positioner
        data-slot="menu-positioner"
        align="end"
        sideOffset={8}
        className={cn(
          "z-50 min-w-32 max-w-[min(calc(100vw-3rem),16rem)] data-[side=bottom]:anchor-inset-x-4",
          className
        )}
        {...props}
      />
    </MenuPrimitive.Portal>
  )
}

function MenuPopup({ className, ...props }: MenuPrimitive.Popup.Props) {
  return (
    <MenuPrimitive.Popup
      data-slot="menu-popup"
      className={cn(
        "origin-[var(--transform-origin)] rounded-xl border border-border-custom bg-panel p-1 text-sm text-cream shadow-md outline-none transition-[transform,scale,opacity] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function MenuItem({ className, ...props }: MenuPrimitive.Item.Props) {
  return (
    <MenuPrimitive.Item
      data-slot="menu-item"
      className={cn(
        "flex cursor-pointer select-none items-center gap-1.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-xs leading-none font-bold tracking-wide outline-none focus-visible:bg-panel2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

export { Menu, MenuTrigger, MenuPositioner, MenuPopup, MenuItem }