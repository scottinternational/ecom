import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  path: string;
  url: string;
  error?: string;
}

export class StorageService {
  private static BUCKET_NAME = 'product_suggestions';

  /**
   * Upload a file to Supabase storage
   */
  static async uploadFile(
    file: File,
    path: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<UploadResult> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .upload(path, file, {
          cacheControl: options?.cacheControl || '3600',
          upsert: options?.upsert || false,
        });

      if (error) {
        console.error('Upload error:', error);
        return { path: '', url: '', error: error.message };
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(path);

      return {
        path: data.path,
        url: urlData.publicUrl,
      };
    } catch (error) {
      console.error('Storage upload error:', error);
      return {
        path: '',
        url: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Upload multiple files to Supabase storage
   */
  static async uploadMultipleFiles(
    files: File[],
    basePath: string = 'uploads'
  ): Promise<UploadResult[]> {
    console.log(`StorageService: Starting upload of ${files.length} files to bucket '${this.BUCKET_NAME}'`);
    
    const uploadPromises = files.map(async (file, index) => {
      const timestamp = Date.now();
      const fileName = `${timestamp}_${index}_${file.name}`;
      const path = `${basePath}/${fileName}`;
      
      console.log(`StorageService: Uploading file ${index + 1}/${files.length}: ${file.name} to path: ${path}`);
      
      return this.uploadFile(file, path);
    });

    return Promise.all(uploadPromises);
  }

  /**
   * Delete a file from Supabase storage
   */
  static async deleteFile(path: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove([path]);

      if (error) {
        console.error('Delete error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Storage delete error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Delete multiple files from Supabase storage
   */
  static async deleteMultipleFiles(paths: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .remove(paths);

      if (error) {
        console.error('Delete multiple error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      console.error('Storage delete multiple error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get a public URL for a file
   */
  static getPublicUrl(path: string): string {
    const { data } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * List files in a directory
   */
  static async listFiles(path: string = ''): Promise<{ name: string; url: string }[]> {
    try {
      const { data, error } = await supabase.storage
        .from(this.BUCKET_NAME)
        .list(path);

      if (error) {
        console.error('List error:', error);
        return [];
      }

      return data.map(file => ({
        name: file.name,
        url: this.getPublicUrl(`${path}/${file.name}`),
      }));
    } catch (error) {
      console.error('Storage list error:', error);
      return [];
    }
  }

  /**
   * Generate a unique file path
   */
  static generateFilePath(file: File, prefix: string = 'product-images'): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 15);
    const extension = file.name.split('.').pop();
    return `${prefix}/${timestamp}_${randomId}.${extension}`;
  }
}
