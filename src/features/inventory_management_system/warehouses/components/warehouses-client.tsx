"use client";

import { trpc } from "@/components/providers/app-providers";
import { useState } from "react";
import { useTranslations } from "next-intl";

export function WarehousesClient() {
  const { data: warehouses, refetch } = trpc.warehouses.listAllActive.useQuery();
  const create = trpc.warehouses.create.useMutation({ onSuccess: () => refetch() });
  const update = trpc.warehouses.update.useMutation({ onSuccess: () => refetch() });

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [location, setLocation] = useState("");

  const t = useTranslations("warehouses");
  const tc = useTranslations("common");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    create.mutate({ name, slug, location: location || undefined });
    setName(""); setSlug(""); setLocation("");
    setShowForm(false);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <button onClick={() => setShowForm(!showForm)} className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700">
          {showForm ? tc("cancel") : tc("create")}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-lg border bg-white p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">{tc("name")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required className="w-full rounded border px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{tc("slug")}</label>
              <input value={slug} onChange={(e) => setSlug(e.target.value)} required className="w-full rounded border px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t("location")}</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full rounded border px-3 py-2 text-sm" />
          </div>
          <button type="submit" className="rounded bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700">{tc("create")}</button>
        </form>
      )}

      <div className="rounded-lg border">
        <div className="divide-y">
          {warehouses?.map((w: any) => (
            <div key={w.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-medium">{w.name}</p>
                <p className="text-xs text-gray-500">{w.slug}{w.is_active === false ? ` · ${tc("inactive")}` : ` · ${tc("active")}`}{w.location ? ` · ${w.location}` : ""}</p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-xs ${w.is_active === false ? "bg-gray-100 text-gray-500" : "bg-green-100 text-green-700"}`}>
                {w.is_active === false ? tc("inactive") : tc("active")}
              </span>
            </div>
          ))}
          {(!warehouses || warehouses.length === 0) && <p className="p-4 text-sm text-gray-400">{tc("no_results")}</p>}
        </div>
      </div>
    </div>
  );
}
