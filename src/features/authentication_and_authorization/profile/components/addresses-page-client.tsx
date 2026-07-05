"use client";

import { useTranslations } from "next-intl";
import { CircleAlert, Star, Trash2, MapPin } from "lucide-react";

import { trpc } from "@/components/providers/app-providers";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyMedia,
  EmptyContent,
} from "@/components/ui/empty";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

import { AddressFormCard } from "@/features/authentication_and_authorization/profile/components/addresses-section";
import type { UserAddress } from "@/features/authentication_and_authorization/profile/types";

function AddressesPageHeader({ addressCount }: { addressCount?: number }) {
  const t = useTranslations("account");
  const aT = useTranslations("addresses");
  const utils = trpc.useUtils();
  const refresh = () => {
    utils.profile.listAddresses.invalidate();
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{t("addresses_title")}</h1>
        <p className="text-muted-foreground">
          {addressCount !== undefined
            ? aT("addresses_count", { count: addressCount })
            : t("addresses_description")}
        </p>
      </div>
      {(addressCount === undefined || addressCount < 10) && (
        <AddressFormCard onSaved={refresh} onDeleted={refresh} />
      )}
    </div>
  );
}

function AddressesLoading() {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function AddressesError({ error }: { error: { message: string } }) {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <AddressesPageHeader />
      <Separator />
      <Alert variant="destructive">
        <CircleAlert className="size-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    </div>
  );
}

function AddressesEmpty() {
  const t = useTranslations("account");
  const utils = trpc.useUtils();
  const refresh = () => {
    utils.profile.listAddresses.invalidate();
  };

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <MapPin className="size-6" />
        </EmptyMedia>
        <EmptyTitle>{t("no_addresses")}</EmptyTitle>
        <EmptyDescription>{t("no_addresses_desc")}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <AddressFormCard onSaved={refresh} onDeleted={refresh} />
      </EmptyContent>
    </Empty>
  );
}

function AddressCard({ address, onRefresh }: { address: UserAddress; onRefresh: () => void }) {
  const t = useTranslations("account");
  const aT = useTranslations("addresses");
  const deleteAddress = trpc.profile.deleteAddress.useMutation({
    onSuccess: () => {
      toast.success(aT("address_deleted"));
      onRefresh();
    },
    onError: (err) => toast.error(err.message),
  });
  const setDefault = trpc.profile.setDefaultAddress.useMutation({
    onSuccess: () => {
      toast.success(aT("default_address_updated"));
      onRefresh();
    },
    onError: (err) => toast.error(err.message),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {address.is_default && <Star className="size-4 fill-yellow-400 text-yellow-400" />}
            <CardTitle className="text-lg">{address.label ?? ""}</CardTitle>
          </div>
          {address.is_default && <Badge variant="secondary">{t("default_badge")}</Badge>}
        </div>
        <CardDescription>
          {[address.first_name, address.last_name].filter(Boolean).join(" ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p>{address.address_line_1}</p>
        {address.address_line_2 && <p>{address.address_line_2}</p>}
        <p>{[address.postal_code, address.city].filter(Boolean).join(" ")}</p>
        <p>{[address.state, address.country].filter(Boolean).join(", ")}</p>
        {address.phone && <p className="pt-2 font-medium">{address.phone}</p>}
        <div className="flex gap-2 pt-3">
          <AddressFormCard address={address} onSaved={onRefresh} onDeleted={onRefresh} />
          {!address.is_default && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDefault.mutate({ address_id: address.id, type: "shipping" })}
            >
              <Star className="mr-1 size-3" />
              {aT("set_default")}
            </Button>
          )}
          {!address.is_default && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteAddress.mutate({ address_id: address.id })}
            >
              <Trash2 className="mr-1 size-3" />
              {t("delete")}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function AddressesList({ addresses }: { addresses: UserAddress[] }) {
  const utils = trpc.useUtils();
  const refresh = () => {
    utils.profile.listAddresses.invalidate();
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4">
      <AddressesPageHeader addressCount={addresses.length} />
      <Separator />
      <div className="grid gap-4 sm:grid-cols-2">
        {addresses.map((address) => (
          <AddressCard key={address.id} address={address} onRefresh={refresh} />
        ))}
      </div>
    </div>
  );
}

export function AddressesPageClient() {
  const { data: addresses, isLoading, error } = trpc.profile.listAddresses.useQuery();

  if (isLoading) return <AddressesLoading />;
  if (error) return <AddressesError error={error} />;
  if (!addresses || addresses.length === 0) return <AddressesEmpty />;

  return <AddressesList addresses={addresses as UserAddress[]} />;
}
