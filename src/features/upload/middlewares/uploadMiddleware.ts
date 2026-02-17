import multer from 'multer';
import { Request } from 'express';
import { AppError, ErrorCode } from '@/shared/errors/AppError';

// Configure multer for memory storage
const storage = multer.memoryStorage();

// File filter for images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Accept only image files
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        'Format file tidak didukung. Gunakan JPEG, PNG, GIF, atau WebP',
        400,
        ErrorCode.VALIDATION_ERROR
      )
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1, // Only 1 file per request
  },
});

// Error handler for multer
export const handleUploadError = (error: any, req: Request, res: any, next: any) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'Ukuran file terlalu besar. Maksimal 5MB',
        error: { code: ErrorCode.VALIDATION_ERROR },
        timestamp: new Date().toISOString(),
      });
    }
    
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Terlalu banyak file. Maksimal 1 file',
        error: { code: ErrorCode.VALIDATION_ERROR },
        timestamp: new Date().toISOString(),
      });
    }
  }
  
  next(error);
};
