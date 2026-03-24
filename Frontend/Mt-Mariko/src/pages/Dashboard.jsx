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
  FaExclamationCircle,
  FaTree,
  FaUserFriends,
  FaChild,
  FaChurch,
  FaDatabase,
  FaCog,
  FaUserCircle,
} from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../api/axios";
import io from "socket.io-client";

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [user, setUser] = useState(null);

  const logout = () => {
    console.log("🔓 Logging out...");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Update clock every second
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Get user from localStorage
  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }
  }, []);

  // Fetch stats from backend with authentication
  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem("token");

      console.log(
        "🔐 Dashboard mounted - Checking token:",
        token ? `${token.substring(0, 30)}...` : "NO TOKEN",
      );

      if (!token) {
        console.error("❌ No token found in localStorage");
        setError("Token not found. Please login again.");
        setLoading(false);

        setTimeout(() => {
          navigate("/login");
        }, 2000);
        return;
      }

      try {
        setLoading(true);
        setError("");

        console.log("📡 Fetching dashboard stats from /dashboard/stats");
        const res = await api.get("/dashboard/stats");
        console.log("✅ Dashboard stats received:", res.data);
        setStats(res.data);
      } catch (err) {
        console.error("❌ Dashboard stats error:", err);

        if (err.response?.status === 401) {
          console.log("🔒 401 Unauthorized - Token may be invalid or expired");
          setError("Session expired. Please login again.");
          localStorage.removeItem("token");
          setTimeout(() => {
            navigate("/login");
          }, 2000);
        } else if (err.response?.status === 404) {
          setError("Dashboard endpoint not found. Please check backend routes.");
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

    try {
      const socket = io(
        import.meta.env.VITE_API_URL || "https://ur-mt-mariko.onrender.com",
        {
          auth: { token },
        },
      );

      socket.on("newMessage", () => {
        console.log("📨 New message received");
        setUnreadMessages((prev) => prev + 1);
      });

      return () => socket.disconnect();
    } catch (err) {
      console.error("Socket connection error:", err);
    }
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

  const isActive = (path) => {
    return location.pathname === path;
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
                  <span
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                      sidebarOpen ? "rotate-45" : "-translate-y-2"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                      sidebarOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute left-0 top-1/2 transform -translate-y-1/2 w-5 h-0.5 bg-current rounded-full transition-all duration-300 ${
                      sidebarOpen ? "-rotate-45" : "translate-y-2"
                    }`}
                  />
                </div>
              </button>
              <div className="flex items-center gap-2">
                <FaChurch className="text-blue-600 text-xl sm:text-2xl" />
                <h1 className="text-sm sm:text-base lg:text-xl font-bold text-blue-600 truncate max-w-[180px] sm:max-w-[300px] lg:max-w-none">
                  Sisitemu y'Umuryangoremezo
                </h1>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-1 lg:gap-2">
              <NavLink to="/" icon={<FaHome />} label="Ahabanza" />
              <NavLink to="/about" icon={<FaInfoCircle />} label="Ibyerekeye" />
              <NavLink to="/contact" icon={<FaEnvelopeOpenText />} label="Twandikire" />
            </div>

            <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
              <div className="hidden md:flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-xl">
                <FaClock className="text-blue-500 text-sm" />
                <span className="text-sm font-medium text-gray-700">
                  {time.toLocaleTimeString()}
                </span>
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  <FaUserCircle className="text-gray-500 text-xl" />
                  <span className="hidden sm:inline text-sm text-gray-600">
                    {user.fullName || user.email}
                  </span>
                </div>
              )}
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
        className={`fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md shadow-2xl z-50 transform transition-all duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:top-20 md:h-[calc(100vh-5rem)]`}
        style={{ boxShadow: "4px 0 20px rgba(0,0,0,0.05)" }}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="md:hidden p-6 border-b border-blue-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaChurch className="text-blue-600 text-xl" />
                <h2 className="text-xl font-bold text-blue-600">Menu</h2>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <FaTimes className="text-gray-500" />
              </button>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 overflow-y-auto p-4 sm:p-6">
            {/* Main Menu Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Incamake
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaChartPie />}
                  label="Imbonerahamwe"
                  path="/dashboard"
                  isActive={isActive("/dashboard")}
                  onClick={() => {
                    navigate("/dashboard");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Members Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Abakristu
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaUsers />}
                  label="Abakristu Bose"
                  path="/members"
                  isActive={isActive("/members")}
                  onClick={() => {
                    navigate("/members");
                    setSidebarOpen(false);
                  }}
                />
                <SidebarButton
                  icon={<FaUserPlus />}
                  label="Andika Umukristu"
                  path="/members/create"
                  isActive={isActive("/members/create")}
                  onClick={() => {
                    navigate("/members/create");
                    setSidebarOpen(false);
                  }}
                />
                <SidebarButton
                  icon={<FaTree />}
                  label="Imiryango"
                  path="/families"
                  isActive={isActive("/families")}
                  onClick={() => {
                    navigate("/families");
                    setSidebarOpen(false);
                  }}
                />
                <SidebarButton
                  icon={<FaUserFriends />}
                  label="Ibyiciro"
                  path="/categories"
                  isActive={isActive("/categories")}
                  onClick={() => {
                    navigate("/categories");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Events Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Ibikorwa
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaCalendarAlt />}
                  label="Ibikorwa Byose"
                  path="/events"
                  isActive={isActive("/events")}
                  onClick={() => {
                    navigate("/events");
                    setSidebarOpen(false);
                  }}
                />
                <SidebarButton
                  icon={<FaClock />}
                  label="Ibyitabire"
                  path="/attendance"
                  isActive={isActive("/attendance")}
                  onClick={() => {
                    navigate("/attendance");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Communication Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Itumanaho
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaEnvelope />}
                  label="Ubutumwa"
                  badge={unreadMessages}
                  path="/admin/messages"
                  isActive={isActive("/admin/messages")}
                  onClick={() => {
                    setUnreadMessages(0);
                    navigate("/admin/messages");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Reports Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Raporo
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaDatabase />}
                  label="Raporo"
                  path="/reports"
                  isActive={isActive("/reports")}
                  onClick={() => {
                    navigate("/reports");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>

            {/* Settings Section */}
            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-4">
                Igenamiterere
              </p>
              <div className="space-y-1">
                <SidebarButton
                  icon={<FaCog />}
                  label="Igenamiterere"
                  path="/settings"
                  isActive={isActive("/settings")}
                  onClick={() => {
                    navigate("/settings");
                    setSidebarOpen(false);
                  }}
                />
              </div>
            </div>
          </nav>

          {/* Footer - Logout Button */}
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
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "md:ml-72" : "md:ml-0"
        }`}
      >
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
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => window.location.reload()}
                  className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Ongera ugerageze
                </button>
                <button
                  onClick={() => navigate("/login")}
                  className="mt-3 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Injira
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard
                  title="Abakristu Bose"
                  value={stats?.totalMembers || 0}
                  icon={<FaUsers />}
                  color="blue"
                />
                <StatCard
                  title="Ibikorwa Byose"
                  value={stats?.totalEvents || 0}
                  icon={<FaCalendarAlt />}
                  color="green"
                />
                <StatCard
                  title="Imiryango"
                  value={stats?.totalFamilies || 0}
                  icon={<FaTree />}
                  color="purple"
                />
                <StatCard
                  title="Ubutumwa"
                  value={unreadMessages}
                  icon={<FaEnvelope />}
                  color="orange"
                />
              </div>

              <div className="bg-white rounded-xl shadow p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-blue-600 mb-4">
                  Abakristu hakurikijwe Umuryango Remezo
                </h3>
                {stats?.subgroupStats && stats.subgroupStats.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.subgroupStats.map((s) => (
                      <li
                        key={s._id}
                        className="flex justify-between border-b pb-2 text-sm sm:text-base hover:bg-blue-50 transition p-2 rounded"
                      >
                        <span className="font-medium">{s._id}</span>
                        <span className="font-bold text-blue-600">
                          {s.count}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm sm:text-base">
                    Nta makuru y'imiryango remezo ahari.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// NavLink Component for top navigation
function NavLink({ to, icon, label }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(to)}
      className="px-3 lg:px-4 py-2 text-sm lg:text-base text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 flex items-center gap-2"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

// SidebarButton Component
function SidebarButton({ icon, label, badge, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all hover:translate-x-1 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
          : "text-gray-700 hover:bg-blue-50"
      }`}
    >
      <div className="flex items-center gap-3">
        <span className={isActive ? "text-white" : "text-gray-500"}>{icon}</span>
        <span className="font-medium text-sm sm:text-base">{label}</span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            isActive ? "bg-white text-blue-600" : "bg-blue-100 text-blue-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// StatCard Component
function StatCard({ title, value, icon, color }) {
  const colorClasses = {
    blue: "from-blue-50 to-blue-100 border-blue-200",
    green: "from-green-50 to-green-100 border-green-200",
    purple: "from-purple-50 to-purple-100 border-purple-200",
    orange: "from-orange-50 to-orange-100 border-orange-200",
  };

  const iconColors = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses[color]} rounded-xl shadow p-4 sm:p-6 hover:shadow-xl transition hover:-translate-y-1 border`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-xs sm:text-sm mb-1">{title}</p>
          <p className="text-2xl sm:text-3xl font-bold text-gray-800">
            {value ?? "--"}
          </p>
        </div>
        <div className={`text-2xl sm:text-3xl ${iconColors[color]}`}>{icon}</div>
      </div>
    </div>
  );
}