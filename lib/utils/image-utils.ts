/**
 * Image utility functions for the EduLearn platform
 */

// Image paths configuration
export const IMAGE_PATHS = {
  LOGOS: '/images/logos',
  AVATARS: '/images/avatars',
  COURSE_THUMBNAILS: '/images/course-thumbnails',
  OG_IMAGES: '/images/og',
  BACKGROUNDS: '/images/backgrounds',
} as const;

// Default images
export const DEFAULT_IMAGES = {
  USER_AVATAR: '/images/avatars/default-avatar.svg',
  COURSE_THUMBNAIL: '/images/course-thumbnails/default-course.svg',
  LOGO: '/images/logos/edulearn-logo.svg',
  OG_DEFAULT: '/images/og/og-default.svg',
} as const;

/**
 * Get optimized image URL with proper path
 */
export function getImageUrl(path: string): string {
  // Handle absolute URLs (external images)
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  
  // Handle relative paths
  if (!path.startsWith('/')) {
    return `/${path}`;
  }
  
  return path;
}

/**
 * Get course thumbnail URL with fallback
 */
export function getCourseImageUrl(imagePath?: string | null): string {
  if (!imagePath) {
    return DEFAULT_IMAGES.COURSE_THUMBNAIL;
  }
  return getImageUrl(imagePath);
}

/**
 * Get user avatar URL with fallback
 */
export function getUserAvatarUrl(avatarPath?: string | null): string {
  if (!avatarPath) {
    return DEFAULT_IMAGES.USER_AVATAR;
  }
  return getImageUrl(avatarPath);
}

/**
 * Generate blur data URL for placeholder
 */
export function generateBlurDataURL(width: number = 8, height: number = 8): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return '';
  
  // Create a simple gradient blur effect
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL();
}

/**
 * Image upload configuration
 */
export const IMAGE_UPLOAD_CONFIG = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
} as const;

/**
 * Validate image file
 */
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }
  
  if (file.size > IMAGE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return { isValid: false, error: 'File size too large (max 5MB)' };
  }
  
  if (!(IMAGE_UPLOAD_CONFIG.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return { isValid: false, error: 'Invalid file type. Only JPG, PNG, WebP, and GIF are allowed.' };
  }
  
  return { isValid: true };
}

/**
 * Get responsive image sizes for different breakpoints
 */
export const RESPONSIVE_SIZES = {
  AVATAR: '(max-width: 768px) 32px, 48px',
  COURSE_CARD: '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
  HERO: '100vw',
  THUMBNAIL: '(max-width: 768px) 100vw, 300px',
} as const;
