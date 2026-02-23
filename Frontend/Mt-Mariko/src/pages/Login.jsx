import { useState } from "react";
import { FaUser, FaLock,FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
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
      const res = await api.post("/users/login", {
        useremail: formData.useremail,
        userpassword: formData.userpassword,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-blue-600 mb-6">
          Kwinjira muri konti yawe
        </h1>

        {error && (
          <p className="bg-red-100 text-red-600 text-sm p-3 rounded mb-4">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
          {/* Email */}
          <div className="relative">
            <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
            <input
              type="email"
              name="useremail"
              placeholder="Address ya Email"
              value={formData.useremail}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Kwinjira ..." : "Injira"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
            Nta konti ufite?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-blue-600 cursor-pointer hover:underline"
          >
            Hanga konti
          </span>
        </p>
      </div>
    </div>
  );
}
