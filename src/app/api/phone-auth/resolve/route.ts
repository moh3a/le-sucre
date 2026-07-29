import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { users } from "@/features/authentication_and_authorization/auth/schema";
import { normalize_phone } from "@/features/authentication_and_authorization/auth/services/phone-auth.service";

function is_email(value: string): boolean {
  return value.includes("@");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, phone, email } = body as { identifier?: string; phone?: string; email?: string };
    const value = identifier || phone || email;

    if (!value) {
      return NextResponse.json({ error: "Email ou téléphone requis / Email or phone required" }, { status: 400 });
    }

    if (is_email(value)) {
      const email_normalized = value.trim().toLowerCase();
      const [user] = await db
        .select({ id: users.id, email: users.email, name: users.name })
        .from(users)
        .where(eq(users.email, email_normalized))
        .limit(1);

      if (!user) {
        return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
      }

      return NextResponse.json({
        email: user.email,
        id: user.id,
        name: user.name,
      });
    }

    const normalized = normalize_phone(value);
    const [user] = await db
      .select({ id: users.id, email: users.email, name: users.name })
      .from(users)
      .where(eq(users.phone, normalized))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      email: user.email,
      id: user.id,
      name: user.name,
    });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
