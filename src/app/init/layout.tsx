import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "System Initialization",
};

export default function InitLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
