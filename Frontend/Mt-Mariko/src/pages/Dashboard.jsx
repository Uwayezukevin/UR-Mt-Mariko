import {
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
  FaUserPlus,
  FaClock,
  FaEnvelope,
  FaChartPie,
  FaBell,
  FaSearch,
  FaTimes,
  FaHome,
  FaInfoCircle,
  FaEnvelopeOpenText,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios"; // Use api instead of axios directly
import io from "socket.io-client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [notifications, setNotifications] = useState([]);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  // Update clock every second
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch stats from backend with authentication
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");
      
      // Check if token exists
      if (!token) {
        setError("Token not found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        
        // Use api instance which automatically adds token
        const res = await api.get("/dashboard/stats");
        setStats(res.data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
        
        // Handle 401 Unauthorized
        if (err.response?.status === 401) {
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else {
          setError(err.response?.data?.message || "Failed to load dashboard stats");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  // Socket for unread messages
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io(import.meta.env.VITE_API_URL || "https://ur-mt-mariko.onrender.com", {
      auth: { token }
    });
    
    socket.on("newMessage", () => setUnreadMessages((prev) => prev + 1));
    
    return () => socket.disconnect();
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-md fixed top-0 left-0 w-full z-50 border-b border-blue-100 shadow-sm">
        <div className="px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={toggleSidebar}
                className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200"
                aria-label="Toggle menu"
              >
                <div className="relative w-5 h-5">
                  <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? "rotate-45" : "-translate-y-2"}`} />
                  <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? "opacity-0" : "opacity-100"}`} />
                  <span className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${sidebarOpen ? "-rotate-45" : "translate-y-2"}`} />
                </div>
              </button>
              <h1 className="text-sm sm:text-base lg:text-xl font-bold text-blue-600 truncate max-w-[180px] sm:max-w-[300px] lg:max-w-none">
                Sisitemu y'Umuryangoremezo Mutagatifu Mariko
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link to="/" className="px-3 lg:px-4 py-2 text-sm lg:text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2">
                <FaHome className="text-blue-500" />
                <span>Ahabanza</span>
              </Link>
              <Link to="/about" className="px-3 lg:px-4 py-2 text-sm lg:text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2">
                <FaInfoCircle className="text-blue-500" />
                <span>Ibyerekeye</span>
              </Link>
              <Link to="/contact" className="px-3 lg:px-4 py-2 text-sm lg:text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2">
                <FaEnvelopeOpenText className="text-blue-500" />
                <span>Twandikire</span>
              </Link>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <FaClock className="text-blue-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">
                  {time.toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity animate-fadeIn"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:top-20 md:h-[calc(100vh-5rem)]`}
        style={{ boxShadow: "4px 0 20px rgba(0,0,0,0.05)" }}
      >
        <div className="flex flex-col h-full">
          <div className="md:hidden p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-blue-600">Menu</h2>
              <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 sm:p-6">
            <div className="space-y-1">
              <SidebarButton
                icon={<FaChartPie />}
                label="Imbonerahamwe"
                active={true}
                onClick={() => {
                  navigate("/dashboard");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaUsers />}
                label="Abakristu"
                onClick={() => {
                  navigate("/members");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaUserPlus />}
                label="Andika Umukristu"
                onClick={() => {
                  navigate("/members/create");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaCalendarAlt />}
                label="Ibikorwa"
                onClick={() => {
                  navigate("/events");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaEnvelope />}
                label="Ubutumwa"
                badge={unreadMessages}
                onClick={() => {
                  setUnreadMessages(0);
                  navigate("/admin/messages");
                  setSidebarOpen(false);
                }}
              />
            </div>
          </nav>

          <div className="p-4 sm:p-6 border-t border-blue-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:translate-x-1 font-medium group"
            >
              <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
              <span>Sohoka</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className={`transition-all duration-300 ${sidebarOpen ? "md:ml-72" : "md:ml-0"}`}>
        <div className="pt-32 sm:pt-28 md:pt-24 lg:pt-20 px-4 sm:px-6 lg:px-8 pb-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Incamake y'Imbonerahamwe
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Mwirwe, Murakaza neza muri sisitemu
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-600 font-medium text-sm sm:text-base">
                  Turimo gupakurura imbonerahamwe...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center max-w-2xl mx-auto">
              <FaExclamationCircle className="text-red-500 text-4xl mx-auto mb-3" />
              <p className="text-red-600 font-medium mb-2">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Ongera ugerageze
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8 max-w-4xl">
                <StatCard title="Umubare w'Abakristu Bose" value={stats?.totalMembers || 0} />
                <StatCard title="Umubare w'ibikorwa Bose" value={stats?.totalEvents || 0} />
              </div>

              <div className="bg-white rounded-xl shadow p-4 sm:p-6 max-w-4xl">
                <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4">
                  Abakristu hakurikijwe Umuryango Remezo
                </h3>
                {stats?.subgroupStats && stats.subgroupStats.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.subgroupStats.map((s) => (
                      <li key={s._id} className="flex justify-between border-b pb-2 text-sm sm:text-base hover:bg-blue-50 transition p-2 rounded">
                        <span>{s._id}</span>
                        <span className="font-bold text-blue-600">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">Nta makuru y'imiryango remezo ahari.</p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

function SidebarButton({ icon, label, badge, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all hover:translate-x-1 ${
        active
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
          : "text-gray-700 hover:bg-blue-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={active ? "text-white" : "text-gray-500"}>{icon}</span>
        <span className="font-medium text-sm sm:text-base">{label}</span>
      </div>
      {badge && (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${active ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 sm:p-6 hover:shadow-xl transition hover:-translate-y-1">
      <h3 className="text-gray-500 text-xs sm:text-sm mb-2">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-blue-600">
        {value ?? "--"}
      </p>
    </div>
  );
}