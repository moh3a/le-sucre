"use client";

import { useState } from "react";
import { Upload, LayoutGrid, List, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaStats } from "./media-stats";
import { MediaGrid } from "./media-grid";
import { MediaDataTable } from "./media-data-table";
import { MediaUploadDialog } from "./media-upload-dialog";

export function MediaLibraryPageClient() {
  const [view, set_view] = useState<"grid" | "table">("grid");
  const [search, set_search] = useState("");

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Médiathèque</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Gérez tous vos fichiers médias : images, vidéos, documents.
          </p>
        </div>
        <MediaUploadDialog
          trigger={
            <Button>
              <Upload />
              Importer
            </Button>
          }
        />
      </div>

      <MediaStats />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
          <Input
            placeholder="Rechercher des fichiers..."
            className="pl-9"
            value={search}
            onChange={(e) => set_search(e.target.value)}
          />
        </div>
        <Tabs value={view} onValueChange={(v) => set_view(v as "grid" | "table")}>
          <TabsList>
            <TabsTrigger value="grid">
              <LayoutGrid />
              Grille
            </TabsTrigger>
            <TabsTrigger value="table">
              <List />
              Liste
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "grid" ? <MediaGrid search={search} /> : <MediaDataTable search={search} />}
    </div>
  );
}
