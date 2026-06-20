import "server-only";

import { writeFile, mkdir } from "fs/promises";
import path from "path";

const FILE_SIGNATURES: Record<string, Uint8Array[]> = {
  "image/jpeg": [new Uint8Array([0xff, 0xd8, 0xff])],
  "image/png": [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  "image/webp": [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  "image/gif": [new Uint8Array([0x47, 0x49, 0x46, 0x38])],
  "image/avif": [new Uint8Array([0x00, 0x00, 0x00])],
  "application/pdf": [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
};

export async function inspect_file_content(
  buffer: Uint8Array,
  expected_mime: string,
): Promise<boolean> {
  const signatures = FILE_SIGNATURES[expected_mime];
  if (!signatures) return true;
  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  });
}

const EXECUTABLE_PATTERNS = [
  /\.(exe|dll|bat|cmd|sh|bin|msi|jar|py|pl|rb|wasm)$/i,
  /^#!/.exec.bind(null),
];

export function is_executable_content(buffer: Uint8Array): boolean {
  const header = new TextDecoder().decode(buffer.slice(0, 100));
  if (header.startsWith("#!")) return true;
  return false;
}

export function is_image_file(buffer: Uint8Array): boolean {
  const signatures = [
    new Uint8Array([0xff, 0xd8, 0xff]),
    new Uint8Array([0x89, 0x50, 0x4e, 0x47]),
    new Uint8Array([0x52, 0x49, 0x46, 0x46]),
    new Uint8Array([0x47, 0x49, 0x46, 0x38]),
  ];
  return signatures.some((sig) => {
    if (buffer.length < sig.length) return false;
    return sig.every((byte, i) => buffer[i] === byte);
  });
}

export async function secure_store_file(
  buffer: Uint8Array,
  storage_path: string,
  filename: string,
): Promise<string> {
  const safe_filename = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.\./g, "");
  const target_dir = path.resolve(storage_path);
  const filepath = path.join(target_dir, safe_filename);

  if (!filepath.startsWith(target_dir)) {
    throw new Error("Path traversal detected");
  }

  await mkdir(target_dir, { recursive: true });
  await writeFile(filepath, buffer);
  return filepath;
}

export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  mime_type?: string;
  extension?: string;
  is_image: boolean;
}
