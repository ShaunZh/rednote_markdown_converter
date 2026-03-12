export type ImageUploadMode = 'local' | 'cloudinary';

const STORAGE_KEY = 'rednote-image-upload-mode';

export function normalizeImageUploadMode(value: string | null | undefined): ImageUploadMode {
  return value === 'cloudinary' ? 'cloudinary' : 'local';
}

export function getStoredImageUploadMode(): ImageUploadMode {
  if (typeof window === 'undefined') {
    return 'local';
  }

  try {
    return normalizeImageUploadMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return 'local';
  }
}

export function setStoredImageUploadMode(mode: ImageUploadMode): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Ignore localStorage failures and keep the in-memory mode.
  }
}
