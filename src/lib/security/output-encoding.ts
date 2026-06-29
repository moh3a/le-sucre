import "server-only";

export function encode_html(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

export function encode_html_attr(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

export function encode_js_string(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/<\//g, "<\\/");
}

export function encode_url_param(input: string): string {
  return encodeURIComponent(input).replace(/['()*!]/g, (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`);
}

export function encode_json_for_html<T>(data: T): string {
  const json = JSON.stringify(data);
  return json.replace(/<script>/gi, "<\\/script>").replace(/<!--/g, "<\\!--");
}

export function sanitize_rich_text(input: string): string {
  const ALLOWED_TAGS = new Set([
    "b", "i", "em", "strong", "u", "s", "mark", "small", "sub", "sup",
    "p", "br", "span", "div", "ul", "ol", "li",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "a", "img", "table", "thead", "tbody", "tr", "th", "td",
    "blockquote", "pre", "code",
  ]);
  const ALLOWED_ATTRS = new Set([
    "href", "target", "rel", "title", "alt", "src",
    "width", "height", "class", "id", "style",
  ]);
  const FORBIDDEN_PROTOCOLS = /^(javascript|data|vbscript|file):/i;

  return input.replace(/<[^>]*>/g, (tag) => {
    const match = tag.match(/^<\s*(\/?)(\w+)([^>]*)>/);
    if (!match) return "";
    const [, slash, tagName, attrs] = match;
    const lowerTag = tagName.toLowerCase();
    if (!ALLOWED_TAGS.has(lowerTag)) return "";
    if (slash) return `</${lowerTag}>`;

    const safe_attrs = attrs.replace(/(\w+)\s*=\s*("[^"]*"|'[^']*'|\S+)/g, (_, attr, value) => {
      const lowerAttr = attr.toLowerCase();
      if (!ALLOWED_ATTRS.has(lowerAttr)) return "";
      const clean = value.replace(/^["']|["']$/g, "");
      if (lowerAttr === "href" || lowerAttr === "src") {
        if (FORBIDDEN_PROTOCOLS.test(clean.trim())) return "";
        return `${attr}="${encode_html_attr(clean)}"`;
      }
      return `${attr}="${encode_html_attr(clean)}"`;
    });
    return `<${lowerTag}${safe_attrs}>`;
  });
}

export const RENDER_OUTPUT = {
  text: encode_html,
  attr: encode_html_attr,
  js: encode_js_string,
  url: encode_url_param,
  json: encode_json_for_html,
  richText: sanitize_rich_text,
} as const;
