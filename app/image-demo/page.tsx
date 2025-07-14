'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ImageUpload } from '@/components/ui/image-upload';
import { OptimizedImage, CourseThumbnail, UserAvatar } from '@/components/ui/optimized-image';
import { getCourseImageUrl, getUserAvatarUrl, IMAGE_PATHS } from '@/lib/utils/image-utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Image as ImageIcon, User, BookOpen } from 'lucide-react';

export default function ImageDemoPage() {
  const [uploadedImages, setUploadedImages] = useState<{
    avatar?: string;
    course?: string;
    banner?: string;
  }>({});

  // Mock upload function - in a real app, this would upload to your server/cloud storage
  const handleUpload = async (file: File, type: string): Promise<string> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Create a local URL for demo purposes
    const url = URL.createObjectURL(file);
    setUploadedImages(prev => ({ ...prev, [type]: url }));
    return url;
  };

  const handleRemove = (type: string) => {
    setUploadedImages(prev => ({ ...prev, [type]: undefined }));
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Image Upload & Display Demo</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          This page demonstrates how to upload and display images in the EduLearn platform.
          You can upload images, see previews, and learn about the image management system.
        </p>
      </div>

      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Image Upload</TabsTrigger>
          <TabsTrigger value="gallery">Image Gallery</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Avatar Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  User Avatar
                </CardTitle>
                <CardDescription>
                  Upload a profile picture (recommended: 200x200px)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImage={uploadedImages.avatar}
                  onUpload={(file) => handleUpload(file, 'avatar')}
                  onRemove={() => handleRemove('avatar')}
                  placeholder="Upload avatar"
                  aspectRatio="1/1"
                  maxWidth={200}
                  maxHeight={200}
                />
              </CardContent>
            </Card>

            {/* Course Thumbnail */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Course Thumbnail
                </CardTitle>
                <CardDescription>
                  Upload a course preview image (recommended: 400x300px)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImage={uploadedImages.course}
                  onUpload={(file) => handleUpload(file, 'course')}
                  onRemove={() => handleRemove('course')}
                  placeholder="Upload course image"
                  aspectRatio="4/3"
                  maxWidth={400}
                  maxHeight={300}
                />
              </CardContent>
            </Card>

            {/* Banner Image */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5" />
                  Banner Image
                </CardTitle>
                <CardDescription>
                  Upload a banner image (recommended: 800x400px)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ImageUpload
                  currentImage={uploadedImages.banner}
                  onUpload={(file) => handleUpload(file, 'banner')}
                  onRemove={() => handleRemove('banner')}
                  placeholder="Upload banner"
                  aspectRatio="2/1"
                  maxWidth={400}
                  maxHeight={200}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gallery" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Default Images */}
            <Card>
              <CardHeader>
                <CardTitle>Default Images</CardTitle>
                <CardDescription>
                  Placeholder images used when no custom image is uploaded
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline">Default Avatar</Badge>
                  <UserAvatar
                    src={getUserAvatarUrl()}
                    alt="Default avatar"
                    size="lg"
                    className="mx-auto"
                  />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Default Course Thumbnail</Badge>
                  <CourseThumbnail
                    src={getCourseImageUrl()}
                    alt="Default course thumbnail"
                    className="w-full max-w-[300px] mx-auto"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Open Graph Images */}
            <Card>
              <CardHeader>
                <CardTitle>Open Graph Images</CardTitle>
                <CardDescription>
                  Images used for social media link previews
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Badge variant="outline">Default OG Image</Badge>
                  <OptimizedImage
                    src="/images/og/og-default.svg"
                    alt="Default Open Graph image"
                    width={300}
                    height={157}
                    className="w-full rounded-lg border"
                  />
                </div>
                <div className="space-y-2">
                  <Badge variant="outline">Square Logo</Badge>
                  <OptimizedImage
                    src="/images/og/og-square.svg"
                    alt="Square logo"
                    width={150}
                    height={150}
                    className="mx-auto rounded-lg border"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Images Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Your Uploads</CardTitle>
                <CardDescription>
                  Images you've uploaded in this session
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedImages.avatar && (
                  <div className="space-y-2">
                    <Badge variant="outline">Uploaded Avatar</Badge>
                    <UserAvatar
                      src={uploadedImages.avatar}
                      alt="Uploaded avatar"
                      size="lg"
                      className="mx-auto"
                    />
                  </div>
                )}
                {uploadedImages.course && (
                  <div className="space-y-2">
                    <Badge variant="outline">Uploaded Course Image</Badge>
                    <CourseThumbnail
                      src={uploadedImages.course}
                      alt="Uploaded course image"
                      className="w-full max-w-[300px] mx-auto"
                    />
                  </div>
                )}
                {uploadedImages.banner && (
                  <div className="space-y-2">
                    <Badge variant="outline">Uploaded Banner</Badge>
                    <OptimizedImage
                      src={uploadedImages.banner}
                      alt="Uploaded banner"
                      width={300}
                      height={150}
                      className="w-full rounded-lg"
                    />
                  </div>
                )}
                {!uploadedImages.avatar && !uploadedImages.course && !uploadedImages.banner && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No images uploaded yet. Try uploading some images in the Upload tab!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Components</CardTitle>
                <CardDescription>
                  Reusable components for different image types
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h4 className="font-semibold">UserAvatar Sizes</h4>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <UserAvatar src={getUserAvatarUrl()} alt="Small" size="sm" />
                      <p className="text-xs mt-1">Small</p>
                    </div>
                    <div className="text-center">
                      <UserAvatar src={getUserAvatarUrl()} alt="Medium" size="md" />
                      <p className="text-xs mt-1">Medium</p>
                    </div>
                    <div className="text-center">
                      <UserAvatar src={getUserAvatarUrl()} alt="Large" size="lg" />
                      <p className="text-xs mt-1">Large</p>
                    </div>
                    <div className="text-center">
                      <UserAvatar src={getUserAvatarUrl()} alt="Extra Large" size="xl" />
                      <p className="text-xs mt-1">X-Large</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Course Thumbnails</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <CourseThumbnail
                      src={getCourseImageUrl()}
                      alt="Mathematics Course"
                      className="w-full"
                    />
                    <CourseThumbnail
                      src={getCourseImageUrl()}
                      alt="Science Course"
                      className="w-full"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Image Management</CardTitle>
                <CardDescription>
                  Features and utilities for image handling
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Features</h4>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li>• Drag and drop upload</li>
                    <li>• Image validation (type, size)</li>
                    <li>• Progress tracking</li>
                    <li>• Automatic optimization</li>
                    <li>• Responsive images</li>
                    <li>• Fallback images</li>
                    <li>• Open Graph support</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold">Supported Formats</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">PNG</Badge>
                    <Badge variant="secondary">JPG</Badge>
                    <Badge variant="secondary">WebP</Badge>
                    <Badge variant="secondary">GIF</Badge>
                    <Badge variant="secondary">SVG</Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">Image Paths</h4>
                  <div className="text-sm space-y-1 font-mono bg-muted p-3 rounded">
                    <div>/images/logos/</div>
                    <div>/images/avatars/</div>
                    <div>/images/course-thumbnails/</div>
                    <div>/images/og/</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
          <CardDescription>
            How to add images to your EduLearn website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">1</div>
                <h4 className="font-semibold">Upload Images</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Place your images in the <code>/public/images/</code> directory or use the upload components.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">2</div>
                <h4 className="font-semibold">Use Components</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Import and use the optimized image components like <code>OptimizedImage</code>, <code>UserAvatar</code>, etc.
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">3</div>
                <h4 className="font-semibold">Configure Meta Tags</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Update the Open Graph images in <code>app/layout.tsx</code> for social media previews.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
