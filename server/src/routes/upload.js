import express from 'express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { requireMerchantAdmin } from '../middleware/auth.js';

const router = express.Router();
export const uploadDir = process.env.UPLOAD_DIR || path.resolve(process.cwd(), 'uploads');
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_VIDEO_BYTES = 60 * 1024 * 1024;

const imageType = (bytes) => {
  if (bytes.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return 'jpg';
  if (bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return 'png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'webp';
  return null;
};

const videoType = (bytes) => {
  if (bytes.subarray(4, 8).toString() === 'ftyp') {
    const brand = bytes.subarray(8, 12).toString().toLowerCase();
    if (brand.startsWith('mp4') || brand.startsWith('isom') || brand.startsWith('iso2') || brand.startsWith('avc1') || brand.startsWith('mmp4')) return 'mp4';
  }
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBM') return 'webm';
  if (bytes.subarray(0, 4).toString() === '1A45DFA3') return 'webm'; // EBML header (matroska/webm)
  return null;
};

router.post('/', requireMerchantAdmin, async (req, res) => {
  try {
    const dataUrl = String(req.body?.dataUrl || '');
    // VIDEOS (mp4 / webm, ≤60 MB) — stored on disk and served from /api/uploads
    const vMatch = /^data:video\/(mp4|webm|quicktime|x-matroska);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (vMatch) {
      if (vMatch[2].length > MAX_VIDEO_BYTES * 4 / 3 + 8) return res.status(413).json({ success: false, message: 'Video must be smaller than 60 MB.' });
      const bytes = Buffer.from(vMatch[2], 'base64');
      const extension = videoType(bytes) || (vMatch[1] === 'quicktime' ? 'mov' : vMatch[1] === 'x-matroska' ? 'webm' : vMatch[1]);
      await mkdir(uploadDir, { recursive: true });
      const name = `${req.tenantId || 'platform'}-${randomUUID()}.${extension}`;
      await writeFile(path.join(uploadDir, name), bytes, { flag: 'wx' });
      return res.status(201).json({ success: true, url: `/api/uploads/${name}`, filename: name, type: 'video', message: 'Video uploaded.' });
    }
    const match = /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl);
    if (!match) return res.status(400).json({ success: false, message: 'Upload a JPEG, PNG, or WebP image, or an MP4/WebM video.' });
    if (match[2].length > MAX_IMAGE_BYTES * 4 / 3 + 8) return res.status(413).json({ success: false, message: 'Image must be smaller than 5 MB.' });
    const bytes = Buffer.from(match[2], 'base64');
    const extension = imageType(bytes);
    if (!extension || bytes.length > MAX_IMAGE_BYTES) return res.status(400).json({ success: false, message: 'Invalid or oversized image.' });
    await mkdir(uploadDir, { recursive: true });
    const name = `${req.tenantId || 'platform'}-${randomUUID()}.${extension}`;
    await writeFile(path.join(uploadDir, name), bytes, { flag: 'wx' });
    return res.status(201).json({ success: true, url: `/api/uploads/${name}`, filename: name, type: 'image', message: 'Image uploaded.' });
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ success: false, message: 'Could not store image.' });
  }
});

export default router;
