import { useState, useEffect } from "react";
import { 
  FaImage, 
  FaPlus, 
  FaTimes, 
  FaSave,
  FaFileAlt,
  FaMapMarkerAlt,
  FaClock,
  FaUsers
} from "react-icons/fa";
import api from "../api/axios";

export default function EventReportForm({ eventId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [existingReport, setExistingReport] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    summary: "",
    highlights: [],
    images: [],
    statistics: {
      attendees: "",
      duration: "",
      location: "",
    },
  });

  const [newHighlight, setNewHighlight] = useState("");
  const [imageUrls, setImageUrls] = useState([""]);

  // Check if report already exists
  useEffect(() => {
    const checkExistingReport = async () => {
      try {
        const res = await api.get(`/reports/event/${eventId}`);
        setExistingReport(res.data);
        // Populate form with existing data
        setFormData({
          title: res.data.title || "",
          description: res.data.description || "",
          summary: res.data.summary || "",
          highlights: res.data.highlights || [],
          images: res.data.images || [],
          statistics: res.data.statistics || {
            attendees: "",
            duration: "",
            location: "",
          },
        });
        if (res.data.images?.length > 0) {
          setImageUrls(res.data.images.map(img => img.url));
        }
      } catch (err) {
        // No existing report, that's fine
        console.log("No existing report");
      }
    };
    checkExistingReport();
  }, [eventId]);

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

  const handleImageUrlChange = (index, value) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);

    // Update form data
    const images = newUrls
      .filter(url => url.trim())
      .map(url => ({ url, caption: "" }));
    setFormData(prev => ({ ...prev, images }));
  };

  const handleAddImageUrl = () => {
    setImageUrls([...imageUrls, ""]);
  };

  const handleRemoveImageUrl = (index) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    
    const images = newUrls
      .filter(url => url.trim())
      .map(url => ({ url, caption: "" }));
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
      setError(err.response?.data?.message || "Error saving report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-blue-600 mb-4 flex items-center gap-2">
        <FaFileAlt />
        {existingReport ? "Edit Event Report" : "Create Event Report"}
      </h2>

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
          <FaCheckCircle className="text-green-500 text-lg flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">
              Report saved successfully!
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
            Report Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="e.g., Christmas Celebration 2024 Report"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="4"
            placeholder="Write a detailed description of the event..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Summary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Summary
          </label>
          <textarea
            name="summary"
            value={formData.summary}
            onChange={handleChange}
            rows="2"
            placeholder="Brief summary of the event..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaUsers className="inline mr-1" /> Attendees
            </label>
            <input
              type="number"
              name="statistics.attendees"
              value={formData.statistics.attendees}
              onChange={handleChange}
              placeholder="Number of attendees"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaClock className="inline mr-1" /> Duration
            </label>
            <input
              type="text"
              name="statistics.duration"
              value={formData.statistics.duration}
              onChange={handleChange}
              placeholder="e.g., 2 hours, 3 days"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FaMapMarkerAlt className="inline mr-1" /> Location
            </label>
            <input
              type="text"
              name="statistics.location"
              value={formData.statistics.location}
              onChange={handleChange}
              placeholder="Event location"
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Highlights */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Highlights
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newHighlight}
              onChange={(e) => setNewHighlight(e.target.value)}
              placeholder="Add a highlight..."
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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <FaImage className="inline mr-1" /> Images (Image URLs)
          </label>
          {imageUrls.map((url, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="url"
                value={url}
                onChange={(e) => handleImageUrlChange(index, e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {imageUrls.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveImageUrl(index)}
                  className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                >
                  <FaTimes />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddImageUrl}
            className="mt-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            + Add another image
          </button>
        </div>

        {/* Image Previews */}
        {formData.images.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image Previews
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

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
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FaSave />
                <span>{existingReport ? "Update Report" : "Save Report"}</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}