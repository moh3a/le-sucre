"use client";

import { useState } from "react";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Separator } from "@/components/ui/separator";

type Address = {
  id: string;
  label: string;
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
};

const placeholderAddresses: Address[] = [
  {
    id: "addr_1",
    label: "Domicile",
    name: "Ahmed Benali",
    phone: "+213 5XX XX XX XX",
    line1: "15 Rue Didouche Mourad",
    line2: "Appartement 5",
    city: "Alger",
    state: "Alger",
    postalCode: "16000",
    country: "Algérie",
    isDefault: true,
  },
  {
    id: "addr_2",
    label: "Bureau",
    name: "Ahmed Benali",
    phone: "+213 5XX XX XX XX",
    line1: "Cité des Olympiades",
    line2: null,
    city: "Alger",
    state: "Alger",
    postalCode: "16000",
    country: "Algérie",
    isDefault: false,
  },
];

export default function AddressesPage() {
  const t = useTranslations("account");
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("addresses_title")}</h1>
          <p className="text-muted-foreground">{t("addresses_description")}</p>
        </div>

        {/* ADD ADDRESS BUTTON */}
        <ResponsiveDialog open={open} onOpenChange={setOpen}>
          <ResponsiveDialogTrigger asChild>
            <Button>{t("add_address")}</Button>
          </ResponsiveDialogTrigger>
          <ResponsiveDialogContent>
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>{t("add_address_title")}</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {t("add_address_description")}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>
            {/* ADD/EDIT ADDRESS FORM (placeholder in dialog) */}
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <label htmlFor="addrLabel" className="text-sm font-medium">
                  {t("address_label")}
                </label>
                <Input id="addrLabel" placeholder={t("address_label_placeholder")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="addrName" className="text-sm font-medium">
                    {t("address_name")}
                  </label>
                  <Input id="addrName" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="addrPhone" className="text-sm font-medium">
                    {t("address_phone")}
                  </label>
                  <Input id="addrPhone" type="tel" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="addrLine1" className="text-sm font-medium">
                  {t("address_line1")}
                </label>
                <Input id="addrLine1" />
              </div>
              <div className="space-y-2">
                <label htmlFor="addrLine2" className="text-sm font-medium">
                  {t("address_line2")}
                </label>
                <Input id="addrLine2" />
              </div>
              <div className="grid gap-4 sm:grid-cols-4">
                <div className="space-y-2 sm:col-span-2">
                  <label htmlFor="addrCity" className="text-sm font-medium">
                    {t("address_city")}
                  </label>
                  <Input id="addrCity" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="addrState" className="text-sm font-medium">
                    {t("address_state")}
                  </label>
                  <Input id="addrState" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="addrPostalCode" className="text-sm font-medium">
                    {t("address_postal")}
                  </label>
                  <Input id="addrPostalCode" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="addrCountry" className="text-sm font-medium">
                  {t("address_country")}
                </label>
                <Input id="addrCountry" />
              </div>
            </div>
            <ResponsiveDialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                {t("cancel")}
              </Button>
              <Button onClick={() => setOpen(false)}>{t("save")}</Button>
            </ResponsiveDialogFooter>
          </ResponsiveDialogContent>
        </ResponsiveDialog>
      </div>

      <Separator />

      {/* ADDRESSES LIST */}
      {placeholderAddresses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {placeholderAddresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{address.label}</CardTitle>
                  {/* DEFAULT BADGE */}
                  {address.isDefault && <Badge variant="secondary">{t("default_badge")}</Badge>}
                </div>
                <CardDescription>{address.name}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1 text-sm">
                <p>{address.line1}</p>
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {address.postalCode} {address.city}
                </p>
                <p>
                  {address.state}, {address.country}
                </p>
                <p className="pt-2 font-medium">{address.phone}</p>
                <div className="flex gap-2 pt-3">
                  {/* TODO: Wire up edit and delete actions */}
                  <Button variant="outline" size="sm">
                    {t("edit")}
                  </Button>
                  {!address.isDefault && (
                    <Button variant="ghost" size="sm">
                      {t("delete")}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* EMPTY STATE */
        <Card>
          <CardHeader>
            <CardTitle>{t("no_addresses")}</CardTitle>
            <CardDescription>{t("no_addresses_desc")}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setOpen(true)}>{t("add_address")}</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
