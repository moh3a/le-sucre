import { SCORING_WEIGHTS } from "../constants/scoring-weights";
import type { ScoredCandidate } from "../types";

export function merge_candidate_scores(
  map: Map<string, ScoredCandidate>,
  product_id: string,
  partial: number,
  signal_key: string,
) {
  const existing = map.get(product_id) ?? { product_id, score: 0, signals: {} };
  existing.score += partial;
  existing.signals[signal_key] = (existing.signals[signal_key] ?? 0) + partial;
  map.set(product_id, existing);
}

export function normalize_candidates(
  candidates: ScoredCandidate[],
  exclude_product_id?: string,
): ScoredCandidate[] {
  const filtered = candidates.filter((c) => c.product_id !== exclude_product_id);
  const max = Math.max(...filtered.map((c) => c.score), 1);
  return filtered
    .map((c) => ({ ...c, score: Number((c.score / max).toFixed(4)) }))
    .sort((a, b) => b.score - a.score);
}

export function tokenize_keywords(value?: string | null) {
  if (!value) return new Set<string>();
  return new Set(
    value
      .toLowerCase()
      .split(/[\s,;|]+/)
      .map((t) => t.trim())
      .filter((t) => t.length >= 3),
  );
}

export function keyword_overlap_score(a: Set<string>, b: Set<string>) {
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  for (const token of a) if (b.has(token)) overlap += 1;
  const denom = Math.max(a.size, b.size);
  return (overlap / denom) * SCORING_WEIGHTS.keyword_overlap;
}

export function price_proximity_score(base: number, candidate: number, tolerance_ratio = 0.2) {
  if (!base || !candidate) return 0;
  const diff = Math.abs(base - candidate) / base;
  if (diff > tolerance_ratio) return 0;
  return (1 - diff / tolerance_ratio) * SCORING_WEIGHTS.price_proximity;
}

export function tag_overlap_score(tags_a: string[] | undefined, tags_b: string[] | undefined) {
  if (!tags_a?.length || !tags_b?.length) return 0;
  const set_b = new Set(tags_b.map((t) => t.toLowerCase()));
  const overlap = tags_a.filter((t) => set_b.has(t.toLowerCase())).length;
  return (overlap / Math.max(tags_a.length, tags_b.length)) * SCORING_WEIGHTS.tag_overlap;
}
