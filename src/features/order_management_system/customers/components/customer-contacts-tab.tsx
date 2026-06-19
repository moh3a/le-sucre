"use client";

import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { Phone, Mail, MessageCircle, Plus } from "lucide-react";

const CONTACT_TYPE_ICONS: Record<string, React.ElementType> = {
  phone_call: Phone,
  whatsapp: MessageCircle,
  sms: MessageCircle,
  email: Mail,
};

const CONTACT_TYPE_LABELS: Record<string, string> = {
  phone_call: "Appel téléphonique",
  whatsapp: "WhatsApp",
  sms: "SMS",
  email: "Email",
};

const DIRECTION_LABELS: Record<string, string> = {
  inbound: "Entrant",
  outbound: "Sortant",
};

type CustomerContactsTabProps = { user_id: string };

export function CustomerContactsTab({ user_id }: CustomerContactsTabProps) {
  const [page, setPage] = useState(1);
  const { data, isLoading, refetch } = trpc.operations.customerGetContacts.useQuery({ user_id, page, limit: 20 });
  const [show_form, set_show_form] = useState(false);
  const [contact_type, set_contact_type] = useState<string>("phone_call");
  const [direction, set_direction] = useState<string>("inbound");
  const [subject, set_subject] = useState("");
  const [summary, set_summary] = useState("");

  const log_contact = trpc.operations.customerLogContact.useMutation({
    onSuccess: () => {
      refetch();
      set_show_form(false);
      set_subject("");
      set_summary("");
      toast.success("Contact enregistré");
    },
    onError: (err) => toast.error(`Erreur: ${err.message}`),
  });

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Historique des contacts</h3>
        <Button size="sm" onClick={() => set_show_form(!show_form)}>
          <Plus className="mr-1 h-3 w-3" />
          Nouveau contact
        </Button>
      </div>

      {show_form && (
        <Card className="border-blue-200">
          <CardContent className="space-y-3 pt-4">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium">Type</label>
                <select
                  className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                  value={contact_type}
                  onChange={(e) => set_contact_type(e.target.value)}
                >
                  <option value="phone_call">Appel téléphonique</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">Sens</label>
                <select
                  className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                  value={direction}
                  onChange={(e) => set_direction(e.target.value)}
                >
                  <option value="inbound">Entrant</option>
                  <option value="outbound">Sortant</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Sujet</label>
              <input
                className="border-input bg-background ring-offset-background flex h-9 w-full rounded-md border px-3 py-1 text-sm"
                value={subject}
                onChange={(e) => set_subject(e.target.value)}
                placeholder="Objet du contact..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium">Résumé</label>
              <textarea
                className="border-input bg-background ring-offset-background flex w-full rounded-md border px-3 py-2 text-sm"
                rows={3}
                value={summary}
                onChange={(e) => set_summary(e.target.value)}
                placeholder="Détails du contact..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => set_show_form(false)}>
                Annuler
              </Button>
              <Button
                size="sm"
                onClick={() =>
                  log_contact.mutate({
                    user_id,
                    contact_type: contact_type as "phone_call" | "whatsapp" | "sms" | "email",
                    direction: direction as "inbound" | "outbound",
                    subject: subject || undefined,
                    summary: summary || undefined,
                  })
                }
                disabled={log_contact.isPending}
              >
                Enregistrer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {(data?.items?.length ?? 0) === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">Aucun contact enregistré</p>
      ) : (
        <div className="space-y-2">
          {data?.items?.map((c) => {
            const Icon = CONTACT_TYPE_ICONS[c.contact_type] ?? Phone;
            return (
              <div key={c.id} className="flex items-start gap-3 rounded-md border p-3 text-sm">
                <Icon className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{CONTACT_TYPE_LABELS[c.contact_type] ?? c.contact_type}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {DIRECTION_LABELS[c.direction] ?? c.direction}
                    </Badge>
                  </div>
                  {c.subject && <p className="mt-0.5 text-xs text-muted-foreground">{c.subject}</p>}
                  {c.summary && <p className="mt-0.5 text-sm">{c.summary}</p>}
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDate(c.created_at, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
