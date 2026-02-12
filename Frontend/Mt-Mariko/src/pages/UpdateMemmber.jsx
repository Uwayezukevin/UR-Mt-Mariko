import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaUser, FaPhone, FaCalendar, FaUsers,FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";

export default function UpdateMember() {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    category: "",
    nationalId: "",
    dateOfBirth: "",
    phone: "",
    parent: "",
    subgroup: "",
    sakraments: [],
  });

  const [parents, setParents] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [sakraments, setSakraments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, subRes, sakRes, membersRes] = await Promise.all([
          api.get(`/members/${memberId}`),
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        const m = memberRes.data;

        setFormData({
          fullName: m.fullName ?? "",
          category: m.category ?? "",
          nationalId: m.nationalId ?? "",
          dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
          phone: m.phone ?? "",
          parent: m.parent?._id || m.parent || "",
          subgroup: m.subgroup?._id || m.subgroup || "",
          sakraments: Array.isArray(m.sakraments)
            ? m.sakraments.map((s) => s._id || s)
            : [],
        });

        setSubgroups(subRes.data);
        setSakraments(sakRes.data);

        // parents = adults only, not self
        setParents(
          membersRes.data.filter(
            (p) => p.category === "adult" && p._id !== memberId,
          ),
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load member data");
      }
    };

    fetchData();
  }, [memberId]);

  // ================= HANDLERS =================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSakramentToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      sakraments: prev.sakraments.includes(id)
        ? prev.sakraments.filter((s) => s !== id)
        : [...prev.sakraments, id],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.put(`/members/${memberId}`, formData);
      navigate("/members");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update member");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <FaArrowLeft /> Back
      </button>
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Update Member
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
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>

          {/* Category (locked) */}
          <div className="relative">
            <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              value={formData.category}
              disabled
              className="w-full pl-10 pr-4 py-3 border rounded-lg bg-gray-100"
            >
              <option value="child">Child</option>
              <option value="youth">Youth</option>
              <option value="adult">Adult</option>
            </select>
          </div>

          {/* Parent */}
          {formData.category === "child" && (
            <select
              name="parent"
              value={formData.parent}
              onChange={handleChange}
              required
              className="w-full pl-3 pr-4 py-3 border rounded-lg"
            >
              <option value="">Select Parent</option>
              {parents.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.fullName}
                </option>
              ))}
            </select>
          )}

          {/* Date of Birth */}
          <div className="relative">
            <FaCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>

          {/* Subgroup */}
          <select
            name="subgroup"
            value={formData.subgroup}
            onChange={handleChange}
            className="w-full pl-3 pr-4 py-3 border rounded-lg"
          >
            <option value="">Select Subgroup</option>
            {subgroups.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Sakraments */}
          <div className="grid grid-cols-2 gap-2 border p-3 rounded">
            {sakraments.map((s) => (
              <label key={s._id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.sakraments.includes(s._id)}
                  onChange={() => handleSakramentToggle(s._id)}
                />
                {s.name}
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg"
          >
            {loading ? "Updating..." : "Update Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
