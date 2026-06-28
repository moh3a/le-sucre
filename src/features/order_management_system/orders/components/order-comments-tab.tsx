"use client";

import { useState } from "react";
import { toast } from "sonner";
import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslations } from "next-intl";
import { formatDate } from "@/lib/format";
import { MessageSquare, Send, Lock, Globe } from "lucide-react";

type OrderCommentsTabProps = {
  order_id: string;
};

export function OrderCommentsTab({ order_id }: OrderCommentsTabProps) {
  const t = useTranslations("orders");
  const { data: comments, refetch } = trpc.operations.orderGetComments.useQuery({
    order_id,
    include_private: true,
  });
  const [content, set_content] = useState("");
  const [is_private, set_is_private] = useState(true);

  const add_comment = trpc.operations.orderAddComment.useMutation({
    onSuccess: () => {
      refetch();
      set_content("");
      toast.success(t("comment_added"));
    },
    onError: (err) => toast.error(`${t("error")}: ${err.message}`),
  });

  return (
    <QueryGuard query={{ isLoading: !comments?.length }} mutation={add_comment}>
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {t("add_comment")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => set_content(e.target.value)}
            rows={3}
            placeholder={t("comment_placeholder")}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={is_private}
                onChange={(e) => set_is_private(e.target.checked)}
                className="h-4 w-4"
              />
              {is_private ? (
                <>
                  <Lock className="h-3 w-3" />
                  {t("internal_comment")}
                </>
              ) : (
                <>
                  <Globe className="h-3 w-3" />
                  {t("public_comment")}
                </>
              )}
            </label>
            <Button
              size="sm"
              disabled={!content.trim() || add_comment.isPending}
              onClick={() =>
                add_comment.mutate({ order_id, content: content.trim(), is_private })
              }
            >
              <Send className="mr-1 h-3 w-3" />
              {t("send")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {(comments?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              {t("comments")} ({comments?.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {comments?.map((c) => (
              <div
                key={c.id}
                className={`rounded-md border p-3 text-sm ${
                  c.is_private
                    ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
                    : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {c.is_private ? (
                      <Lock className="h-3 w-3 text-amber-500" />
                    ) : (
                      <Globe className="h-3 w-3 text-blue-500" />
                    )}
                    <span className="font-medium">{c.author_user_id}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(c.created_at, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="mt-1 whitespace-pre-wrap">{c.content}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
    </QueryGuard>
  );
}
