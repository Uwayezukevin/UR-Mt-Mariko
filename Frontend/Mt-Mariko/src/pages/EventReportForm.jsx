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
import ImageUploader from "./ImageUploader"; // Import the new component

export default function EventReportForm({ eventId, onSuccess, onCancel, existingReport }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: existingReport?.title || "",
    description: existingReport?.description || "",
    summary: existingReport?.summary || "",
    highlights: existingReport?.highlights || [],
    images: existingReport?.images || [],
    statistics: {
      attendees: existingReport?.statistics?.attendees || "",
      duration: existingReport?.statistics?.duration || "",
      location: existingReport?.statistics?.location || "",
    },
  });

  const [newHighlight, setNewHighlight] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("statistics.")) {
      const statName = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          [statName]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddHighlight = () => {
    if (newHighlight.trim()) {
      setFormData(prev => ({
        ...prev,
        highlights: [...prev.highlights, newHighlight.trim()]
      }));
      setNewHighlight("");
    }
  };

  const handleRemoveHighlight = (index) => {
    setFormData(prev => ({
      ...prev,
      highlights: prev.highlights.filter((_, i) => i !== index)
    }));
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
        summary: formData.summary,
        highlights: formData.highlights,
        images: formData.images,
        statistics: {
          attendees: formData.statistics.attendees ? parseInt(formData.statistics.attendees) : 0,
          duration: formData.statistics.duration,
          location: formData.statistics.location,
        },
      };

      if (existingReport) {
        await api.put(`/reports/${existingReport._id}`, payload);
      } else {
        await api.post("/reports", payload);
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Error saving report");
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

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mu ncamake
          </label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="2"
            placeholder="Incamake y'igikorwa..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUsers className="inline mr-1" /> Ababitabiriye
            </label>
            <input
              type="number"
              name="statistics.attendees"
              value={formData.statistics.attendees}
              onChange={handleChange}
              placeholder="Umubare"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-1" /> Igihe
            </label>
            <input
              type="text"
              name="statistics.duration"
              value={formData.statistics.duration}
              onChange={handleChange}
              placeholder="Urugero: amasaha 2, iminsi 3"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaMapMarkerAlt className="inline mr-1" /> Ahakorewe
            </label>
            <input
              type="text"
              name="statistics.location"
              value={formData.statistics.location}
              onChange={handleChange}
              placeholder="Aho byabereye"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ibikomeye
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="Ongeraho ikintu cy'ingenzi..."
              className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
            />
            <button
              type="button"
              onClick={handleAddHighlight}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FaPlus />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.highlights.map((highlight, index) => (
              <div key={index} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full flex items-center gap-2">
                <span className="text-sm">{highlight}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveHighlight(index)}
                  className="text-blue-700 hover:text-blue-900"
                >
                  <FaTimes className="text-xs" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Image Uploader */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaImage className="inline mr-1" /> Amashusho
          </label>
          <ImageUploader
            onImagesUploaded={handleImagesUploaded}
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