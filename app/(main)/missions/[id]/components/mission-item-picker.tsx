"use client";

import {
  addMissionItemEstimates,
  createMissionItem,
  deleteMissionItem,
} from "@/actions/missions";
import BottomDrawer from "@/components/bottom-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import {
  startTransition,
  useMemo,
  useState,
  useTransition,
} from "react";
import { toast } from "sonner";

type PendingItem = { id: string; title: string; created: boolean };

export default function MissionItemPicker({
  open,
  onOpenChange,
  userId,
  squadId,
  missionId,
  items,
  aisles,
  missionItemIds,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  squadId: string;
  missionId: string;
  items: { id: string; title: string }[];
  aisles: { id: string; name: string }[];
  missionItemIds: string[];
}) {
  const router = useRouter();
  const t = useTranslations("MissionItemPicker");
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<PendingItem[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newAisleId, setNewAisleId] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, startCreating] = useTransition();
  const [isAdding, startAdding] = useTransition();
  const [deleting, setDeleting] = useState<string | null>(null);

  const excluded = useMemo(() => {
    const ids = new Set<string>(missionItemIds);
    pending.forEach((item) => ids.add(item.id));
    return ids;
  }, [missionItemIds, pending]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter(
      (item) => !excluded.has(item.id) && (!needle || item.title.toLowerCase().includes(needle)),
    );
  }, [items, excluded, query]);

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setPending([]);
      setCreating(false);
      setNewTitle("");
      setNewAisleId(null);
      setCreateError(null);
    }
  };

  const openCreate = () => {
    setCreateError(null);
    setNewTitle(query.trim());
    setNewAisleId(null);
    setCreating(true);
  };

  const onCreate = () => {
    const title = newTitle.trim();
    if (!title || isCreating) return;

    startCreating(async () => {
      const res = await createMissionItem(
        userId,
        squadId,
        title,
        newAisleId === "__none__" ? null : newAisleId,
      );
      if (res?.error) {
        const errorKey =
          res.error === "invalidAisle" ? "errorInvalidAisle" : "errorFailed";
        setCreateError(t(errorKey));
      } else if (res?.id) {
        setPending((prev) => [...prev, { id: res.id, title: res.title, created: true }]);
        setQuery("");
        setCreating(false);
        setNewTitle("");
        setNewAisleId(null);
      }
    });
  };

  const removePending = (id: string) => {
    setPending((prev) => prev.filter((item) => item.id !== id));
  };

  const onDeleteCreated = (item: PendingItem) => {
    if (deleting) return;

    setDeleting(item.id);
    startTransition(async () => {
      const res = await deleteMissionItem(userId, squadId, item.id);
      setDeleting(null);
      if (res?.success) {
        setPending((prev) => prev.filter((pendingItem) => pendingItem.id !== item.id));
      } else {
        toast.error(t("errorDeleteFailed"));
      }
    });
  };

  const onAddAll = () => {
    if (!pending.length || isAdding) return;

    startAdding(async () => {
      const res = await addMissionItemEstimates(
        userId,
        squadId,
        missionId,
        pending.map((item) => item.id),
      );
      if (res?.success) {
        handleOpenChange(false);
        router.refresh();
      } else {
        toast.error(t("errorFailed"));
      }
    });
  };

  return (
    <BottomDrawer open={open} onOpenChange={handleOpenChange} title={t("title")}>
      <div className="space-y-4">
        <div className="bg-hull border-2 border-border-custom rounded-2xl overflow-hidden">
          <div className="relative p-2">
            <Search className="absolute left-5 top-1/2 size-4 -translate-y-1/2 text-sand" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if (creating) setCreating(false);
              }}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-panel border-2 border-border-custom rounded-lg py-2.5 pl-9 pr-4 text-xs font-medium text-cream tracking-wider outline-none caret-amber focus:border-amber transition-all placeholder:text-panel2"
            />
          </div>

          <div className="max-h-50 overflow-y-auto divide-y divide-border-custom">
            {filtered.length === 0 && query.trim() === "" && (
              <div className="px-3.5 py-2 text-xs text-sand">{t("noItems")}</div>
            )}
            {filtered.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPending((prev) => [
                    ...prev,
                    { id: item.id, title: item.title, created: false },
                  ]);
                }}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2 text-left cursor-pointer transition-colors hover:text-amber"
              >
                <span className="font-bold tracking-wide text-xs text-cream truncate">
                  {item.title}
                </span>
                <Plus size={13} className="shrink-0 text-sand" />
              </button>
            ))}
          </div>

          {query.trim() !== "" && !creating && (
            <div className="border-t border-border-custom">
              <button
                type="button"
                onClick={openCreate}
                className="w-full text-left px-3.5 py-2 cursor-pointer transition-colors hover:text-amber"
              >
                <span className="font-bold tracking-wide text-xs text-sand">
                  + {t("addNew", { query: query.trim() })}
                </span>
              </button>
            </div>
          )}
        </div>

        {creating && (
          <div className="bg-hull border-2 border-border-custom rounded-2xl p-3 space-y-3">
            <Input
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                setCreateError(null);
              }}
              placeholder={t("namePlaceholder")}
              className="w-full bg-panel border-2 border-border-custom rounded-lg py-3.5 px-4 text-xs font-bold text-cream tracking-wider outline-none caret-amber focus:border-amber transition-all placeholder:text-panel2"
            />

            <Select
              value={newAisleId ?? undefined}
              onValueChange={(value) => {
                setNewAisleId(value === "__none__" ? null : value);
                setCreateError(null);
              }}
            >
              <SelectTrigger className="w-full bg-panel border-2 border-border-custom rounded-lg py-3.5 px-4 text-xs font-bold text-cream tracking-wider outline-none focus:border-amber transition-all data-placeholder:text-panel2 h-auto!">
                <SelectValue placeholder={t("aislePlaceholder")} />
              </SelectTrigger>
              <SelectContent className="bg-panel border-2 border-border-custom text-cream">
                {aisles.length === 0 && (
                  <div className="px-3 py-2 text-xs text-sand">{t("noAisles")}</div>
                )}
                <SelectItem
                  value="__none__"
                  label={t("noAisle")}
                  className="text-xs font-bold tracking-wide"
                >
                  {t("noAisle")}
                </SelectItem>
                {aisles.map((aisle) => (
                  <SelectItem
                    key={aisle.id}
                    value={aisle.id}
                    label={aisle.name}
                    className="text-xs font-bold tracking-wide"
                  >
                    {aisle.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {createError && <p className="text-xs text-destructive">{createError}</p>}

            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => setCreating(false)}
                disabled={isCreating}
                className="flex-1 bg-panel2 border-2 border-border-custom rounded-xl py-3.5 text-xs tracking-widest text-sand cursor-pointer transition-colors hover:text-cream hover:border-cream"
              >
                {t("cancel")}
              </Button>
              <Button
                type="button"
                onClick={onCreate}
                disabled={!newTitle.trim() || isCreating}
                className="flex-1 bg-blue border-2 border-[#4A7A8D] rounded-xl py-3.5 text-xs tracking-widest text-hull cursor-pointer transition-colors hover:text-cream hover:border-cream"
              >
                {isCreating ? t("creating") : t("confirm")}
              </Button>
            </div>
          </div>
        )}

        {pending.length > 0 && (
          <div className="space-y-3">
            <div className="bg-hull border-2 border-border-custom rounded-2xl divide-y divide-border-custom">
              {pending.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-2 px-3.5 py-2.5"
                >
                  <span className="font-bold tracking-wide text-xs text-cream truncate">
                    {item.title}
                  </span>
                  {item.created ? (
                    <button
                      type="button"
                      aria-label={t("delete")}
                      onClick={() => onDeleteCreated(item)}
                      disabled={deleting === item.id}
                      className="text-red cursor-pointer transition-colors hover:text-cream disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      aria-label={t("remove")}
                      onClick={() => removePending(item.id)}
                      className="text-sand cursor-pointer transition-colors hover:text-cream"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={onAddAll}
              disabled={isAdding}
              className="w-full bg-amber border-2 border-[#C07830] rounded-xl py-4 text-xs font-bold tracking-widest text-hull cursor-pointer transition-colors hover:text-cream hover:border-cream"
            >
              {isAdding ? t("adding") : t("addToMission", { count: pending.length })}
            </Button>
          </div>
        )}
      </div>
    </BottomDrawer>
  );
}