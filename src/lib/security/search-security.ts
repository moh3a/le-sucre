import "server-only";

export const SEARCH_SECURITY_LIMITS = {
  MAX_QUERY_LENGTH: 200,
  MIN_QUERY_LENGTH: 2,
  MAX_FILTERS: 20,
  MAX_SORT_FIELDS: 3,
  MAX_WILDCARD_DEPTH: 2,
  MAX_TERMS: 20,
  MAX_REGEX_LENGTH: 50,
  FORBIDDEN_PATTERNS: [
    /(\bALTER\b|\bDROP\b|\bTRUNCATE\b|\bDELETE\b)/i,
    /(\bUNION\b.*\bSELECT\b)/i,
    /(\bSELECT\b.*\bFROM\b)/i,
    /(\bINSERT\b.*\bINTO\b)/i,
    /(\bUPDATE\b.*\bSET\b)/i,
    /(\bCREATE\b|\bEXEC\b|\bEXECUTE\b)/i,
    /(\bSLEEP\b|\bBENCHMARK\b|\bWAITFOR\b)/i,
    /(\bLOAD_FILE\b|\bINTO\s+OUTFILE\b|\bINTO\s+DUMPFILE\b)/i,
    /(\bPG_SLEEP\b|\bDBMS_LOCK\b)/i,
  ],
};

export interface SearchValidationResult {
  valid: boolean;
  sanitized_query: string;
  error?: string;
}

export function validate_search_complexity(query: string): SearchValidationResult {
  if (!query || query.trim().length === 0) {
    return { valid: true, sanitized_query: "" };
  }

  const trimmed = query.trim();

  if (trimmed.length < SEARCH_SECURITY_LIMITS.MIN_QUERY_LENGTH) {
    return {
      valid: false,
      sanitized_query: trimmed,
      error: `Search query too short (min ${SEARCH_SECURITY_LIMITS.MIN_QUERY_LENGTH} characters)`,
    };
  }

  if (trimmed.length > SEARCH_SECURITY_LIMITS.MAX_QUERY_LENGTH) {
    return {
      valid: false,
      sanitized_query: trimmed.substring(0, SEARCH_SECURITY_LIMITS.MAX_QUERY_LENGTH),
      error: `Search query too long (max ${SEARCH_SECURITY_LIMITS.MAX_QUERY_LENGTH} characters)`,
    };
  }

  for (const pattern of SEARCH_SECURITY_LIMITS.FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      return {
        valid: false,
        sanitized_query: trimmed.replace(pattern, ""),
        error: "Search query contains forbidden patterns",
      };
    }
  }

  const terms = trimmed.split(/\s+/);
  if (terms.length > SEARCH_SECURITY_LIMITS.MAX_TERMS) {
    return {
      valid: false,
      sanitized_query: terms.slice(0, SEARCH_SECURITY_LIMITS.MAX_TERMS).join(" "),
      error: `Too many search terms (max ${SEARCH_SECURITY_LIMITS.MAX_TERMS})`,
    };
  }

  const wildcard_count = (trimmed.match(/[*?]/g) || []).length;
  if (wildcard_count > SEARCH_SECURITY_LIMITS.MAX_WILDCARD_DEPTH) {
    return {
      valid: false,
      sanitized_query: trimmed.replace(/[*?]/g, ""),
      error: "Too many wildcard characters",
    };
  }

  const sanitized = trimmed
    .replace(/[<>"';&|\\*?%~#(){}[\]!^$=+`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, SEARCH_SECURITY_LIMITS.MAX_QUERY_LENGTH);

  return { valid: true, sanitized_query: sanitized };
}

export function validate_filter_params(
  filters: Record<string, string | string[]>,
): { valid: boolean; sanitized: Record<string, string | string[]>; error?: string } {
  const filter_keys = Object.keys(filters);
  if (filter_keys.length > SEARCH_SECURITY_LIMITS.MAX_FILTERS) {
    return {
      valid: false,
      sanitized: filters,
      error: `Too many filter parameters (max ${SEARCH_SECURITY_LIMITS.MAX_FILTERS})`,
    };
  }

  const sanitized: Record<string, string | string[]> = {};
  for (const [key, value] of Object.entries(filters)) {
    if (typeof value === "string") {
      sanitized[key] = value.replace(/[<>"';&|\\*?%~#(){}[\]!^$=+`]/g, "").substring(0, 200);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((v) =>
        String(v).replace(/[<>"';&|\\*?%~#(){}[\]!^$=+`]/g, "").substring(0, 200),
      );
    }
  }

  return { valid: true, sanitized: sanitized };
}
