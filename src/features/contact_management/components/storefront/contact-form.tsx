"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Mail, Phone, MapPin, Clock, SendHorizonal, CircleCheck, CircleAlert, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { trpc } from "@/components/providers/app-providers";
import { contact_form_dto } from "../../models/contact.dto";

type FormValues = z.infer<typeof contact_form_dto>;

const CONTACT_INFO = [
  { icon: Mail, titleKey: "infoEmail", valueKey: "infoEmailValue" },
  { icon: Phone, titleKey: "infoPhone", valueKey: "infoPhoneValue" },
  { icon: MapPin, titleKey: "infoAddress", valueKey: "infoAddressValue" },
  { icon: Clock, titleKey: "infoHours", valueKey: "infoHoursValue" },
] as const;

export function ContactForm() {
  const t = useTranslations("contact");
  const params = useParams<{ locale: string }>();
  const locale = params?.locale ?? "fr";
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(contact_form_dto) as never,
    defaultValues: { name: "", email: "", subject: "", message: "", locale },
  });

  const submitMutation = trpc.contact.submit.useMutation({
    onSuccess: () => {
      form.reset();
    },
  });

  function onSubmit(data: FormValues) {
    submitMutation.mutate(data);
  }

  if (submitMutation.isSuccess) {
    return (
      <div className="container mx-auto space-y-12 px-4 py-8">
        <section className="text-center">
          <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
        </section>

        <Separator />

        <section className="mx-auto max-w-lg text-center">
          <Card className="p-8">
            <CircleCheck className="mx-auto mb-4 size-12 text-green-600" />
            <h2 className="mb-2 text-2xl font-bold">{t("successTitle")}</h2>
            <p className="text-muted-foreground mb-6">{t("successDescription")}</p>
            <Button onClick={() => submitMutation.reset()}>{t("sendAnother")}</Button>
          </Card>
        </section>

        <Separator />

        <section>
          <h2 className="mb-6 text-2xl font-bold">{t("infoTitle")}</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {CONTACT_INFO.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.titleKey}>
                  <CardHeader>
                    <Icon className="mb-2 size-6 text-primary" />
                    <CardTitle className="text-base">{t(item.titleKey)}</CardTitle>
                    <CardDescription>{t(item.valueKey)}</CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </section>

        <Separator />

        <section className="text-center">
          <h2 className="mb-4 text-2xl font-bold">{t("faqTitle")}</h2>
          <p className="text-muted-foreground mb-4">{t("faqDesc")}</p>
          <Button variant="outline" asChild>
            <Link href="/faq">{t("faqButton")}</Link>
          </Button>
        </section>

        <Separator />

        <section className="text-center">
          <h2 className="mb-6 text-2xl font-bold">{t("socialTitle")}</h2>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="icon" asChild>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
              </Link>
            </Button>
            <Button variant="outline" size="icon" asChild>
              <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </Link>
            </Button>
          </div>
        </section>

        <Separator />

        <section>
          <h2 className="mb-6 text-2xl font-bold">{t("mapTitle")}</h2>
          <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
            <div className="text-center">
              <MapPin className="text-muted-foreground mx-auto mb-2 size-8" />
              <p className="text-muted-foreground text-sm">{t("mapPlaceholder")}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-12 px-4 py-8">
      <section className="text-center">
        <h1 className="mb-4 text-4xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl text-lg">{t("subtitle")}</p>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("infoTitle")}</h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CONTACT_INFO.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.titleKey}>
                <CardHeader>
                  <Icon className="mb-2 size-6 text-primary" />
                  <CardTitle className="text-base">{t(item.titleKey)}</CardTitle>
                  <CardDescription>{t(item.valueKey)}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </section>

      {submitMutation.isPending ? (
        <section className="mx-auto max-w-2xl space-y-6">
          <h2 className="mb-6 text-2xl font-bold">{t("formTitle")}</h2>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-10 w-40" />
          </div>
          <div className="flex items-center justify-center gap-2 py-4">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground text-sm">{t("sending")}</span>
          </div>
        </section>
      ) : submitMutation.isError ? (
        <section className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold">{t("formTitle")}</h2>
          <Alert variant="destructive">
            <CircleAlert className="size-4" />
            <AlertTitle>{t("errorTitle")}</AlertTitle>
            <AlertDescription>
              {t("errorDescription")}
            </AlertDescription>
          </Alert>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name-error">{t("formNameLabel")}</Label>
                <Input
                  id="name-error"
                  placeholder={t("formNamePlaceholder")}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-error">{t("formEmailLabel")}</Label>
                <Input
                  id="email-error"
                  type="email"
                  placeholder={t("formEmailPlaceholder")}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject-error">{t("formSubjectLabel")}</Label>
              <Input
                id="subject-error"
                placeholder={t("formSubjectPlaceholder")}
                {...form.register("subject")}
              />
              {form.formState.errors.subject && (
                <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message-error">{t("formMessageLabel")}</Label>
              <Textarea
                id="message-error"
                placeholder={t("formMessagePlaceholder")}
                rows={6}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <SendHorizonal className="mr-2 size-4" />
              {t("formSubmit")}
            </Button>
          </form>
        </section>
      ) : (
        <section className="mx-auto max-w-2xl">
          <h2 className="mb-6 text-2xl font-bold">{t("formTitle")}</h2>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">{t("formNameLabel")}</Label>
                <Input
                  id="name"
                  placeholder={t("formNamePlaceholder")}
                  {...form.register("name")}
                />
                {form.formState.errors.name && (
                  <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("formEmailLabel")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("formEmailPlaceholder")}
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-xs text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">{t("formSubjectLabel")}</Label>
              <Input
                id="subject"
                placeholder={t("formSubjectPlaceholder")}
                {...form.register("subject")}
              />
              {form.formState.errors.subject && (
                <p className="text-xs text-destructive">{form.formState.errors.subject.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">{t("formMessageLabel")}</Label>
              <Textarea
                id="message"
                placeholder={t("formMessagePlaceholder")}
                rows={6}
                {...form.register("message")}
              />
              {form.formState.errors.message && (
                <p className="text-xs text-destructive">{form.formState.errors.message.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full sm:w-auto">
              <SendHorizonal className="mr-2 size-4" />
              {t("formSubmit")}
            </Button>
          </form>
        </section>
      )}

      <Separator />

      <section className="text-center">
        <h2 className="mb-4 text-2xl font-bold">{t("faqTitle")}</h2>
        <p className="text-muted-foreground mb-4">{t("faqDesc")}</p>
        <Button variant="outline" asChild>
          <Link href="/faq">{t("faqButton")}</Link>
        </Button>
      </section>

      <Separator />

      <section className="text-center">
        <h2 className="mb-6 text-2xl font-bold">{t("socialTitle")}</h2>
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="#" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <svg className="size-5" viewBox="0 0 24 24" fill="currentColor"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
              </Link>
            </Button>
        </div>
      </section>

      <Separator />

      <section>
        <h2 className="mb-6 text-2xl font-bold">{t("mapTitle")}</h2>
        <div className="bg-muted flex h-64 items-center justify-center rounded-lg">
          <div className="text-center">
            <MapPin className="text-muted-foreground mx-auto mb-2 size-8" />
            <p className="text-muted-foreground text-sm">{t("mapPlaceholder")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
