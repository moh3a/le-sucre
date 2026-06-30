"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function VerifyPhonePage() {
  const t = useTranslations("auth");
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);

  const is_success = false;
  const is_error = false;
  const error_message = "";
  const masked_phone = "+213 **** **12";
  const resend_countdown = 0;

  function handle_otp_change(index: number, value: string) {
    if (value.length > 1) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      const next_input = document.getElementById(`otp-${index + 1}`);
      next_input?.focus();
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold">{t("verify_phone_title")}</h1>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 text-center">
            {/* PHONE DISPLAY */}
            <p className="text-muted-foreground text-sm">
              {t("code_sent_to")} <span className="font-medium">{masked_phone}</span>
            </p>

            {/* OTP INPUT */}
            <div className="flex gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handle_otp_change(index, e.target.value)}
                  className="size-10 text-center"
                  autoComplete="one-time-code"
                />
              ))}
            </div>

            {/* SUCCESS */}
            {is_success && (
              <div className="flex flex-col items-center gap-2">
                <CheckCircle2 className="size-8 text-green-600" />
                <p className="text-sm font-medium">{t("phone_verified")}</p>
              </div>
            )}

            {/* ERROR */}
            {is_error && (
              <p className="text-destructive text-sm">{error_message}</p>
            )}

            <Button type="submit" className="w-full" disabled={is_success}>
              {t("verify_phone")}
            </Button>

            {/* RESEND */}
            <div className="text-center text-sm">
              {resend_countdown > 0 ? (
                <span className="text-muted-foreground">
                  {t("resend_in", { seconds: resend_countdown })}
                </span>
              ) : (
                <Button variant="link" className="h-auto p-0 text-sm">
                  {t("resend_code")}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
