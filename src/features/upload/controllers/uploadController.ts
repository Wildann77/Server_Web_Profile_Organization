import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../services/cloudinaryService';
import { createSuccessResponse } from '@/shared/lib/response';
import { AppError, ErrorCode } from '@/shared/errors/AppError';

export class UploadController {
  // Upload image
  async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(
          'Tidak ada file yang diupload',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const result = await cloudinaryService.uploadImage(
        req.file.buffer,
        'web-profil-organisasi/articles',
        req.file.originalname
      );

      res.json(
        createSuccessResponse(result, 'Gambar berhasil diupload')
      );
    } catch (error) {
      next(error);
    }
  }

  // Upload thumbnail
  async uploadThumbnail(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError(
          'Tidak ada file yang diupload',
          400,
          ErrorCode.VALIDATION_ERROR
        );
      }

      const result = await cloudinaryService.uploadImage(
        req.file.buffer,
        'web-profil-organisasi/thumbnails',
        req.file.originalname
      );

      res.json(
        createSuccessResponse(result, 'Thumbnail berhasil diupload')
      );
    } catch (error) {
      next(error);
    }
  }

  // Delete image
  async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicId } = req.params;
      
      await cloudinaryService.deleteImage(publicId);

      res.json(
        createSuccessResponse(null, 'Gambar berhasil dihapus')
      );
    } catch (error) {
      next(error);
    }
  }
}

export const uploadController = new UploadController();
