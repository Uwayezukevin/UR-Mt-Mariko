import { useState } from "react";
import { 
  FaFileAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaClock, 
  FaUsers,
  FaEdit,
  FaImage,
  FaTimes
} from "react-icons/fa";
import api from "../api/axios";

export default function EventReportView({ report, onEdit, isAdmin }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!report) return null;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
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
              <FaEdit /> Edit Report
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Statistics Cards */}
        {(report.statistics?.attendees || report.statistics?.duration || report.statistics?.location) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {report.statistics.attendees > 0 && (
              <div className="bg-blue-50 rounded-lg p-3 flex items-center gap-3">
                <FaUsers className="text-blue-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Attendees</p>
                  <p className="font-semibold">{report.statistics.attendees}</p>
                </div>
              </div>
            )}
            {report.statistics.duration && (
              <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
                <FaClock className="text-green-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Duration</p>
                  <p className="font-semibold">{report.statistics.duration}</p>
                </div>
              </div>
            )}
            {report.statistics.location && (
              <div className="bg-orange-50 rounded-lg p-3 flex items-center gap-3">
                <FaMapMarkerAlt className="text-orange-600 text-xl" />
                <div>
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="font-semibold">{report.statistics.location}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Description</h3>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">
            {report.description}
          </p>
        </div>

        {/* Summary (if exists) */}
        {report.summary && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-md font-semibold text-gray-700 mb-2">Summary</h3>
            <p className="text-gray-600">{report.summary}</p>
          </div>
        )}

        {/* Highlights */}
        {report.highlights && report.highlights.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {report.highlights.map((highlight, index) => (
                <span key={index} className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm">
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Images */}
        {report.images && report.images.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <FaImage /> Gallery
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
                    alt={image.caption || `Report image ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Image+Error'}
                  />
                  {image.caption && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 rounded-b-lg">
                      {image.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 flex justify-between">
          <span>Published: {new Date(report.publishedAt).toLocaleDateString('rw-TZ')}</span>
          {report.createdBy && <span>By: {report.createdBy.username}</span>}
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