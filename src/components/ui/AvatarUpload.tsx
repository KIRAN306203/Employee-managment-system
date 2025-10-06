import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  onAvatarChange: (url: string | null) => void;
  userId?: string;
  size?: "sm" | "md" | "lg";
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  onAvatarChange,
  userId,
  size = "md",
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentAvatarUrl || null);

  const sizeClasses = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32",
  };

  const uploadAvatar = async (file: File) => {
    if (!userId) {
      toast.error("User ID is required for avatar upload");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = data.publicUrl;
      setPreviewUrl(publicUrl);
      onAvatarChange(publicUrl);

      toast.success("Avatar uploaded successfully");
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const err = error as any;
      toast.error("Failed to upload avatar", {
        description: err.message,
      });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      uploadAvatar(file);
    }
  }, [userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    multiple: false,
    disabled: uploading,
  });

  const removeAvatar = async () => {
    if (previewUrl && previewUrl !== currentAvatarUrl) {
      // If it's a new upload, try to delete from storage
      try {
        const fileName = previewUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([`avatars/${fileName}`]);
        }
      } catch (error) {
        // Ignore deletion errors
      }
    }

    setPreviewUrl(null);
    onAvatarChange(null);
    toast.success("Avatar removed");
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="relative">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage src={previewUrl || undefined} alt="Avatar" />
          <AvatarFallback>
            <User className="h-8 w-8" />
          </AvatarFallback>
        </Avatar>

        {previewUrl && (
          <Button
            variant="destructive"
            size="sm"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
            onClick={removeAvatar}
            disabled={uploading}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50'
        } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          {uploading
            ? "Uploading..."
            : isDragActive
            ? "Drop the image here"
            : "Click to upload or drag and drop"
          }
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PNG, JPG, GIF up to 5MB
        </p>
      </div>
    </div>
  );
};
