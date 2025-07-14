'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { OptimizedImage } from '@/components/ui/optimized-image';
import { validateImageFile } from '@/lib/utils/image-utils';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload?: (file: File) => Promise<string>;
  onRemove?: () => void;
  currentImage?: string;
  placeholder?: string;
  className?: string;
  maxWidth?: number;
  maxHeight?: number;
  aspectRatio?: string;
  disabled?: boolean;
}

export function ImageUpload({
  onUpload,
  onRemove,
  currentImage,
  placeholder = 'Click to upload an image',
  className,
  maxWidth = 400,
  maxHeight = 300,
  aspectRatio = '4/3',
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (disabled || !onUpload) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const imageUrl = await onUpload(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Reset progress after a short delay
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 500);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Upload failed');
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemove = () => {
    if (onRemove && !disabled) {
      onRemove();
      setError(null);
    }
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        {currentImage ? (
          <div className="relative group">
            <div 
              className="relative overflow-hidden"
              style={{ 
                aspectRatio,
                maxWidth: `${maxWidth}px`,
                maxHeight: `${maxHeight}px`,
              }}
            >
              <OptimizedImage
                src={currentImage}
                alt="Uploaded image"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
            {!disabled && (
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleRemove}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    <X className="h-4 w-4" />
                    Remove
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleClick}
                    className="bg-white/20 hover:bg-white/30"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'border-2 border-dashed border-muted-foreground/25 transition-colors cursor-pointer',
              'hover:border-muted-foreground/50 hover:bg-muted/50',
              isDragOver && 'border-primary bg-primary/5',
              disabled && 'cursor-not-allowed opacity-50',
              'flex flex-col items-center justify-center p-8 text-center min-h-[200px]'
            )}
            style={{ 
              aspectRatio,
              maxWidth: `${maxWidth}px`,
              maxHeight: `${maxHeight}px`,
            }}
          >
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-muted">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">
                  {isDragOver ? 'Drop image here' : placeholder}
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WebP up to 5MB
                </p>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {isUploading && (
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        {error && (
          <div className="p-4 bg-destructive/10 border-t border-destructive/20">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
