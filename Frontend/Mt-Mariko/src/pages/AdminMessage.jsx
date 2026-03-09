import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaClock, FaEnvelopeOpenText, FaArrowLeft } from "react-icons/fa";
import io from "socket.io-client";
import axios from "axios";

export default function AdminMessages() {
  const navigate = useNavigate();
  const [time, setTime] = useState(new Date());
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch messages with loading state
  useEffect(() => {
    axios
      .get("https://ur-mt-mariko.onrender.com/messages")
      .then((res) => setMessages(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* NAVBAR - Mobile First Approach */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 w-full z-50 border-b border-blue-100">
        <div className="px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between sm:items-center">
            
            {/* Logo/Title */}
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
              Ubuyobozi bw'Ibyitabira
            </h1>

            {/* Navigation and Clock - Mobile Optimized */}
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

              {/* Live Clock - Optimized for mobile */}
              <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full text-xs sm:text-sm ml-auto sm:ml-0">
                <FaClock className="text-blue-500 text-xs sm:text-sm" />
                <span className="font-medium">{time.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT - With proper spacing for mobile */}
      <div className="pt-24 sm:pt-28 pb-8 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto">

        {/* Back Button - Touch friendly */}
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

        {/* Page Title - Mobile optimized */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <div className="bg-blue-100 p-2 sm:p-3 rounded-xl">
            <FaEnvelopeOpenText className="text-blue-600 text-lg sm:text-xl md:text-2xl" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">
              Ubutumwa bwinjiye
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              {messages.length} {messages.length === 1 ? 'butumwa' : 'butumwa'}
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-b-2 border-blue-600"></div>
          </div>
        )}

        {/* Messages Grid - Fully Responsive */}
        {!loading && messages.length === 0 ? (
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
                className="group bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-xl 
                           transition-all duration-300 p-4 sm:p-5 md:p-6 
                           border border-gray-100 hover:border-blue-200
                           flex flex-col h-full transform hover:-translate-y-1"
              >
                {/* Header with name and date */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg 
                                 line-clamp-1 flex-1">
                    {msg.name || 'Umuntu utazwi'}
                  </h4>

                  <span className="text-[10px] sm:text-xs text-gray-400 whitespace-nowrap 
                                 bg-gray-50 px-2 py-1 rounded-full">
                    {new Date(msg.createdAt).toLocaleDateString('rw-TZ', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>

                {/* Message content - with better mobile readability */}
                <p className="text-gray-600 text-xs sm:text-sm md:text-base mb-4 
                             leading-relaxed flex-1 break-words">
                  {msg.message || 'Nta butumwa'}
                </p>

                {/* Contact info - responsive */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="text-xs sm:text-sm text-blue-600 font-medium 
                                bg-blue-50 rounded-lg px-3 py-2 truncate 
                                group-hover:bg-blue-100 transition-colors">
                    {msg.email || msg.phone || (
                      <span className="text-gray-400 italic">
                        Nta makuru y'itumanaho
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Floating action button for mobile refresh - optional */}
      <button
        onClick={() => window.location.reload()}
        className="fixed bottom-4 right-4 sm:hidden bg-blue-600 text-white 
                   p-3 rounded-full shadow-lg hover:bg-blue-700 
                   active:bg-blue-800 transition-colors z-40"
        aria-label="Refresh"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>
    </div>
  );
}