import { useState, useEffect } from "react";
import { 
  FaImage, 
  FaPlus, 
  FaTimes, 
  FaSave,
  FaFileAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import api from "../api/axios";
import ImageUploader from "./ImageUploader";

export default function EventReportForm({ eventId, onSuccess, onCancel, existingReport }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [],
  });

  // Initialize form with existing report data if provided
  useEffect(() => {
    if (existingReport) {
      setFormData({
        title: existingReport.title || "",
        description: existingReport.description || "",
        images: existingReport.images || [],
      });
    }
  }, [existingReport]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImagesUploaded = (images) => {
    setFormData(prev => ({ ...prev, images }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        eventId,
        title: formData.title,
        description: formData.description,
        images: formData.images,
      };

      if (existingReport) {
        // Update existing report
        await api.put(`/reports/${existingReport._id}`, payload);
      } else {
        // Create new report
        await api.post("/reports", payload);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Kubika raporo byanze");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
        <FaFileAlt />
        {existingReport ? "Hindura Raporo" : "Ongeraho Raporo"}
      </h2>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
          <FaCheckCircle className="text-green-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">
              Raporo yabitswe neza!
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
          <FaExclamationCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Umutwe wa Raporo <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Urugero: Raporo y'Umuhango wa Noheli 2024"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ibisobanuro <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Andika ibisobanuro birambuye ku gikorwa..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaImage className="inline mr-1" /> Amashusho
          </label>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
            initialImages={formData.images}
            maxFiles={10}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Birimo kubika...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{existingReport ? "Hindura Raporo" : "Bika Raporo"}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Gusiba
          </button>
        </div>
      </form>
    </div>
  );
}