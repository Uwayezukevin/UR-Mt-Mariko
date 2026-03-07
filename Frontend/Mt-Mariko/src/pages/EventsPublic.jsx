import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaCalendarAlt, FaArrowLeft } from "react-icons/fa";

export default function EventsPublic() {
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/events").then((res) => setEvents(res.data));
  }, []);

  return (
    <div className="min-h-screen bg-blue-50 px-4 sm:px-6 lg:px-8 py-6">

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-4 text-sm sm:text-base"
      >
        <FaArrowLeft /> Subira Inyuma
      </button>

      {/* Page Title */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-6">
        Ibikorwa Byose
      </h1>

      {/* Events Grid */}
      {events.length === 0 ? (
        <p className="text-gray-500 text-center">Nta bikorwa byabonetse.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {events.map((event) => (
            <div
              key={event._id}
              className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition"
            >
              {/* Title */}
              <h2 className="font-semibold text-base sm:text-lg text-gray-800">
                {event.title}
              </h2>

              {/* Date */}
              <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
                <FaCalendarAlt />
                {new Date(event.date).toLocaleDateString()}
              </div>

              {/* Description */}
              <p className="text-gray-600 mt-3 text-sm leading-relaxed line-clamp-3">
                {event.description || "Nta bisobanuro byatanzwe"}
              </p>

            </div>
          ))}

        </div>
      )}
    </div>
  );
}