import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaChild,
  FaUserFriends,
  FaSpinner,
  FaExclamationCircle,
  FaSearch,
  FaArrowLeft,
  FaTree,
} from "react-icons/fa";
import api from "../api/axios";

export default function FamiliesList() {
  const navigate = useNavigate();
  const [families, setFamilies] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchFamilies();
  }, []);

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const response = await api.get("/families");
      setFamilies(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching families:", err);
      setError("Failed to load families");
    } finally {
      setLoading(false);
    }
  };

  const filteredFamilies = families?.families?.filter(family =>
    family.parentInfo?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading families...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <FaArrowLeft /> Subira inyuma
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-red-700 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft /> Subira inyuma
          </button>
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <FaTree className="text-white text-3xl" />
              <h1 className="text-2xl font-bold text-white">Imiryango</h1>
            </div>
            <p className="text-blue-100">
              Shakisha imiryango n'abagize umuryango
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            icon={<FaUsers className="text-blue-500 text-2xl" />}
            title="Imiryango"
            value={families?.totalFamilies || 0}
            color="blue"
          />
          <StatCard
            icon={<FaUserFriends className="text-green-500 text-2xl" />}
            title="Abagize Imiryango"
            value={families?.families?.reduce((sum, f) => sum + f.children.length, 0) || 0}
            color="green"
          />
          <StatCard
            icon={<FaChild className="text-orange-500 text-2xl" />}
            title="Impwake"
            value={families?.totalOrphans || 0}
            color="orange"
          />
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Shakisha umuryango..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Families Grid */}
        {filteredFamilies && filteredFamilies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredFamilies.map((family, idx) => (
              <FamilyCard
                key={idx}
                family={family}
                onClick={() => navigate(`/members/${family.parent._id}/family`)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaUsers className="text-gray-300 text-5xl mx-auto mb-3" />
            <p className="text-gray-500">Nta miryango yabonetse</p>
          </div>
        )}

        {/* Orphans Section */}
        {families?.orphans && families.orphans.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FaChild className="text-orange-500" />
              Impwake (Abana batagira ababyeyi)
            </h2>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {families.orphans.map((orphan) => (
                  <OrphanCard
                    key={orphan._id}
                    orphan={orphan}
                    onClick={() => navigate(`/members/${orphan._id}`)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value, color }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`text-${color}-500`}>{icon}</div>
      </div>
    </div>
  );
}

// Family Card Component
function FamilyCard({ family, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
    >
      <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-800">
          {family.parentInfo?.fullName || "Unknown Parent"}
        </h3>
        <p className="text-xs text-gray-500">
          {family.parentInfo?.category === "adult" ? "Umukuru" : "Urubyiruko"}
        </p>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Abana:</span>
          <span className="text-lg font-bold text-blue-600">{family.children.length}</span>
        </div>
        <div className="space-y-2">
          {family.children.slice(0, 3).map((child) => (
            <div key={child._id} className="flex items-center justify-between text-sm">
              <span className="text-gray-700">{child.fullName}</span>
              <span className="text-xs text-gray-500">
                {child.category === "child" ? "Umwana" :
                 child.category === "youth" ? "Urubyiruko" : "Umukuru"}
              </span>
            </div>
          ))}
          {family.children.length > 3 && (
            <p className="text-xs text-blue-600 mt-2">
              + {family.children.length - 3} abandi
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Orphan Card Component
function OrphanCard({ orphan, onClick }) {
  const getCategoryColor = (category) => {
    switch(category) {
      case "child": return "bg-green-100 text-green-700";
      case "youth": return "bg-yellow-100 text-yellow-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
          <FaChild className="text-orange-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{orphan.fullName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(orphan.category)}`}>
              {orphan.category === "child" ? "Umwana" :
               orphan.category === "youth" ? "Urubyiruko" : "Umukuru"}
            </span>
            <span className="text-xs text-gray-500">
              {orphan.gender === "male" ? "Gabo" : "Gore"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}