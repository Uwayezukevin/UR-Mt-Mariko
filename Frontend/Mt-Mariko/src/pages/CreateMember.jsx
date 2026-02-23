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

        const adults = parentRes.data.filter(
          (member) => member.category === "adult"
        );
        setParents(adults);
      } catch (err) {
        console.error("Ntibishoboye kubona amakuru:", err);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && value !== "child" ? { parent: "" } : {}),
    }));
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
      const payload = {
        fullName: formData.fullName,
        category: formData.category,
        gender: formData.gender,
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
      const message =
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        err.response?.data?.message ||
        "Kurema umunyamuryango byanze";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8 relative">
        
        {/* Subira inyuma */}
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex items-center gap-2 text-blue-600 hover:text-blue-800"
        >
          <FaArrowLeft /> Subira inyuma
        </button>

        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Andika Umunyamuryango Mushya
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          
          {/* Amazina yose */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="fullName"
              placeholder="Amazina yose"
              value={formData.fullName}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Icyiciro */}
          <div className="relative">
            <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Hitamo Icyiciro</option>
              <option value="child">Umwana</option>
              <option value="youth">Urubyiruko</option>
              <option value="adult">Umukuru</option>
            </select>
          </div>

          {/* Umubyeyi */}
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
                <option value="">Hitamo Umubyeyi</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.fullName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Indangamuntu */}
          <div className="relative">
            <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="nationalId"
              placeholder="Indangamuntu"
              value={formData.nationalId}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Itariki y'amavuko */}
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

          {/* Telefoni */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="tel"
              name="phone"
              placeholder="Telefoni"
              value={formData.phone}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Igitsina */}
          <div className="relative">
            <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Hitamo Igitsina</option>
              <option value="male">Gabo</option>
              <option value="female">Gore</option>
            </select>
          </div>

          {/* Umuryango remezo */}
          <div className="relative">
            <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <select
              name="subgroup"
              value={formData.subgroup}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Hitamo Umuryango Remezo</option>
              {subgroups.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sakramentu */}
          <div className="space-y-2">
            <p className="font-semibold text-gray-700">
              Amasakramentu:
            </p>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading
              ? "Turimo kurema umunyamuryango..."
              : "Andika Umunyamuryango"}
          </button>
        </form>
      </div>
    </div>
  );
}