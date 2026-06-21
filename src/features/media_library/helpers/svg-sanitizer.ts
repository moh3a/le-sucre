import "server-only";

const FORBIDDEN_TAGS = new Set([
  "script",
  "foreignobject",
  "foreignObject",
  "iframe",
  "frame",
  "embed",
  "object",
  "applet",
  "meta",
  "link",
  "style",
  "form",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  "optgroup",
  "label",
  "formaction",
  "isindex",
  "keygen",
  "marquee",
  "animation",
  "animatemotion",
  "animatetransform",
  "set",
  "handler",
  "listener",
]);

const FORBIDDEN_ATTR_PATTERNS = [
  /^on/i,
  /^xmlns:/i,
  /^xlink:/i,
  /^x:/i,
];

const FORBIDDEN_VALUES = [
  /javascript:/i,
  /vbscript:/i,
  /data:/i,
  /expression\(/i,
  /url\(/i,
  /eval\(/i,
  /import\(/i,
  /require\(/i,
  /new\s+Function/i,
  /setTimeout/i,
  /setInterval/i,
  /alert\(/i,
  /prompt\(/i,
  /confirm\(/i,
  /fetch\(/i,
  /XMLHttpRequest/i,
  /WebSocket/i,
];

const ALLOWED_SVG_ELEMENTS = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "ellipse",
  "rect",
  "line",
  "polyline",
  "polygon",
  "text",
  "textpath",
  "tspan",
  "tref",
  "defs",
  "use",
  "symbol",
  "image",
  "clipPath",
  "clippath",
  "mask",
  "filter",
  "fefilter",
  "feblend",
  "fecolormatrix",
  "fecomponenttransfer",
  "fecomposite",
  "feconvolvematrix",
  "fediffuselighting",
  "fedisplacementmap",
  "fedistantlight",
  "fedropshadow",
  "feflood",
  "fefunca",
  "fefuncb",
  "fefuncg",
  "fefuncr",
  "fegaussianblur",
  "feimage",
  "femerge",
  "femergenode",
  "femorphology",
  "feoffset",
  "fepointlight",
  "fespecularlighting",
  "fespotlight",
  "fetile",
  "feturbulence",
  "lineargradient",
  "radialgradient",
  "stop",
  "pattern",
  "marker",
  "view",
  "switch",
  "foreignobject",
  "desc",
  "title",
  "metadata",
  "style",
  "a",
  "altglyph",
  "altglyphdef",
  "altglyphitem",
  "glyph",
  "glyphref",
  "font",
  "font-face",
  "font-face-format",
  "font-face-name",
  "font-face-src",
  "font-face-uri",
  "hkern",
  "vkern",
  "missing-glyph",
  "mpath",
  "cursor",
  "color-profile",
]);

const ALLOWED_ATTRS = new Set([
  "id",
  "class",
  "style",
  "xmlns",
  "viewbox",
  "version",
  "baseprofile",
  "x",
  "y",
  "width",
  "height",
  "rx",
  "ry",
  "cx",
  "cy",
  "r",
  "d",
  "path",
  "points",
  "fill",
  "fill-opacity",
  "fill-rule",
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-opacity",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-miterlimit",
  "opacity",
  "transform",
  "translate",
  "scale",
  "rotate",
  "skewx",
  "skewy",
  "matrix",
  "origin",
  "clip-path",
  "clip-rule",
  "mask",
  "filter",
  "offset",
  "stop-color",
  "stop-opacity",
  "font-family",
  "font-size",
  "font-style",
  "font-weight",
  "font-variant",
  "text-anchor",
  "text-decoration",
  "letter-spacing",
  "word-spacing",
  "direction",
  "unicode-bidi",
  "writing-mode",
  "alignment-baseline",
  "baseline-shift",
  "dominant-baseline",
  "glyph-orientation-horizontal",
  "glyph-orientation-vertical",
  "kerning",
  "text-length",
  "text-rendering",
  "method",
  "spacing",
  "startoffset",
  "lengthadjust",
  "display",
  "visibility",
  "overflow",
  "clip",
  "color",
  "color-interpolation",
  "color-interpolation-filters",
  "color-profile",
  "color-rendering",
  "cursor",
  "direction",
  "enable-background",
  "image-rendering",
  "pointer-events",
  "shape-rendering",
  "solid-color",
  "solid-opacity",
  "text-rendering",
  "vector-effect",
  "xml:space",
  "xml:lang",
  "preserveaspectratio",
  "preserveAspectRatio",
  "href",
  "xlink:href",
  "target",
  "rel",
  "type",
  "role",
  "aria-label",
  "aria-hidden",
  "tabindex",
  "lang",
  "hreflang",
  "ping",
  "referrerpolicy",
]);

export interface SanitizedSvgResult {
  sanitized: string;
  is_modified: boolean;
  warnings: string[];
}

function is_forbidden_value(value: string): boolean {
  const trimmed = value.trim().toLowerCase();
  for (const pattern of FORBIDDEN_VALUES) {
    if (pattern.test(trimmed)) return true;
  }
  return false;
}

function sanitize_attr(name: string, value: string): string | null {
  const lower_name = name.toLowerCase();

  for (const pattern of FORBIDDEN_ATTR_PATTERNS) {
    if (pattern.test(lower_name)) return null;
  }

  if (!ALLOWED_ATTRS.has(lower_name)) return null;

  if (is_forbidden_value(value)) return null;

  if (lower_name === "href" || lower_name === "xlink:href") {
    if (!value.startsWith("#") && !value.startsWith("http") && value !== "") {
      return null;
    }
  }

  return value;
}

export function sanitize_svg_content(input: string): SanitizedSvgResult {
  const warnings: string[] = [];
  let is_modified = false;

  const tag_regex = /<\/?([a-zA-Z][a-zA-Z0-9]*)([^>]*)>/g;
  let last_index = 0;
  const parts: string[] = [];

  let match: RegExpExecArray | null;
  while ((match = tag_regex.exec(input)) !== null) {
    parts.push(input.slice(last_index, match.index));
    last_index = match.index + match[0].length;

    const is_closing = match[0].startsWith("</");
    const tag_name = match[1];
    const attrs_str = match[2];

    if (is_closing) {
      if (!ALLOWED_SVG_ELEMENTS.has(tag_name)) {
        warnings.push(`Removed closing tag: </${tag_name}>`);
        is_modified = true;
        continue;
      }
      parts.push(`</${tag_name}>`);
      continue;
    }

    if (!ALLOWED_SVG_ELEMENTS.has(tag_name)) {
      if (FORBIDDEN_TAGS.has(tag_name)) {
        warnings.push(`Removed forbidden tag: <${tag_name}>`);
      } else {
        warnings.push(`Removed unknown tag: <${tag_name}>`);
      }
      is_modified = true;
      continue;
    }

    if (FORBIDDEN_TAGS.has(tag_name)) {
      warnings.push(`Removed forbidden tag: <${tag_name}>`);
      is_modified = true;
      continue;
    }

    const self_closing = attrs_str.trim().endsWith("/");
    const attr_content = self_closing ? attrs_str.trim().slice(0, -1).trim() : attrs_str;

    const attr_regex = /([a-zA-Z][a-zA-Z0-9:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|(\S+))/g;
    let attr_match: RegExpExecArray | null;
    const safe_attrs: string[] = [];
    let attr_removed = false;

    while ((attr_match = attr_regex.exec(attr_content)) !== null) {
      const attr_name = attr_match[1];
      const attr_value = attr_match[2] ?? attr_match[3] ?? attr_match[4] ?? "";

      const safe_value = sanitize_attr(attr_name, attr_value);
      if (safe_value === null) {
        warnings.push(`Removed attribute '${attr_name}' from <${tag_name}>`);
        attr_removed = true;
        is_modified = true;
        continue;
      }
      safe_attrs.push(`${attr_name}="${safe_value.replace(/"/g, "&quot;")}"`);
    }

    const cdata_match = attr_content.match(/<!\[CDATA\[.*?\]\]>/g);
    if (cdata_match) {
      warnings.push(`Removed CDATA section from <${tag_name}>`);
      is_modified = true;
      continue;
    }

    const comment_match = attr_content.match(/<!--.*?-->/g);
    if (comment_match) {
      is_modified = true;
    }

    const attr_str = safe_attrs.length > 0 ? ` ${safe_attrs.join(" ")}` : (attr_removed ? "" : attrs_str);
    parts.push(`<${tag_name}${attr_str}${self_closing ? " /" : ""}>`);
  }

  parts.push(input.slice(last_index));

  const sanitized = parts.join("");

  const has_doctype = /<!DOCTYPE/i.test(sanitized);
  const has_xml_header = /<\?xml/i.test(sanitized);
  const has_comments = /<!--/.test(sanitized);
  const has_cdata = /<!\[CDATA\[/.test(sanitized);

  let final = sanitized;
  if (has_cdata) {
    final = final.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, "");
    is_modified = true;
  }
  if (has_comments) {
    final = final.replace(/<!--[\s\S]*?-->/g, "");
    is_modified = true;
  }
  if (has_doctype) {
    final = final.replace(/<!DOCTYPE[^>]*>/gi, "");
    is_modified = true;
  }
  if (has_xml_header) {
    final = final.replace(/<\?xml[^>]*\?>/gi, "");
    is_modified = true;
  }

  if (final.length > 1024 * 1024) {
    warnings.push("SVG exceeds maximum size of 1MB after sanitization");
    is_modified = true;
    final = final.slice(0, 1024 * 1024);
  }

  return { sanitized: final, is_modified, warnings };
}
