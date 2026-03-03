import {
  FaUsers,
  FaCalendarAlt,
  FaSignOutAlt,
  FaBars,
  FaUserPlus,
  FaClock,
  FaEnvelope
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";

export default function Dashboard() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [open, setOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    axios.get("http://localhost:2350/dashboard/stats")
      .then(res => setStats(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:2350");
    socket.on("newMessage", () => {
      setUnreadMessages(prev => prev + 1);
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="min-h-screen flex bg-blue-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            Sisitemu y'Umuryangoremezo mutagatifu Mariko
          </h1>

          <div className="flex items-center gap-6 text-gray-700">
            <Link to="/" className="hover:text-blue-600">Ahabanza</Link>
            <Link to="/" className="hover:text-blue-600">Ibyerekeye</Link>
            <Link to="/" className="hover:text-blue-600">Twandikire</Link>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaClock />
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR */}
      <aside className={`bg-white w-64 p-6 shadow-lg fixed md:static z-20 h-full transition-transform duration-300 ${
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <br />
        <br />
        <br />
        <nav className="space-y-4">
          <SidebarButton icon={<FaCalendarAlt />} label="Imbonerahamwe" onClick={() => navigate("/dashboard")} />
          <SidebarButton icon={<FaUsers />} label="Abanyamuryango" onClick={() => navigate("/members")} />
          <SidebarButton icon={<FaUserPlus />} label="Andika Umunyamuryango" onClick={() => navigate("/members/create")} />
          <SidebarButton icon={<FaCalendarAlt />} label="Ibirori" onClick={() => navigate("/events")} />

          <SidebarButton
            icon={<FaEnvelope />}
            label="Ubutumwa"
            badge={unreadMessages}
            onClick={() => {
              setUnreadMessages(0);
              navigate("/dashboard/messages");
            }}
          />

          <button
            onClick={logout}
            className="flex items-center gap-3 text-red-500 hover:text-red-700 font-medium mt-8"
          >
            <FaSignOutAlt /> Sohoka
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <div className={`flex-1 ml-0 md:ml-64 transition-all duration-300`}>
        <header className="bg-white shadow px-6 py-4 flex items-center gap-4">
          <button onClick={() => setOpen(!open)} className="md:hidden text-blue-600">
            <FaBars size={22} />
          </button>
          <h1 className="text-xl font-semibold text-blue-600">
            Incamake y'Imbonerahamwe
          </h1>
        </header>

        <main className="p-6 mt-20 md:mt-6">
          {loading ? (
            <p className="text-blue-600">
              Turimo gupakurura imbonerahamwe...
            </p>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <StatCard title="Umubare w'Abanyamuryango Bose" value={stats?.totalMembers} />
                <StatCard title="Umubare w'Ibirori Bose" value={stats?.totalEvents} />
              </div>

              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-lg font-semibold text-blue-600 mb-4">
                  Abanyamuryango hakurikijwe Umuryango Remezo
                </h3>

                {stats?.subgroupStats?.length > 0 ? (
                  <ul className="space-y-2">
                    {stats.subgroupStats.map(s => (
                      <li key={s._id} className="flex justify-between border-b pb-2">
                        <span>{s._id}</span>
                        <span className="font-bold text-blue-600">{s.count}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">
                    Nta makuru y'imiryango remezo ahari.
                  </p>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------- COMPONENTS ---------- */

function SidebarButton({ icon, label, badge, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full text-gray-700 hover:text-blue-600 font-medium transition"
    >
      <div className="flex items-center gap-3">
        {icon} {label}
      </div>

      {badge > 0 && (
        <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
      <h3 className="text-gray-500 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-blue-600 mt-2">
        {value ?? "--"}
      </p>
    </div>
  );
}