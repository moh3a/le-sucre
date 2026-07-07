import "server-only";

const ALLOWED_HTML_TAGS = new Set([
  "b",
  "i",
  "em",
  "strong",
  "u",
  "s",
  "mark",
  "small",
  "sub",
  "sup",
  "p",
  "br",
  "span",
  "div",
  "ul",
  "ol",
  "li",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "a",
  "img",
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
  "blockquote",
  "pre",
  "code",
]);

const ALLOWED_HTML_ATTRS = new Set([
  "href",
  "target",
  "rel",
  "title",
  "alt",
  "src",
  "width",
  "height",
  "class",
  "id",
  "style",
]);

const FORBIDDEN_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

function sanitize_url(url: string | undefined): string | undefined {
  if (!url) return url;
  if (FORBIDDEN_PROTOCOLS.test(url.trim())) return "#blocked";
  return url;
}

export function sanitize_html(input: string): string {
  let previous: string;
  let result = input;
  do {
    previous = result;
    result = result.replace(/<[^>]*>/g, (tag) => {
      const match = tag.match(/^<\s*(\/?)(\w+)([^>]*)>/);
      if (!match) return "";
      const [, slash, tagName, attrs] = match;
      const lowerTag = tagName.toLowerCase();
      if (!ALLOWED_HTML_TAGS.has(lowerTag)) return "";
      if (slash) return `</${lowerTag}>`;
      const safe_attrs = attrs.replace(/(\w+)\s*=\s*("[^"]*"|'[^']*'|\S+)/g, (_, attr, value) => {
        const lowerAttr = attr.toLowerCase();
        if (!ALLOWED_HTML_ATTRS.has(lowerAttr)) return "";
        const clean = value.replace(/^["']|["']$/g, "");
        if (lowerAttr === "href" || lowerAttr === "src") {
          const safe = sanitize_url(clean);
          if (!safe) return "";
          return `${attr}="${safe}"`;
        }
        return `${attr}="${clean.replace(/"/g, "&quot;")}"`;
      });
      return `<${lowerTag}${safe_attrs}>`;
    });
  } while (result !== previous);
  return result;
}

export function sanitize_plain_text(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function sanitize_filename(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.\./g, "")
    .substring(0, 255);
}

export function sanitize_search_input(input: string): string {
  return input
    .replace(/[<>"';&|\\*?%~#(){}[\]!^$=+`]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .substring(0, 200);
}

export function sanitize_json<T>(data: T): T {
  if (typeof data === "string") return sanitize_plain_text(data) as unknown as T;
  if (Array.isArray(data)) return data.map(sanitize_json) as unknown as T;
  if (data && typeof data === "object") {
    const sanitized: Record<string, unknown> = Object.create(null);
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (key === "__proto__" || key === "constructor" || key === "prototype") continue;
      sanitized[key] = sanitize_json(value);
    }
    return sanitized as T;
  }
  return data;
}

export function prevent_mass_assignment<T extends Record<string, unknown>>(
  input: T,
  allowed_fields: string[],
): T {
  const safe: Record<string, unknown> = {};
  for (const field of allowed_fields) {
    if (field in input) safe[field] = input[field];
  }
  return safe as T;
}
