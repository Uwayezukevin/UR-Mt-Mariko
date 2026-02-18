import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaCalendar,
  FaUsers,
  FaArrowLeft,
  FaIdCard,
} from "react-icons/fa";
import api from "../api/axios";

export default function UpdateMember() {
  const { id } = useParams();
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

  // ================= FETCH DATA =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [memberRes, subRes, sakRes, membersRes] = await Promise.all([
          api.get(`/members/${id}`),
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
          gender: m.gender ?? "",
          subgroup: m.subgroup?._id || m.subgroup || "",
          sakraments: Array.isArray(m.sakraments)
            ? m.sakraments.map((s) => s._id || s)
            : [],
        });

        setSubgroups(subRes.data);
        setSakraments(sakRes.data);

        // Only adults and not self
        const adultParents = membersRes.data.filter(
          (p) => p.category === "adult" && p._id !== id,
        );

        // If current member is child and has a parent,
        // make sure parent exists in dropdown
        if (m.category === "child" && m.parent) {
          const existingParentId = m.parent?._id || m.parent;

          const parentExists = adultParents.find(
            (p) => p._id === existingParentId,
          );

          if (!parentExists) {
            adultParents.push({
              _id: existingParentId,
              fullName: m.parent.fullName || "Current Parent",
            });
          }
        }

        setParents(adultParents);
      } catch (err) {
        console.error(err);
        setError("Failed to load member data");
      }
    };

    fetchData();
  }, [id]);

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      let updated = { ...prev, [name]: value };

      // If category changes and is not child → remove parent
      if (name === "category" && value !== "child") {
        updated.parent = "";
      }

      return updated;
    });
  };

  const handleSakramentToggle = (sakId) => {
    setFormData((prev) => ({
      ...prev,
      sakraments: prev.sakraments.includes(sakId)
        ? prev.sakraments.filter((s) => s !== sakId)
        : [...prev.sakraments, sakId],
    }));
  };

  // ================= SUBMIT =================

    const handleSubmit = async (e) => {
      e.preventDefault();
      setLoading(true);
      setError("");

      try {
        // 🔥 Remove empty strings before sending
        const cleanedData = { ...formData };

        Object.keys(cleanedData).forEach((key) => {
          if (cleanedData[key] === "") {
            delete cleanedData[key];
          }
        });

        console.log("Submitting:", cleanedData);

        await api.put(`/members/${id}`, cleanedData);

        navigate("/members");
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to update member");
      } finally {
        setLoading(false);
      }
    };

  // ================= UI =================
  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition"
          >
            <FaArrowLeft /> Back
          </button>

          <h1 className="text-2xl md:text-3xl font-bold text-blue-600">
            Update Member
          </h1>

          <div></div>
        </div>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded mb-6">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="relative">
              <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                required
                placeholder="Full Name"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* National ID */}
            <div className="relative">
              <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                name="nationalId"
                value={formData.nationalId}
                onChange={handleChange}
                placeholder="National ID"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Category */}
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Category</option>
              <option value="child">Child</option>
              <option value="youth">Youth</option>
              <option value="adult">Adult</option>
            </select>

            {/* Gender */}
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            {/* Parent (only if child) */}
            {formData.category === "child" && (
              <select
                name="parent"
                value={formData.parent}
                onChange={handleChange}
                required
                className="w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
                placeholder="Phone Number"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
              />
            </div>

            {/* Subgroup */}
            <select
              name="subgroup"
              value={formData.subgroup}
              onChange={handleChange}
              className="w-full py-3 px-4 border rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
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
          <div className="border rounded-xl p-5 bg-gray-50">
            <h3 className="font-semibold text-gray-700 mb-4">Sakraments</h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sakraments.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition"
                >
                  <input
                    type="checkbox"
                    checked={formData.sakraments.includes(s._id)}
                    onChange={() => handleSakramentToggle(s._id)}
                  />
                  {s.name}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-lg text-white font-semibold transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Updating..." : "Update Member"}
          </button>
        </form>
      </div>
    </div>
  );
}
