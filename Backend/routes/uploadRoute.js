import express from 'express';
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../config/cloudinary.js';

const uploadRoutes = express.Router();

// Upload single image
uploadRoutes.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      success: true,
      url: req.file.path,
      publicId: req.file.filename,
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: err.message 
    });
  }
});

// Upload multiple images
uploadRoutes.post('/images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No files uploaded' 
      });
    }

    const images = req.files.map(file => ({
      url: file.path,
      publicId: file.filename,
    }));

    res.json({ 
      success: true,
      images 
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Upload failed',
      error: err.message 
    });
  }
});

// Delete image
uploadRoutes.post('/delete', async (req, res) => {
  try {
    const { publicId } = req.body;

    if (!publicId) {
      return res.status(400).json({ 
        success: false,
        message: "publicId is required" 
      });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      res.json({ 
        success: true,
        message: 'Image deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false,
        message: 'Image not found or already deleted' 
      });
    }
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Delete failed',
      error: err.message 
    });
  }
});

export default uploadRoutes;