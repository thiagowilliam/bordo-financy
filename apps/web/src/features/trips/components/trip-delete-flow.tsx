"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { toast } from "sonner";

import { UndoToast } from "@/components/molecules/undo-toast";
import { DeleteTripDialog } from "@/components/organisms/delete-trip-dialog";
import { useBaseCosts } from "@/features/base-costs";
import { useCategories } from "@/features/categories";
import { useExpenses } from "@/features/expenses";
import { usePhotos } from "@/features/photos";

import { scheduleTripDeletion, UNDO_WINDOW_MS } from "../utils/pending-trip-deletion";
import { buildExpensesCsv } from "../utils/trip-edit";

type DeleteTarget = { id: string; name: string; currency: string };

type DialogProps = {
  trip: DeleteTarget;
  onClose: () => void;
  onConfirm: () => void;
};

function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "viagem"
  }-gastos.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/** Loads what the trip holds, so the summary and the CSV reflect the real data. */
function TripDeleteDialog({ trip, onClose, onConfirm }: DialogProps) {
  const daily = useExpenses(trip.id);
  const base = useBaseCosts(trip.id);
  const photos = usePhotos(trip.id);
  const categories = useCategories();

  const canExport = Boolean(daily.data && base.data && categories.data);

  return (
    <DeleteTripDialog
      open
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      name={trip.name}
      dailyCount={daily.data?.length ?? 0}
      baseCount={base.data?.length ?? 0}
      photoCount={photos.data?.length ?? 0}
      onConfirm={onConfirm}
      onExportCsv={
        canExport
          ? () =>
              downloadCsv(
                trip.name,
                buildExpensesCsv([...daily.data!, ...base.data!], categories.data!, trip.currency),
              )
          : undefined
      }
    />
  );
}

type UseTripDeleteFlowOptions = {
  /** Runs when the user confirms, e.g. to leave the trip screen. */
  onConfirmed?: () => void;
};

/**
 * Confirmation, then deletion after an 8 second undo window. `dialog` must be rendered by the
 * caller; `requestDelete` opens it.
 */
export function useTripDeleteFlow({ onConfirmed }: UseTripDeleteFlowOptions = {}): {
  requestDelete: (trip: DeleteTarget) => void;
  dialog: ReactNode;
} {
  const queryClient = useQueryClient();
  const [target, setTarget] = useState<DeleteTarget | null>(null);

  function confirm(trip: DeleteTarget) {
    setTarget(null);
    const undo = scheduleTripDeletion({
      queryClient,
      tripId: trip.id,
      onDeleted: () => undefined,
      onFailed: () => toast.error("Não foi possível excluir a viagem. Ela voltou para a lista."),
    });
    toast.custom(
      (toastId) => (
        <UndoToast
          message="Viagem excluída"
          durationMs={UNDO_WINDOW_MS}
          onAction={() => {
            undo();
            toast.dismiss(toastId);
          }}
        />
      ),
      { duration: UNDO_WINDOW_MS },
    );
    onConfirmed?.();
  }

  return {
    requestDelete: setTarget,
    dialog: target ? (
      <TripDeleteDialog
        key={target.id}
        trip={target}
        onClose={() => setTarget(null)}
        onConfirm={() => confirm(target)}
      />
    ) : null,
  };
}
