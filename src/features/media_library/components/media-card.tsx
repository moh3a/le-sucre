"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileVideo, FileText, Trash2, Download, Link as LinkIcon, Check } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/components/providers/app-providers";
import { QueryGuard } from "@/components/query-guard";
import type { MediaDTO } from "../types";

function format_bytes(bytes: number) {
  if (bytes === 0) return "0 B";
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(i ? 1 : 0)} ${sizes[i]}`;
}

type MediaCardProps = {
  item: MediaDTO & { usage_count?: number };
  onDelete?: () => void;
};

export function MediaCard({ item, onDelete }: MediaCardProps) {
  const t = useTranslations("media");
  const [copied, set_copied] = useState(false);
  const utils = trpc.useUtils();
  const delete_media = trpc.media.delete.useMutation({
    onSuccess: () => {
      utils.media.list.invalidate();
      utils.media.stats.invalidate();
      onDelete?.();
    },
  });

  function copy_url() {
    navigator.clipboard.writeText(item.url);
    set_copied(true);
    toast.success(t("url_copied"));
    setTimeout(() => set_copied(false), 2000);
  }

  return (
    <QueryGuard mutation={delete_media}>
    <Card className="group relative overflow-hidden">
      <div className="bg-muted relative aspect-square overflow-hidden">
        {item.kind === "image" ? (
          <Image
            src={item.url}
            alt={item.alt ?? item.original_name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            unoptimized
          />
        ) : item.kind === "video" ? (
          <div className="flex h-full items-center justify-center">
            <FileVideo className="text-muted-foreground size-12" />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <FileText className="text-muted-foreground size-12" />
          </div>
        )}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <Badge variant="secondary" className="text-xs">
            {format_bytes(item.size)}
          </Badge>
          {item.width && item.height && (
            <Badge variant="secondary" className="text-xs">
              {item.width}x{item.height}
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-2">
        <p className="truncate text-xs font-medium" title={item.original_name}>
          {item.original_name}
        </p>
        <p className="text-muted-foreground text-xs">{item.mime_type}</p>
      </CardContent>
      <CardFooter className="flex justify-between p-2 pt-0">
        <span className="text-muted-foreground text-xs">
          {item.usage_count != null ? t("usage_count", { count: item.usage_count }) : ""}
        </span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-7">
              <span className="sr-only">{t("actions_sr")}</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="size-4"
              >
                <circle cx="7.5" cy="3.5" r="1" fill="currentColor" />
                <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
                <circle cx="7.5" cy="11.5" r="1" fill="currentColor" />
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={copy_url}>
              {copied ? <Check /> : <LinkIcon />}
              {t("copy_url")}
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={item.url} download={item.original_name} target="_blank" rel="noreferrer">
                <Download />
                {t("download_title")}
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-destructive">
                  <Trash2 />
                  {t("delete_file")}
                </DropdownMenuItem>
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
                    {t("confirm_delete")}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
    </QueryGuard>
  );
}
