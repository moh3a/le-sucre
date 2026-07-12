"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Share2, Copy, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWishlistSharing } from "../hooks/use-wishlist";

interface WishlistShareDialogProps {
  wishlistId: string;
  wishlistName: string;
}

export function WishlistShareDialog({ wishlistId, wishlistName }: WishlistShareDialogProps) {
  const t = useTranslations("wishlist");
  const [open, setOpen] = useState(false);
  const [permission, setPermission] = useState<"read" | "collaborate">("read");
  const [expiresIn, setExpiresIn] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const { createLink } = useWishlistSharing();
  const [isCreating, setIsCreating] = useState(false);
  const [links, setLinks] = useState<Array<{ id: string; url: string; permission: string }>>([]);

  async function handleGenerateLink() {
    setIsCreating(true);
    try {
      const result = await createLink({
        wishlist_id: wishlistId,
        permission,
        expires_in_days: expiresIn ? parseInt(expiresIn) : undefined,
      });
      const url = `${window.location.origin}${result.url}`;
      setShareUrl(url);
      setLinks((prev) => [...prev, { id: result.id, url, permission: result.permission }]);
      toast.success(t("link_created"));
    } catch {
      toast.error(t("link_created"));
    } finally {
      setIsCreating(false);
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          {t("share")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("share_title", { name: wishlistName })}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div className="flex gap-2">
            <Select
              value={permission}
              onValueChange={(v: string) => setPermission(v as "read" | "collaborate")}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="read">{t("read_only")}</SelectItem>
                <SelectItem value="collaborate">{t("collaboration")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={expiresIn} onValueChange={setExpiresIn}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder={t("expiration")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">{t("never")}</SelectItem>
                <SelectItem value="7">{t("days_7")}</SelectItem>
                <SelectItem value="30">{t("days_30")}</SelectItem>
                <SelectItem value="90">{t("days_90")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleGenerateLink} disabled={isCreating}>
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : t("generate")}
            </Button>
          </div>

          {shareUrl && (
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button variant="secondary" onClick={handleCopy}>
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          )}

          {links.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("active_links")}</p>
              {links.map((link) => (
                <div
                  key={link.id}
                  className="bg-muted flex items-center justify-between rounded p-2 text-sm"
                >
                  <span className="flex-1 truncate">{link.url}</span>
                  <span className="text-muted-foreground ml-2 text-xs capitalize">
                    {link.permission}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
