import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createId } from "@paralleldrive/cuid2";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generate_id(): string {
  return createId();
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce(
    (acc, key) => {
      if (key in obj) acc[key] = obj[key];
      return acc;
    },
    {} as Pick<T, K>,
  );
}