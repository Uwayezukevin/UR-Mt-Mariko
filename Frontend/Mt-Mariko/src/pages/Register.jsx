import { useState } from "react";
import { FaUser, FaPhone, FaEnvelope, FaLock } from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    userphonenumber: "",
    useremail: "",
    userpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/users/register", formData);
      navigate("/"); // redirect to login after signup
    } catch (err) {
      if (err.response?.data?.errors) {
        // Display all validation messages
        const messages = err.response.data.errors.map((e) => e.msg).join(", ");
        setError(messages);
      } else {
        setError("Ntibyashoboye guhanga konti. Ongera ugerageze.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Guhanga Konti
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Username */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="text"
              name="username"
              placeholder="Amazina yombi"
              value={formData.username}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="email"
              name="useremail"
              placeholder="Email yawe"
              value={formData.useremail}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="tel"
              name="userphonenumber"
              placeholder="07XXXXXXXX cyangwa +2507XXXXXXXX"
              value={formData.userphonenumber}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="password"
              name="userpassword"
              placeholder="Ijambobanga"
              value={formData.userpassword}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Konti iri gukorwa..." : "Hanga Konti"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Ufite konti?{" "}
          <span
            onClick={() => navigate("/")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Injira hano
          </span>
        </p>
      </div>
    </div>
  );
}