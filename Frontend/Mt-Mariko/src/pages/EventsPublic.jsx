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
    <div className="min-h-screen bg-blue-50 p-8">
      {/* Buto yo gusubira inyuma */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <FaArrowLeft /> Subira Inyuma
      </button>

      {/* Umutwe w'urupapuro */}
      <h1 className="text-3xl font-bold text-blue-600 mb-6">Ibikorwa Byose</h1>

      <div className="grid md:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="bg-white p-6 rounded-xl shadow">
            {/* Izina ry'igikorwa */}
            <h2 className="font-semibold text-lg">{event.title}</h2>

            {/* Itariki y'igikorwa */}
            <div className="flex items-center gap-2 text-blue-600 text-sm mt-2">
              <FaCalendarAlt />
              {new Date(event.date).toLocaleDateString()}
            </div>

            {/* Ibisobanuro by'igikorwa */}
            <p className="text-gray-600 mt-3">
              {event.description || "Nta bisobanuro byatanzwe"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}