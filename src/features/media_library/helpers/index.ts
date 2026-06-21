export {
  optimize_image,
  generate_blur_placeholder,
  strip_exif,
  validate_image_dimensions,
  is_dimension_within_limits,
  delete_variants,
  IMAGE_BREAKPOINTS,
  MAX_IMAGE_DIMENSIONS,
} from "./image-optimizer";
export type { ImageSizes, GeneratedImage, OptimizationOptions } from "./image-optimizer";

export { sanitize_svg_content } from "./svg-sanitizer";
export type { SanitizedSvgResult } from "./svg-sanitizer";

export {
  get_mime_from_magic,
  verify_file_magic,
  detect_double_extension,
  sanitize_filename,
  check_user_upload_quota,
  track_upload_quota,
  enforce_upload_rate_limit,
  has_suspicious_content,
  build_media_storage_key,
  quarantine_upload,
  UPLOAD_QUOTA,
} from "./security";
export type { FileValidationResult } from "./security";
