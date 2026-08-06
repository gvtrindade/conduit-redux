"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, MoreHorizontal } from "lucide-react";
import { Menu, MenuItem, MenuPopup, MenuPositioner, MenuTrigger } from "@/components/ui/menu";

export default function PageHeader({
  title,
  onBack,
  menu,
}: {
  title: string;
  onBack?: () => void;
  menu?: { label: string; onSelect: () => void }[];
}) {
  const router = useRouter();

  const goBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <div className="flex items-center justify-between gap-2 py-3.5">
      <button
        type="button"
        aria-label="Go back"
        onClick={goBack}
        className="flex items-center justify-center size-8 cursor-pointer transition-colors text-sand hover:text-amber"
      >
        <ArrowLeft size={16} />
      </button>

      <h1 className="font-heading text-sm font-bold tracking-widest text-cream uppercase truncate">
        {title}
      </h1>

      {menu?.length ? (
        <Menu>
          <MenuTrigger
            aria-label="Actions"
            className="flex items-center justify-center size-8 cursor-pointer rounded-md text-sand transition-colors hover:text-amber focus-visible:text-amber outline-none aria-expanded:text-amber"
          >
            <MoreHorizontal size={16} />
          </MenuTrigger>
          <MenuPositioner>
            <MenuPopup>
              {menu.map(({ label, onSelect }) => (
                <MenuItem key={label} onClick={onSelect}>
                  {label}
                </MenuItem>
              ))}
            </MenuPopup>
          </MenuPositioner>
        </Menu>
      ) : (
        <div className="size-8" />
      )}
    </div>
  );
}