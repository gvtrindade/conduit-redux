import DeleteSquadForm from "@/components/delete-squad-form";
import LeaveSquadForm from "@/components/leave-squad-form";
import NewSquadForm from "@/components/new-squad-form";
import RenameSquadForm from "@/components/rename-squad-form";
import SelectActiveSquad from "@/components/select-active-squad";

export default function SquadManager({
  squads,
  squadCount,
  activeSquadId,
  userId,
}: {
  squads: { id: string; name: string | null; isCreator: boolean }[];
  squadCount: number;
  activeSquadId: string | null;
  userId: string;
}) {
  return (
      <div className="max-h-40 overflow-y-auto bg-panel border-2 border-border-custom rounded-2xl divide-y divide-border-custom overflow-hidden">
        {squads.map((squad) => {
          const isActive = squad.id === activeSquadId;
          return (
            <div
              key={squad.id}
              className={`flex justify-between items-center gap-2 text-xs px-3.5 py-3.5 ${
                isActive ? "bg-panel2" : ""
              }`}
            >
              <SelectActiveSquad
                userId={userId}
                squadId={squad.id}
                squadName={squad.name ?? ""}
                isActive={isActive}
              />
              {squad.isCreator && (
                <div className="flex items-center gap-2 shrink-0">
                  <RenameSquadForm
                    userId={userId}
                    squadId={squad.id}
                    squadName={squad.name ?? ""}
                  />
                  {squadCount > 1 && (
                    <DeleteSquadForm
                      userId={userId}
                      squadId={squad.id}
                      squadName={squad.name ?? ""}
                    />
                  )}
                </div>
              )}
              {!squad.isCreator && squadCount > 1 && (
                <LeaveSquadForm
                  userId={userId}
                  squadId={squad.id}
                  squadName={squad.name ?? ""}
                />
              )}
            </div>
          );
        })}
        <NewSquadForm userId={userId} />
      </div>
  );
}
