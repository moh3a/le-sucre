"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { useTranslations } from "next-intl";
import { StickyNote, Plus, Pin, PinOff } from "lucide-react";

const NOTE_TYPE_BADGES: Record<string, "destructive" | "secondary" | "default" | "outline"> = {
  private: "outline",
  operator: "secondary",
  follow_up: "default",
};

type CustomerNotesTabProps = { user_id: string };

export function CustomerNotesTab({ user_id }: CustomerNotesTabProps) {
  const t = useTranslations("orders");
  const NOTE_TYPE_LABELS: Record<string, string> = {
    private: t("private_note"),
    operator: t("operator_note"),
    follow_up: t("follow_up_note"),
  };
  const [filter, set_filter] = useState<string | undefined>(undefined);
  const { data: notes, isLoading, refetch } = trpc.operations.customerGetNotes.useQuery({ user_id, note_type: filter });
  const [show_form, set_show_form] = useState(false);
  const [note_type, set_note_type] = useState<string>("private");
  const [content, set_content] = useState("");

  const add_note = trpc.operations.customerAddNote.useMutation({
    onSuccess: () => {
      refetch();
      set_show_form(false);
      set_content("");
      toast.success(t("note_added"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  const toggle_pin = trpc.operations.customerTogglePinNote.useMutation({
    onSuccess: () => refetch(),
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={<Skeleton className="h-48 w-full" />}>
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-medium">{t("internal_notes")}</h3>
          <select
            className="border-input bg-background ring-offset-background h-8 rounded-md border px-2 text-xs"
            value={filter ?? ""}
            onChange={(e) => set_filter(e.target.value || undefined)}
          >
            <option value="">{t("all")}</option>
            <option value="private">{t("private")}</option>
            <option value="operator">{t("operator")}</option>
            <option value="follow_up">{t("follow_up")}</option>
          </select>
        </div>
        <Button size="sm" onClick={() => set_show_form(!show_form)}>
          <Plus className="mr-1 h-3 w-3" />
          {t("add_note")}
        </Button>
      </div>

      {show_form && (
        <Card className="border-blue-200">
          <CardContent className="space-y-3 pt-4">
            <div className="space-y-1">
              <label className="text-xs font-medium">{t("type")}</label>
              <select
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={note_type}
                onChange={(e) => set_note_type(e.target.value)}
              >
                <option value="private">{t("private_note")}</option>
                <option value="operator">{t("operator_note")}</option>
                <option value="follow_up">{t("follow_up_note")}</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">{t("content")}</label>
              <textarea
                className="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 text-sm"
                rows={4}
                value={content}
                onChange={(e) => set_content(e.target.value)}
                placeholder={t("note_placeholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_show_form(false)}>
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  add_note.mutate({
                    user_id,
                    note_type: note_type as "private" | "operator" | "follow_up",
                    content,
                  })
                }
                disabled={!content.trim() || add_note.isPending}
              >
                {t("save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(notes?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">{t("no_notes")}</p>
      ) : (
        <div className="space-y-2">
          {notes?.map((n) => (
            <div
              key={n.id}
              className={`rounded-md border p-3 text-sm ${
                n.is_pinned ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950" : ""
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <Badge variant={NOTE_TYPE_BADGES[n.note_type] ?? "outline"}>
                    {NOTE_TYPE_LABELS[n.note_type] ?? n.note_type}
                  </Badge>
                  {n.is_pinned && <Pin className="h-3 w-3 text-amber-500" />}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={() => toggle_pin.mutate({ note_id: n.id, is_pinned: !n.is_pinned })}
                >
                  {n.is_pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                </Button>
              </div>
              <p className="mt-2 whitespace-pre-wrap">{n.content}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(n.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
    </QueryGuard>
  );
}
