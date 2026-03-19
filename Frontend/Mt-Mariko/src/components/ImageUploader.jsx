import { useState, useEffect } from 'react';
import { FaCloudUploadAlt, FaTimes, FaSpinner } from 'react-icons/fa';
import api from '../api/axios';

export default function ImageUploader({ onImagesUploaded, initialImages = [], maxFiles = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState(initialImages);
  const [error, setError] = useState('');

  useEffect(() => {
    setUploadedImages(initialImages);
  }, [initialImages]);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + uploadedImages.length > maxFiles) {
      setError(`Ushobora gushyiramo amafoto ${maxFiles} gusa`);
      return;
    }

    const invalidFiles = files.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Shyiramo amafoto gusa (jpg, png, gif, etc.)');
      return;
    }

    const oversizedFiles = files.filter(file => file.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      setError('Buri foto igomba kuba munsi ya 5MB');
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
      setError('Gushyiramo amafoto byanze. Ongera ugerageze.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveImage = async (index) => {
    const imageToRemove = uploadedImages[index];
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    onImagesUploaded(newImages);

    if (imageToRemove.publicId) {
      try {
        await api.post('/upload/delete', { publicId: imageToRemove.publicId });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-4">
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
            Kanda hano ushiremo amafoto
          </span>
          <span className="text-xs text-gray-500">
            PNG, JPG, GIF (max 5MB, {maxFiles - uploadedImages.length} asigaye)
          </span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
          {error}
        </p>
      )}

      {uploading && (
        <div className="flex items-center gap-2 text-blue-600">
          <FaSpinner className="animate-spin" />
          <span className="text-sm">Birimo gukorwa...</span>
        </div>
      )}

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
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                type="button"
              >
                <FaTimes className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}