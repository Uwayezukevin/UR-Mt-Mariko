import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClock, FaEnvelopeOpenText, FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";

export default function AdminMessages() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);
  const [socket, setSocket] = useState(null);

  // Guhuza socket
  useEffect(() => {
    const s = io("http://localhost:2350");
    setSocket(s);

    s.on("newMessage", (message) => {
      setMessages((prev) => [message, ...prev]);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  // Igihe kizima (live clock)
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Kuzana ubutumwa
  useEffect(() => {
    axios
      .get("http://localhost:2350/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50">
      {/* NAVBAR */}
      <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            Ubuyobozi bw'Ibyitabira
          </h1>

          <div className="flex items-center gap-6 text-gray-700">
            <Link to="/" className="hover:text-blue-600">
              Ahabanza
            </Link>
            <Link to="/" className="hover:text-blue-600">
              Ibyerekeye
            </Link>
            <Link to="/" className="hover:text-blue-600">
              Twandikire
            </Link>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaClock />
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </nav>

      {/* PAGE CONTENT */}
      <div className="pt-28 px-6 max-w-7xl mx-auto">
        {/* Subira Inyuma */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 mb-6"
        >
          <FaArrowLeft /> Subira inyuma
        </button>

        {/* Umutwe w'urupapuro */}
        <div className="flex items-center gap-3 mb-6">
          <FaEnvelopeOpenText className="text-blue-600 text-2xl" />
          <h2 className="text-2xl font-bold text-blue-600">
            Ubutumwa bwinjiye
          </h2>
        </div>

        {/* Ubutumwa */}
        {messages.length === 0 ? (
          <p className="text-gray-500">
            Nta butumwa buraboneka.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messages.map((msg) => (
              <div
                key={msg._id}
                className="bg-white rounded-xl shadow p-5 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-800">
                    {msg.name}
                  </h4>
                  <span className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  {msg.message}
                </p>

                <div className="text-sm text-blue-600 font-medium">
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