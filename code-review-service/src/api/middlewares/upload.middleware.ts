import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }
});

export const handleMulterError = (error: any, req: any, res: any, next: any) => {
  if (error) {
    return res.status(400).json({ success: false, message: 'File upload error' });
  }
  next();
};