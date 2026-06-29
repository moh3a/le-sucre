import { describe, it, expect } from "vitest";
import {
  encode_html,
  encode_html_attr,
  encode_js_string,
  encode_url_param,
  encode_json_for_html,
  sanitize_rich_text,
} from "../output-encoding";

describe("encode_html", () => {
  it("encodes basic XSS vectors", () => {
    expect(encode_html("<script>alert('xss')</script>")).toBe("&lt;script&gt;alert(&#x27;xss&#x27;)&lt;&#x2F;script&gt;");
  });

  it("encodes HTML special characters", () => {
    expect(encode_html('test "quote" & <tag>')).toBe("test &quot;quote&quot; &amp; &lt;tag&gt;");
  });

  it("passes safe strings through", () => {
    expect(encode_html("hello world")).toBe("hello world");
  });
});

describe("encode_html_attr", () => {
  it("encodes attribute values", () => {
    expect(encode_html_attr('"onclick="alert(1)"')).toBe("&quot;onclick=&quot;alert(1)&quot;");
  });
});

describe("encode_js_string", () => {
  it("escapes JavaScript string injection", () => {
    expect(encode_js_string("'); alert(1); '")).toBe("\\'); alert(1); \\'");
  });

  it("escapes closing script tags", () => {
    expect(encode_js_string("</script>")).toBe("<\\/script>");
  });
});

describe("encode_url_param", () => {
  it("encodes URL parameters", () => {
    expect(encode_url_param("hello world & more")).toBe("hello%20world%20%26%20more");
  });
});

describe("sanitize_rich_text", () => {
  it("strips forbidden tags", () => {
    expect(sanitize_rich_text("<script>alert(1)</script>")).toBe("");
  });

  it("allows safe tags", () => {
    expect(sanitize_rich_text("<b>bold</b> <i>italic</i>")).toBe("<b>bold</b> <i>italic</i>");
  });

  it("blocks javascript: URLs", () => {
    expect(sanitize_rich_text('<a href="javascript:alert(1)">click</a>')).toBe('<a href="">click</a>');
  });

  it("blocks event handlers", () => {
    expect(sanitize_rich_text('<img onerror="alert(1)" src="x">')).toBe('<img src="x">');
  });
});

describe("encode_json_for_html", () => {
  it("escapes script tags in JSON", () => {
    expect(encode_json_for_html({ html: "</script><script>alert(1)" })).not.toContain("</script>");
    expect(encode_json_for_html({ html: "<!-- comment -->" })).not.toContain("<!--");
  });
});
