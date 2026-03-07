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
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Fetch stats from backend
  useEffect(() => {
    axios
      .get("https://ur-mt-mariko.onrender.com/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Socket for unread messages
  useEffect(() => {
    const socket = io("https://ur-mt-mariko.onrender.com");
    socket.on("newMessage", (message) => {
      setUnreadMessages((prev) => prev + 1);
      setNotifications((prev) => [message, ...prev].slice(0, 5));
    });
    return () => socket.disconnect();
  }, []);

  // Close sidebar on window resize (if screen becomes larger)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* NAVBAR */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm fixed top-0 left-0 w-full z-50 border-b border-blue-100">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>

            {/* Logo/Title */}
            <h1 className="text-sm sm:text-base lg:text-xl font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
              Sisitemu y'Umuryangoremezo Mutagatifu Mariko
            </h1>

            {/* Right section */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Search - hidden on mobile, visible on sm+ */}
              <div className="hidden sm:flex items-center bg-gray-100 rounded-lg px-3 py-1.5">
                <FaSearch className="text-gray-400 text-sm mr-2" />
                <input
                  type="text"
                  placeholder="Shakisha..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-sm w-32 lg:w-48"
                />
              </div>

              {/* Notifications */}
              <div className="relative">
                <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors">
                  <FaBell className="text-gray-600" />
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              </div>

              {/* Time */}
              <div className="hidden lg:flex items-center gap-1 text-gray-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                <FaClock className="text-blue-500" />
                <span className="text-sm font-medium">{time.toLocaleTimeString()}</span>
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base shadow-md">
                AD
              </div>
            </div>
          </div>

          {/* Mobile search - visible only on mobile */}
          <div className="sm:hidden mt-3 flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <FaSearch className="text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Shakisha..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-full"
            />
          </div>
        </div>
      </nav>

      {/* SIDEBAR OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white/90 backdrop-blur-md shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-blue-100">
            <h2 className="text-xl font-bold text-blue-600">Menu</h2>
            <p className="text-xs text-gray-500 mt-1">Navigasiya yihuse</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
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
                label="Abanyamuryango"
                onClick={() => {
                  navigate("/members");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaUserPlus />}
                label="Andika Umunyamuryango"
                onClick={() => {
                  navigate("/members/create");
                  setSidebarOpen(false);
                }}
              />
              <SidebarButton
                icon={<FaCalendarAlt />}
                label="Ibikorwa"
                badge="3"
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
                  navigate("/dashboard/messages");
                  setSidebarOpen(false);
                }}
              />
            </div>
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-blue-100">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-all hover:translate-x-1 font-medium"
            >
              <FaSignOutAlt /> Sohoka
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="md:ml-64 pt-20 md:pt-4">
        <div className="p-4 sm:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Incamake y'Imbonerahamwe
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Mwirwe, Murakaza neza muri sisitemu
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-600 font-medium">Turimo gupakurura imbonerahamwe...</p>
              </div>
            </div>
          ) : (
            <>
              {/* STATS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard
                  title="Abanyamuryango Bose"
                  value={stats?.totalMembers || 0}
                  icon={<FaUsers className="text-blue-500" />}
                  trend="+12%"
                  color="blue"
                />
                <StatCard
                  title="Ibikorwa Byose"
                  value={stats?.totalEvents || 0}
                  icon={<FaCalendarAlt className="text-green-500" />}
                  trend="+5%"
                  color="green"
                />
                <StatCard
                  title="Ubutumwa Butarasomwa"
                  value={unreadMessages}
                  icon={<FaEnvelope className="text-purple-500" />}
                  trend="+3"
                  color="purple"
                />
                <StatCard
                  title="Ibirori By'iki Gihe"
                  value={stats?.upcomingEvents || 0}
                  icon={<FaClock className="text-orange-500" />}
                  color="orange"
                />
              </div>

              {/* CHARTS AND TABLES SECTION */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Subgroup Stats - Takes 2 columns on large screens */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
                      Abanyamuryango hakurikijwe Umuryango Remezo
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                      Reba Byose →
                    </button>
                  </div>
                  
                  {stats?.subgroupStats?.length > 0 ? (
                    <div className="space-y-3">
                      {stats.subgroupStats.map((s, index) => (
                        <div
                          key={s._id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-600 rounded-lg text-sm font-semibold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-700">{s._id}</span>
                          </div>
                          <span className="px-4 py-1.5 bg-white rounded-lg font-bold text-blue-600 shadow-sm">
                            {s.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-gray-500">Nta makuru y'imiryango remezo ahari.</p>
                    </div>
                  )}
                </div>

                {/* Quick Actions / Activity - Takes 1 column */}
                <div className="bg-white rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl transition-shadow">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-6">
                    Ibikorwa Vuba
                  </h3>
                  
                  <div className="space-y-4">
                    <QuickAction
                      icon={<FaUserPlus />}
                      label="Ongera Umunyamuryango"
                      onClick={() => navigate("/members/create")}
                      color="blue"
                    />
                    <QuickAction
                      icon={<FaCalendarAlt />}
                      label="Tegura Igikorwa"
                      onClick={() => navigate("/events/create")}
                      color="green"
                    />
                    <QuickAction
                      icon={<FaEnvelope />}
                      label="Ohereza Ubutumwa"
                      onClick={() => navigate("/messages/new")}
                      color="purple"
                      badge={unreadMessages}
                    />
                  </div>

                  {/* Recent Activity */}
                  <div className="mt-8">
                    <h4 className="text-sm font-semibold text-gray-500 mb-3">
                      Ibikorwa Biherutse
                    </h4>
                    <div className="space-y-3">
                      <ActivityItem
                        text="Umunyamuryango mushya yongewe"
                        time="2m ishize"
                      />
                      <ActivityItem
                        text="Igikorwa gishya cyateguwe"
                        time="1h ishize"
                      />
                      <ActivityItem
                        text="Ubutumwa 3 butarasomwa"
                        time="2h ishize"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */
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
        <span className="font-medium text-sm">{label}</span>
      </div>
      {badge && (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            active
              ? "bg-white text-blue-600"
              : "bg-blue-100 text-blue-600"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value, icon, trend, color = "blue" }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colors[color]} bg-opacity-10 rounded-xl`}>
          <div className="text-white">{icon}</div>
        </div>
        {trend && (
          <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl sm:text-3xl font-bold text-gray-800">{value?.toLocaleString()}</p>
    </div>
  );
}

function QuickAction({ icon, label, onClick, color = "blue", badge }) {
  const colors = {
    blue: "hover:bg-blue-50 hover:text-blue-600",
    green: "hover:bg-green-50 hover:text-green-600",
    purple: "hover:bg-purple-50 hover:text-purple-600",
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full p-4 bg-gray-50 rounded-xl ${colors[color]} transition-all group relative`}
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-500 group-hover:scale-110 transition-transform">{icon}</span>
        <span className="font-medium text-gray-700">{label}</span>
      </div>
      {badge > 0 && (
        <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function ActivityItem({ text, time }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-2 h-2 mt-2 bg-blue-500 rounded-full"></div>
      <div>
        <p className="text-gray-700">{text}</p>
        <p className="text-xs text-gray-400">{time}</p>
      </div>
    </div>
  );
}