import { useState, useEffect } from "react";
import {
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaCalendarAlt,
  FaPhone,
  FaIdBadge,
  FaVenusMars,
  FaLayerGroup,
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateMember() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    category: "",
    nationalId: "",
    dateOfBirth: "",
    phone: "",
    parent: "",
    gender: "",
    subgroup: "",
    sakraments: [],
  });

  const [parents, setParents] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [sakraments, setSakraments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, sakRes, parentRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        setSubgroups(subRes.data);
        setSakraments(sakRes.data);

        // Only adults as possible parents
        const adults = parentRes.data.filter(
          (member) => member.category === "adult",
        );
        setParents(adults);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && value !== "child" ? { parent: "" } : {}),
    }));
  };

  // Toggle sakraments
  const handleSakramentToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      sakraments: prev.sakraments.includes(id)
        ? prev.sakraments.filter((s) => s !== id)
        : [...prev.sakraments, id],
    }));
  };

  // Submit form
  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Prepare payload
      const payload = {
        fullName: formData.fullName,
        category: formData.category,
        gender: formData.gender,
        // Only include optional fields if they have a value
        ...(formData.nationalId ? { nationalId: formData.nationalId } : {}),
        ...(formData.dateOfBirth ? { dateOfBirth: formData.dateOfBirth } : {}),
        ...(formData.phone ? { phone: formData.phone } : {}),
        ...(formData.category === "child" && formData.parent
          ? { parent: formData.parent }
          : {}),
        ...(formData.subgroup ? { subgroup: formData.subgroup } : {}),
        ...(formData.sakraments.length > 0
          ? { sakraments: formData.sakraments }
          : {}),
      };

      await api.post("/members", payload);
      navigate("/members");
    } catch (err) {
      console.error(err.response?.data || err);

      const message =
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        err.response?.data?.message ||
        "Member creation failed";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 relative">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft /> Back
        </button>

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Create Member
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category */}
          <div className="relative">
            <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Category</option>
              <option value="child">Child</option>
              <option value="youth">Youth</option>
              <option value="adult">Adult</option>
            </select>
          </div>

          {/* Parent */}
          {formData.category === "child" && (
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <select
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Parent</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* National ID */}
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="nationalId"
              placeholder="National ID"
              value={formData.nationalId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date of Birth */}
          <div className="relative">
            <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Gender */}
          <div className="relative">
            <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          {/* Subgroup */}
          <div className="relative">
            <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="subgroup"
              value={formData.subgroup}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Subgroup</option>
              {subgroups.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sakraments */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">Sakraments:</p>
            <div className="flex flex-wrap gap-2">
              {sakraments.map((s) => (
                <button
                  type="button"
                  key={s._id}
                  onClick={() => handleSakramentToggle(s._id)}
                  className={`px-3 py-1 rounded border ${
                    formData.sakraments.includes(s._id)
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700"
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Creating member..." : "Create Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
