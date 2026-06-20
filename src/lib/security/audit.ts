import "server-only";

import fs from "fs";
import path from "path";

interface AuditFinding {
  severity: "critical" | "high" | "medium" | "low";
  category: string;
  file: string;
  description: string;
  recommendation: string;
}

export class SecurityAuditor {
  private findings: AuditFinding[] = [];
  private sourceDir: string;

  constructor(sourceDir: string) {
    this.sourceDir = sourceDir;
  }

  private add_finding(finding: AuditFinding): void {
    this.findings.push(finding);
  }

  async run_full_audit(): Promise<AuditFinding[]> {
    this.findings = [];
    await this.audit_rate_limiting();
    await this.audit_csrf_protection();
    await this.audit_sanitization();
    await this.audit_authentication();
    await this.audit_authorization();
    await this.audit_webhooks();
    await this.audit_file_uploads();
    await this.audit_logging();
    await this.audit_cors();
    await this.audit_export_endpoints();
    return this.findings;
  }

  private async audit_rate_limiting(): Promise<void> {
    const rate_limit_files = this.search_files("rate-limit", "rateLimit", "ratelimit");
    if (rate_limit_files.length === 0) {
      this.add_finding({
        severity: "high",
        category: "rate_limiting",
        file: "global",
        description: "No rate limiting implementation found",
        recommendation: "Implement Redis-backed rate limiting middleware",
      });
    }
  }

  private async audit_csrf_protection(): Promise<void> {
    const csrf_files = this.search_files("csrf", "CSRF_COOKIE", "x-csrf-token");
    const api_guards = this.search_files("api-guards", "assert_csrf");
    if (csrf_files.length === 0) {
      this.add_finding({
        severity: "critical",
        category: "csrf",
        file: "global",
        description: "No CSRF protection found",
        recommendation: "Implement double-submit cookie CSRF pattern",
      });
    }
  }

  private async audit_sanitization(): Promise<void> {
    const sanitize_files = this.search_files("sanitize", "xss", "escape");
    if (sanitize_files.length === 0) {
      this.add_finding({
        severity: "critical",
        category: "xss",
        file: "global",
        description: "No input sanitization found",
        recommendation: "Implement centralized sanitization for all user inputs",
      });
    }
  }

  private async audit_authentication(): Promise<void> {
    const auth_files = this.search_files("auth", "session", "login", "password");
    if (auth_files.length === 0) {
      this.add_finding({
        severity: "critical",
        category: "authentication",
        file: "global",
        description: "No authentication implementation found",
        recommendation: "Implement proper authentication with session management",
      });
    }
  }

  private async audit_authorization(): Promise<void> {
    const rbac_files = this.search_files("rbac", "permission", "role", "assert");
    if (rbac_files.length === 0) {
      this.add_finding({
        severity: "critical",
        category: "authorization",
        file: "global",
        description: "No authorization/RBAC implementation found",
        recommendation: "Implement role-based access control",
      });
    }
  }

  private async audit_webhooks(): Promise<void> {
    const webhook_dir = path.join(this.sourceDir, "app", "api", "webhooks");
    if (fs.existsSync(webhook_dir)) {
      const files = this.get_files_recursive(webhook_dir);
      for (const file of files) {
        const content = fs.readFileSync(file, "utf-8");
        if (
          !content.includes("verify") &&
          !content.includes("signature") &&
          !content.includes("secret")
        ) {
          this.add_finding({
            severity: "high",
            category: "webhook",
            file: path.relative(this.sourceDir, file),
            description: "Webhook endpoint missing signature verification",
            recommendation: "Add HMAC signature verification for webhook payloads",
          });
        }
      }
    }
  }

  private async audit_file_uploads(): Promise<void> {
    const upload_files = this.search_files("upload", "file", "media");
    for (const file of upload_files) {
      if (file.endsWith("route.ts") || file.endsWith("router.ts")) {
        const content = fs.readFileSync(file, "utf-8");
        if (
          !content.includes("mime") &&
          !content.includes("MIME") &&
          !content.includes("content-type")
        ) {
          this.add_finding({
            severity: "high",
            category: "file_upload",
            file: path.relative(this.sourceDir, file),
            description: "File upload endpoint missing MIME type validation",
            recommendation: "Validate MIME types and file extensions on all uploads",
          });
        }
      }
    }
  }

  private async audit_logging(): Promise<void> {
    const logger_files = this.search_files("logger", "winston", "log");
    const content = logger_files.length > 0 ? fs.readFileSync(logger_files[0], "utf-8") : "";
    if (
      !content.includes("redact") &&
      !content.includes("REDACTED") &&
      !content.includes("sanitize")
    ) {
      this.add_finding({
        severity: "medium",
        category: "logging",
        file: logger_files[0] ? path.relative(this.sourceDir, logger_files[0]) : "global",
        description: "Logger missing redaction for sensitive data",
        recommendation: "Add log redaction to prevent secrets in logs",
      });
    }
  }

  private async audit_cors(): Promise<void> {
    const config_files = this.search_files("next.config", "cors", "CORS");
    for (const file of config_files) {
      const content = fs.readFileSync(file, "utf-8");
      if (!content.includes("Access-Control") && !content.includes("cors")) {
        this.add_finding({
          severity: "medium",
          category: "cors",
          file: path.relative(this.sourceDir, file),
          description: "No CORS configuration found",
          recommendation: "Add CORS middleware with origin allowlist",
        });
      }
    }
  }

  private async audit_export_endpoints(): Promise<void> {
    const export_files = this.search_files("export", "csv", "download");
    for (const file of export_files) {
      const content = fs.readFileSync(file, "utf-8");
      if (!content.includes("sanitize") && !content.includes("injection")) {
        this.add_finding({
          severity: "medium",
          category: "export",
          file: path.relative(this.sourceDir, file),
          description: "Export endpoint may be vulnerable to CSV injection",
          recommendation: "Add CSV injection prevention for all export endpoints",
        });
      }
    }
  }

  private search_files(...patterns: string[]): string[] {
    const results: string[] = [];
    const files = this.get_files_recursive(this.sourceDir);
    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue;
      const content = fs.readFileSync(file, "utf-8");
      const matches = patterns.some((p) => content.toLowerCase().includes(p.toLowerCase()));
      if (matches) results.push(file);
    }
    return results;
  }

  private get_files_recursive(dir: string): string[] {
    const results: string[] = [];
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory() && !entry.name.startsWith(".") && entry.name !== "node_modules") {
          results.push(...this.get_files_recursive(full));
        } else if (entry.isFile()) {
          results.push(full);
        }
      }
    } catch {
      // skip unreadable dirs
    }
    return results;
  }

  get_summary(): { total: number; critical: number; high: number } {
    return {
      total: this.findings.length,
      critical: this.findings.filter((f) => f.severity === "critical").length,
      high: this.findings.filter((f) => f.severity === "high").length,
    };
  }
}

export async function run_security_audit(sourceDir: string): Promise<AuditFinding[]> {
  const auditor = new SecurityAuditor(sourceDir);
  return auditor.run_full_audit();
}
