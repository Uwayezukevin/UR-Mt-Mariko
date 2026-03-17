import { useState } from 'react';
import { FaCloudUploadAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api/axios';

export default function ImageUploader({ onImagesUploaded, maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [error, setError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + uploadedImages.length > maxFiles) {
      setError(`Urashobora gupakira amashusho ${maxFiles} gusa`);
      return;
    }

    // Validate file types
    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Pakira amashusho gusa (jpg, png, gif, etc.)');
      return;
    }

    // Validate file size (5MB max)
    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Buri shusho igomba kuba munsi ya 5MB');
      return;
    }

    setUploading(true);
    setError('');

    const formData = new FormData();
    files.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await api.post('/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newImages = res.data.images;
      const allImages = [...uploadedImages, ...newImages];
      setUploadedImages(allImages);
      onImagesUploaded(allImages);
    } catch (err) {
      console.error(err);
      setError('Gupakira amashusho byanze. Ongera ugerageze.');
    } finally {
      setUploading(false);
      // Clear the input
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index, publicId) => {
    try {
      // Optional: Delete from Cloudinary
      await api.post('/upload/delete', { publicId });
      
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      onImagesUploaded(newImages);
    } catch (err) {
      console.error(err);
      // Still remove from UI even if delete fails
      const newImages = uploadedImages.filter((_, i) => i !== index);
      setUploadedImages(newImages);
      onImagesUploaded(newImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading || uploadedImages.length >= maxFiles}
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <FaCloudUploadAlt className="text-4xl text-blue-500" />
          <span className="text-sm font-medium text-gray-700">
            Kanda hano upakire amashusho
          </span>
          <span className="text-xs text-gray-500">
            PNG, JPG, GIF (max 5MB, {maxFiles - uploadedImages.length} asigaye)
          </span>
        </label>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {/* Uploading Indicator */}
      {uploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span className="text-sm">Birimo gupakirwa...</span>
        </div>
      )}

      {/* Image Previews */}
      {uploadedImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploadedImages.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.url}
                alt={`Uploaded ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg shadow-md"
              />
              <button
                onClick={() => handleRemoveImage(index, img.publicId)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <FaTimes className="text-xs" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}