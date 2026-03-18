import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaFileAlt, 
  FaCalendarAlt, 
  FaImage,
  FaTimes
} from "react-icons/fa";
import api from "../api/axios";

export default function ReportDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports/${id}`);
      setReport(res.data);
    } catch (err) {
      console.error(err);
      setError("Ntibyashoboye gupakira raporo");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Raporo ntiyabonetse"}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Subira Inyuma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <FaArrowLeft /> Subira Inyuma
        </button>

        {/* Report Content */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-8">
            <h1 className="text-2xl font-bold text-white mb-2">{report.title}</h1>
            <p className="text-purple-100">
              <FaCalendarAlt className="inline mr-2" />
              {new Date(report.createdAt || report.publishedAt).toLocaleDateString('rw-TZ', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>

          {/* Description */}
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Ibisobanuro</h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
          </div>

          {/* Images */}
          {report.images && report.images.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <FaImage /> Amashusho
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {report.images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group cursor-pointer"
                    onClick={() => setSelectedImage(image.url)}
                  >
                    <img
                      src={image.url}
                      alt={`Image ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg shadow-md group-hover:shadow-xl transition-all"
                      onError={(e) => e.target.src = 'https://via.placeholder.com/300x200?text=Error'}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
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
    </div>
  );
}