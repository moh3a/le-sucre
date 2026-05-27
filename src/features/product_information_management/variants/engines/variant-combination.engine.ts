export function cartesian_combinations<T>(groups: T[][]): T[][] {
  return groups.reduce<T[][]>(
    (acc, group) => acc.flatMap((a) => group.map((b) => [...a, b])),
    [[]],
  );
}
