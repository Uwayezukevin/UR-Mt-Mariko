import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClock, FaEnvelopeOpenText, FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";

export default function AdminMessages() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);

  // Socket connection
  useEffect(() => {
    const socket = io("https://ur-mt-mariko.onrender.com");

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

  // Fetch messages
  useEffect(() => {
    axios
      .get("https://ur-mt-mariko.onrender.com/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">

      {/* NAVBAR */}
      <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">

          <h1 className="text-lg sm:text-xl font-bold text-blue-600 text-center sm:text-left">
            Ubuyobozi bw'Ibyitabira
          </h1>

          <div className="flex flex-wrap justify-center sm:justify-end items-center gap-4 text-sm text-gray-700">
            <Link to="/" className="hover:text-blue-600">
              Ahabanza
            </Link>

            <Link to="/" className="hover:text-blue-600">
              Ibyerekeye
            </Link>

            <Link to="/" className="hover:text-blue-600">
              Twandikire
            </Link>

            <div className="flex items-center gap-1 text-gray-500">
              <FaClock />
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="pt-28 px-4 sm:px-6 max-w-7xl mx-auto">

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-6 text-sm sm:text-base"
        >
          <FaArrowLeft /> Subira inyuma
        </button>

        {/* Page Title */}
        <div className="flex items-center gap-3 mb-6">
          <FaEnvelopeOpenText className="text-blue-600 text-xl sm:text-2xl" />
          <h2 className="text-xl sm:text-2xl font-bold text-blue-600">
            Ubutumwa bwinjiye
          </h2>
        </div>

        {/* Messages */}
        {messages.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            Nta butumwa buraboneka.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-xl shadow p-4 sm:p-5 hover:shadow-lg transition break-words"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {msg.name}
                  </h4>

                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {msg.message}
                </p>

                <div className="text-sm text-blue-600 font-medium break-all">
                  {msg.email || msg.phone || "Nta makuru y'itumanaho ahari"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}