import { supabase } from './client';

const BUCKET_NAME = 'question-images';

// Upload image
export async function uploadImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(fileName);

  return publicUrl;
}

// Upload multiple images
export async function uploadImages(files: File[], userId: string): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadImage(file, userId));
  return Promise.all(uploadPromises);
}

// Delete image
export async function deleteImage(url: string): Promise<void> {
  // Extract file path from URL
  const urlParts = url.split(`${BUCKET_NAME}/`);
  if (urlParts.length < 2) throw new Error('Invalid image URL');

  const filePath = urlParts[1];

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) throw error;
}

// Delete multiple images
export async function deleteImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url));
  await Promise.all(deletePromises);
}

// Create storage bucket (run once during setup)
export async function createImageBucket() {
  const { error } = await supabase.storage.createBucket(BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5242880, // 5MB
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'],
  });

  if (error && error.message !== 'Bucket already exists') {
    throw error;
  }
}
