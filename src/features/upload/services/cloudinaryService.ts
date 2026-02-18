import { v2 as cloudinary } from 'cloudinary';
import { AppError, ErrorCode } from '@/shared/errors/AppError';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  publicId: string;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

export class CloudinaryService {
  // Upload image buffer to Cloudinary
  async uploadImage(
    fileBuffer: Buffer,
    folder: string = 'web-profil-organisasi',
    originalName?: string
  ): Promise<UploadResult> {
    try {
      const result = await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            use_filename: true,
            unique_filename: true,
            overwrite: false,
            quality: 'auto',
            fetch_format: 'auto',
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        );

        uploadStream.end(fileBuffer);
      });

      return {
        publicId: result.public_id,
        url: result.url,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new AppError(
        'Gagal mengupload gambar',
        500,
        ErrorCode.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  // Delete image from Cloudinary
  async deleteImage(publicId: string): Promise<void> {
    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new AppError(
        'Gagal menghapus gambar',
        500,
        ErrorCode.EXTERNAL_SERVICE_ERROR
      );
    }
  }

  // Get optimized image URL
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      crop?: string;
    } = {}
  ): string {
    const { width, height, crop = 'fill' } = options;

    return cloudinary.url(publicId, {
      transformation: [
        { quality: 'auto', fetch_format: 'auto' },
        ...(width || height ? [{ width, height, crop }] : []),
      ],
      secure: true,
    });
  }
}

export const cloudinaryService = new CloudinaryService();
