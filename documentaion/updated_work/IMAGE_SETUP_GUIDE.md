# EduLearn Image Management System

This guide explains how to upload and manage static images in your EduLearn website and configure social media link previews.

## 📁 Directory Structure

```
public/
├── images/
│   ├── logos/              # Brand logos and icons
│   ├── avatars/            # User profile pictures
│   ├── course-thumbnails/  # Course preview images
│   ├── og/                 # Open Graph images for social sharing
│   └── backgrounds/        # Background images
├── favicon.ico
└── manifest.json
```

## 🚀 Quick Start

### 1. Adding Static Images

1. **Place your images** in the appropriate `/public/images/` subdirectory
2. **Use absolute paths** starting with `/images/` when referencing them
3. **Supported formats**: PNG, JPG, WebP, GIF, SVG

Example:
```tsx
<img src="/images/logos/my-logo.png" alt="My Logo" />
```

### 2. Using Optimized Components

Import and use the pre-built image components:

```tsx
import { OptimizedImage, UserAvatar, CourseThumbnail } from '@/components/ui/optimized-image';

// User avatar with fallback
<UserAvatar 
  src="/images/avatars/user123.jpg" 
  alt="User Name" 
  size="lg" 
/>

// Course thumbnail with aspect ratio
<CourseThumbnail 
  src="/images/course-thumbnails/math-101.jpg" 
  alt="Mathematics 101" 
/>

// General optimized image
<OptimizedImage 
  src="/images/banners/hero.jpg" 
  alt="Hero Banner"
  width={800}
  height={400}
  priority
/>
```

### 3. Image Upload Component

For dynamic image uploads:

```tsx
import { ImageUpload } from '@/components/ui/image-upload';

<ImageUpload
  currentImage={imageUrl}
  onUpload={async (file) => {
    // Your upload logic here
    return uploadedImageUrl;
  }}
  onRemove={() => setImageUrl(null)}
  placeholder="Upload your image"
  aspectRatio="16/9"
/>
```

## 🔗 Social Media Link Previews

### Open Graph Configuration

The website is configured with Open Graph meta tags for beautiful link previews on social media platforms.

**Current Configuration** (in `app/layout.tsx`):
- **Default OG Image**: `/images/og/og-default.svg` (1200x630px)
- **Square Logo**: `/images/og/og-square.svg` (600x600px)
- **Twitter Card**: `summary_large_image`

### Customizing Link Previews

1. **Replace the default images**:
   - Create `og-default.png` (1200x630px) for general sharing
   - Create `og-square.png` (600x600px) for square previews

2. **Update metadata** in `app/layout.tsx`:
   ```tsx
   export const metadata: Metadata = {
     // ... other metadata
     openGraph: {
       images: [
         {
           url: '/images/og/your-custom-image.png',
           width: 1200,
           height: 630,
           alt: 'Your Custom Description',
         },
       ],
     },
   };
   ```

3. **Page-specific previews**:
   ```tsx
   // In any page.tsx file
   export const metadata: Metadata = {
     title: 'Specific Page Title',
     openGraph: {
       title: 'Specific Page Title',
       images: ['/images/og/page-specific-image.png'],
     },
   };
   ```

## 🛠 Utility Functions

Use the image utility functions for consistent image handling:

```tsx
import { getCourseImageUrl, getUserAvatarUrl, getImageUrl } from '@/lib/utils/image-utils';

// Get course image with fallback
const courseImage = getCourseImageUrl(course.thumbnailUrl);

// Get user avatar with fallback
const userAvatar = getUserAvatarUrl(user.avatarUrl);

// Validate uploaded file
const validation = validateImageFile(file);
if (!validation.isValid) {
  console.error(validation.error);
}
```

## 📱 Progressive Web App (PWA)

The `manifest.json` file is configured for PWA support with various icon sizes. Add your app icons:

```
public/images/logos/
├── icon-72.png
├── icon-96.png
├── icon-128.png
├── icon-144.png
├── icon-152.png
├── icon-192.png
├── icon-384.png
└── icon-512.png
```

## 🎨 Image Guidelines

### Recommended Sizes

| Type | Recommended Size | Aspect Ratio |
|------|------------------|--------------|
| **Open Graph** | 1200x630px | 1.91:1 |
| **User Avatar** | 200x200px | 1:1 |
| **Course Thumbnail** | 400x300px | 4:3 |
| **App Icons** | Multiple sizes | 1:1 |
| **Favicon** | 32x32px | 1:1 |

### Optimization Tips

1. **Use WebP format** when possible for better compression
2. **Optimize file sizes** - keep images under 500KB for web
3. **Use SVG** for logos and simple graphics
4. **Provide alt text** for accessibility
5. **Use responsive images** with appropriate `sizes` attribute

## 🎭 Demo Page

Visit `/image-demo` to see a live demonstration of:
- Image upload functionality
- Different image components
- Image gallery examples
- Interactive upload interface

## 🔧 Advanced Usage

### Custom Image Validation

```tsx
import { validateImageFile, IMAGE_UPLOAD_CONFIG } from '@/lib/utils/image-utils';

const handleFileSelect = (file: File) => {
  const validation = validateImageFile(file);
  if (!validation.isValid) {
    setError(validation.error);
    return;
  }
  // Process valid file...
};
```

### Responsive Image Sizes

```tsx
<OptimizedImage
  src="/images/hero.jpg"
  alt="Hero"
  fill
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
/>
```

### Blur Placeholder

```tsx
<OptimizedImage
  src="/images/photo.jpg"
  alt="Photo"
  width={600}
  height={400}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
/>
```

## 🚀 Deployment Checklist

Before deploying:

- [ ] Replace placeholder SVG files with actual images
- [ ] Update domain name in `app/layout.tsx` metadata
- [ ] Add favicon.ico file
- [ ] Test social media link previews
- [ ] Optimize all images for web
- [ ] Add proper app icons for PWA

## 📞 Need Help?

- Check the demo page at `/image-demo`
- Review the image utility functions in `/lib/utils/image-utils.ts`
- Look at component examples in `/components/ui/optimized-image.tsx`

---

Your EduLearn website now has a complete image management system with upload capabilities and social media link previews! 🎉
