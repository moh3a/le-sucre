"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import type { BlacklistedIp } from "@/features/ip_blacklist/schema";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface BlacklistTableProps {
  entries: BlacklistedIp[];
  on_toggle: (id: string) => Promise<void>;
  on_remove: (id: string) => Promise<void>;
}

export function BlacklistTable({ entries, on_toggle, on_remove }: BlacklistTableProps) {
  const t = useTranslations("blacklist");
  const [removing_id, set_removing_id] = useState<string | null>(null);

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t("ip_address")}</TableHead>
            <TableHead>{t("reason")}</TableHead>
            <TableHead>{t("status")}</TableHead>
            <TableHead>{t("expires_at")}</TableHead>
            <TableHead>{t("created_at")}</TableHead>
            <TableHead className="text-right">{t("actions")}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {entries.map((entry) => (
            <TableRow key={entry.id}>
              <TableCell className="font-mono text-sm">{entry.ip_address}</TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate text-sm">
                {entry.reason_fr ?? entry.reason ?? "—"}
              </TableCell>
              <TableCell>
                <Badge variant={entry.is_active ? "default" : "secondary"}>
                  {entry.is_active ? t("active") : t("inactive")}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {entry.expires_at
                  ? format(new Date(entry.expires_at), "dd/MM/yyyy HH:mm", { locale: fr })
                  : "—"}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(entry.created_at), "dd/MM/yyyy", { locale: fr })}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => on_toggle(entry.id)}
                    title={entry.is_active ? t("deactivate") : t("activate")}
                  >
                    {entry.is_active ? (
                      <ToggleRight className="h-4 w-4" />
                    ) : (
                      <ToggleLeft className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => set_removing_id(entry.id)}
                    title={t("delete_title")}
                  >
                    <Trash2 className="text-destructive h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AlertDialog open={!!removing_id} onOpenChange={() => set_removing_id(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("confirm_delete_title")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("confirm_delete_description")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (removing_id) {
                  await on_remove(removing_id);
                  set_removing_id(null);
                }
              }}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
