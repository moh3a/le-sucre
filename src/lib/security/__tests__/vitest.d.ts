declare module "vitest" {
  export type Mock<T = (...args: unknown[]) => unknown> = T & { mockReturnValue: (val: unknown) => void; mockResolvedValue: (val: unknown) => void };
  export const describe: (name: string, fn: () => void) => void;
  export const it: (name: string, fn: () => void | Promise<void>) => void;
  export const expect: {
    <T>(actual: T): {
      toBe(expected: T): void;
      toEqual(expected: unknown): void;
      toBeNull(): void;
      toBeDefined(): void;
      toBeUndefined(): void;
      toBeTruthy(): void;
      toBeFalsy(): void;
      toContain(expected: unknown): void;
      toHaveLength(expected: number): void;
      toThrow(expected?: unknown): void;
      not: {
        toBe(expected: unknown): void;
        toEqual(expected: unknown): void;
      };
    };
  };
  export const vi: {
    fn: <T extends (...args: unknown[]) => unknown>(impl?: T) => (...args: unknown[]) => unknown;
    spyOn: <T, K extends keyof T>(obj: T, method: K) => { mockReturnValue: (val: unknown) => void };
    mock: (path: string, factory?: unknown) => void;
  };
}
