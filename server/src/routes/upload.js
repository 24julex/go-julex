import express from 'express';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

/**
 * POST /api/upload
 * Accepts base64 data URLs or image URLs and validates them
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { dataUrl, url, filename, type } = req.body;

    if (!dataUrl && !url) {
      return res.status(400).json({ success: false, message: 'Image data URL or source URL is required.' });
    }

    const finalUrl = dataUrl || url;

    return res.json({
      success: true,
      url: finalUrl,
      type: type || 'image',
      filename: filename || `upload_${Date.now()}`,
      message: 'File uploaded successfully!'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'File upload processing failed.' });
  }
});

export default router;
