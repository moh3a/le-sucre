"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import Image from "next/image";
import { Trash2, LinkIcon, Check, Download, FileVideo, FileText, Settings2 } from "lucide-react";
import { toast } from "sonner";

import { QueryGuard } from "@/components/query-guard";
import { trpc } from "@/components/providers/app-providers";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { MediaDTO, MediaListItem } from "../types";
import { MediaOperationsDialog } from "./admin-media-operations";

function format_bytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

function format_date(date_str: string) {
  return new Date(date_str).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type MediaDataTableProps = {
  search?: string;
};

export function MediaDataTable({ search }: MediaDataTableProps) {
  const t = useTranslations("media");
  const [page, set_page] = useState(1);
  const [copied_id, set_copied_id] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const { data, isLoading } = trpc.media.list.useQuery({
    search,
    limit: 20,
    page,
  });

  const delete_media = trpc.media.delete.useMutation({
    onSuccess: () => {
      utils.media.list.invalidate();
      utils.media.stats.invalidate();
    },
  });

  return (
    <QueryGuard query={{ isLoading }} loadingFallback={
      <div className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    }>
    {!data ? null : (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">{t("preview_column")}</TableHead>
              <TableHead>{t("name_column")}</TableHead>
              <TableHead>{t("type_column")}</TableHead>
              <TableHead>{t("size_column")}</TableHead>
              <TableHead>{t("dimensions_column")}</TableHead>
              <TableHead>{t("usage_column")}</TableHead>
              <TableHead>{t("date_column")}</TableHead>
              <TableHead className="w-20">{t("actions_column")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(data.items as MediaListItem[]).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="bg-muted flex h-10 w-10 items-center justify-center overflow-hidden rounded border">
                    {item.kind === "image" ? (
                      <Image
                        src={item.url}
                        alt={item.alt ?? ""}
                        width={40}
                        height={40}
                        className="size-full object-cover"
                        unoptimized
                      />
                    ) : item.kind === "video" ? (
                      <FileVideo className="text-muted-foreground size-5" />
                    ) : (
                      <FileText className="text-muted-foreground size-5" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <p className="max-w-48 truncate text-sm font-medium" title={item.original_name}>
                    {item.original_name}
                  </p>
                  <p className="text-muted-foreground truncate text-xs">{item.filename}</p>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">
                    {item.mime_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{format_bytes(item.size)}</TableCell>
                <TableCell className="text-sm">
                  {item.width && item.height ? `${item.width}×${item.height}` : "-"}
                </TableCell>
                <TableCell className="text-sm">{item.usage_count ?? 0}</TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {format_date(item.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <MediaOperationsDialog
                      media_id={item.id}
                      trigger={
                        <Button variant="ghost" size="icon" className="size-7" title="Opérations">
                          <Settings2 />
                        </Button>
                      }
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                        set_copied_id(item.id);
                        toast.success(t("url_copied"));
                        setTimeout(() => set_copied_id(null), 2000);
                      }}
                      title={t("download_title")}
                    >
                      {copied_id === item.id ? <Check /> : <LinkIcon />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7"
                      asChild
                      title={t("download_title")}
                    >
                      <a
                        href={item.url}
                        download={item.original_name}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download />
                      </a>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive size-7"
                          title={t("delete_title")}
                        >
                          <Trash2 />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>{t("delete_confirm_title")}</AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("delete_confirm_description", { name: item.original_name })}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => delete_media.mutate({ id: item.id })}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            {t("delete_file")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => set_page((p) => Math.max(1, p - 1))}
          disabled={page <= 1}
        >
          {t("previous")}
        </Button>
        <span className="text-muted-foreground text-sm">
          {t("page_info", { page, total: data.meta.total_pages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => set_page((p) => p + 1)}
          disabled={!data.meta.has_more}
        >
          {t("next")}
        </Button>
      </div>
    </div>
    )}
    </QueryGuard>
  );
}
