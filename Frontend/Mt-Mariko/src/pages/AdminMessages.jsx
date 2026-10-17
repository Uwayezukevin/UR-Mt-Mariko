import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaClock,
  FaEnvelopeOpenText,
  FaArrowLeft,
  FaEnvelope,
  FaCheckDouble,
} from "react-icons/fa";
import { messagesApi } from "../api/axios";
import createSocket from "../api/socket";

export default function AdminMessages() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Live socket connection (centralized factory)
  useEffect(() => {
    const socket = createSocket();
    socket.on("newMessage", (message) => {
      setMessages((prev) => [message, ...prev]);
    });
    return () => socket.disconnect();
  }, []);

  // Live clock
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Fetch messages (requires auth)
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await messagesApi.get("/");
      setMessages(res.data);
    } catch (err) {
      console.error(err);
      setError("Ntibyashoboye kuzana ubutumwa. Ongera ugerageze.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const markAsRead = async (id) => {
    try {
      await messagesApi.patch(`/${id}/read`);
      setMessages((prev) =>
        prev.map((m) => (m._id === id ? { ...m, isRead: true } : m))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 w-full z-50 border-b border-blue-100">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
              Ubuyobozi bw'Ibyitabira
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-700">
              <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                <Link
                  to="/"
                  className="hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 active:bg-blue-100"
                >
                  Ahabanza
                </Link>
                <Link
                  to="/"
                  className="hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 active:bg-blue-100"
                >
                  Ibyerekeye
                </Link>
                <Link
                  to="/"
                  className="hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-blue-50 active:bg-blue-100"
                >
                  Twandikire
                </Link>
              </div>

              <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full text-xs sm:text-sm ml-auto sm:ml-0">
                <FaClock className="text-blue-500 text-xs sm:text-sm" />
                <span className="font-medium">{time.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 sm:pt-28 pb-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-4 sm:mb-6 text-sm sm:text-base 
                     hover:text-blue-700 transition-colors active:opacity-70
                     px-2 py-2 -ml-2 rounded-lg active:bg-blue-50"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-sm sm:text-base" />
          <span className="font-medium">Subira inyuma</span>
        </button>

        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
            <FaEnvelopeOpenText className="text-blue-600 text-lg sm:text-xl md:text-2xl" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              Ubutumwa bwinjiye
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {messages.length} butumwa
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-red-600 font-medium">
                  <FaEnvelope className="text-[10px]" />
                  {unreadCount} nshya
                </span>
              )}
            </p>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {!loading && error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm text-center">
            {error}
          </div>
        )}

        {!loading && !error && messages.length === 0 ? (
          <div className="text-center py-12 sm:py-16 px-4">
            <div className="bg-white rounded-2xl shadow-sm p-8 sm:p-12 max-w-md mx-auto">
              <FaEnvelopeOpenText className="text-gray-300 text-4xl sm:text-5xl mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                Nta butumwa buraboneka.
              </p>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                Ubutumwa buzagaragara hano iyo bwatanzwe
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className={`group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl 
                           transition-all duration-300 p-4 sm:p-5 md:p-6 
                           border hover:border-blue-200
                           flex flex-col h-full transform hover:-translate-y-1
                           ${msg.isRead ? "border-gray-100" : "border-blue-300 ring-1 ring-blue-100"}`}
              >
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg line-clamp-1 flex-1">
                    {msg.name || "Umuntu utazwi"}
                  </h4>
                  {!msg.isRead && (
                    <span className="shrink-0 w-2.5 h-2.5 rounded-full bg-blue-500 mt-1" title="Ntirabwo gusomwa" />
                  )}
                  <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(msg.createdAt).toLocaleDateString("rw-RW", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 leading-relaxed flex-1 break-words">
                  {msg.message || "Nta butumwa"}
                </p>

                <div className="mt-auto pt-3 border-t border-gray-100 space-y-2">
                  <div className="text-xs sm:text-sm text-blue-600 font-medium bg-blue-50 rounded-lg px-3 py-2 truncate group-hover:bg-blue-100 transition-colors">
                    {msg.email || msg.phone || (
                      <span className="text-gray-400 italic">
                        Nta makuru y'itumanaho
                      </span>
                    )}
                  </div>
                  {!msg.isRead && (
                    <button
                      onClick={() => markAsRead(msg._id)}
                      className="w-full inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 bg-white border border-blue-200 hover:border-blue-300 rounded-lg px-3 py-1.5 transition-colors"
                    >
                      <FaCheckDouble /> Shyira nk'iyasomwe
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
