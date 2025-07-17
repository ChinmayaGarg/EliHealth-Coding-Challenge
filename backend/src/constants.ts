export const MAX_IMAGE_SIZE_BYTES = 500 * 1024; // 500 KB
export const MAX_WIDTH = 10000;
export const MAX_HEIGHT = 10000;
export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i; // UUID v4 validation regex (case-insensitive)
export const FILENAME_REGEX = /^[a-zA-Z0-9._-]+\.(jpg|jpeg|png)$/i; // Simple filename validation to avoid path traversal (e.g., "../../../etc/passwd")