"use client";

import { useState } from "react";
import { toast } from "sonner";

import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type NotesCardProps = {
  order_id: string;
  initial_notes: string;
  on_saved: () => void;
};

export function NotesCard({ order_id, initial_notes, on_saved }: NotesCardProps) {
  const [draft, set_draft] = useState(initial_notes);
  const update_notes = trpc.orders.adminUpdateNotes.useMutation({
    onSuccess: () => {
      on_saved();
      toast.success("Notes sauvegardées");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes internes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Textarea
          id="order-notes"
          rows={5}
          placeholder="Ajouter une note interne visible uniquement par l'équipe…"
          value={draft}
          onChange={(e) => set_draft(e.target.value)}
          className="resize-none text-sm"
        />
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            disabled={update_notes.isPending}
            onClick={() => update_notes.mutate({ order_id, notes: draft || null })}
          >
            Sauvegarder
          </Button>
          {draft && (
            <Button
              size="sm"
              variant="outline"
              disabled={update_notes.isPending}
              onClick={() => {
                set_draft("");
                update_notes.mutate({ order_id, notes: null });
              }}
            >
              Effacer
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
