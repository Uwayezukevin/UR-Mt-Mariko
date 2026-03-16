import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaFileAlt, FaCalendarAlt, FaArrowLeft, FaEye } from "react-icons/fa";
import api from "../api/axios";

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get("/reports");
      setReports(res.data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-6 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            <FaArrowLeft />
          </button>
          <h1 className="text-2xl font-bold text-blue-600">Raporo zose</h1>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Reports Grid */}
        {reports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Nta raporo zibonetse</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <div
                key={report._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/reports/${report._id}`)}
              >
                {report.images && report.images.length > 0 && (
                  <img
                    src={report.images[0].url}
                    alt={report.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x200?text=No+Image'}
                  />
                )}
                <div className="p-5">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">
                    {report.title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                    {report.description}
                  </p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-blue-600">
                      <FaCalendarAlt className="inline mr-1" />
                      {new Date(report.publishedAt).toLocaleDateString()}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1">
                      <FaEye /> Reba
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}