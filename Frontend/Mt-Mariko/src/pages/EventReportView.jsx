import { useState } from "react";
import { 
  FaFileAlt, 
  FaEdit,
  FaImage,
  FaTimes
} from "react-icons/fa";

export default function EventReportView({ report, onEdit, isAdmin }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!report) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FaFileAlt />
            {report.title}
          </h2>
          {isAdmin && (
            <button
              onClick={onEdit}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
            >
              <FaEdit /> Hindura
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Ibisobanuro</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {report.description}
          </p>
        </div>

        {/* Images */}
        {report.images && report.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaImage /> Amashusho
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {report.images.map((image, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedImage(image.url)}
                >
                  <img
                    src={image.url}
                    alt={`Report image ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Error'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500">
          <span>Yanditswe: {new Date(report.createdAt || report.publishedAt).toLocaleDateString('rw-TZ')}</span>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300"
            onClick={() => setSelectedImage(null)}
          >
            <FaTimes />
          </button>
          <img
            src={selectedImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}