import { useEffect, useState, useMemo } from "react";
import { FaPlus, FaCalendarAlt, FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Events() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
  });

  const getEventStatus = (eventDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const date = new Date(eventDate);
    date.setHours(0, 0, 0, 0);

    if (date < today) return "completed";
    if (date.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  const filteredEvents = useMemo(() => {
    if (filter === "all") return events;
    return events.filter((event) => getEventStatus(event.date) === filter);
  }, [events, filter]);

  const fetchEvents = async () => {
    try {
      setFetching(true);
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      console.error(err);
      setError("Ntibyakunze kugaragaza ibikorwa.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/events", formData);
      setFormData({ title: "", description: "", date: "" });
      setShowForm(false);
      fetchEvents();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Ntibyashoboye, gerageza nyuma.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
        >
          <FaArrowLeft /> Subira Inyuma
        </button>

        <h1 className="text-xl sm:text-2xl font-bold text-blue-600 text-center">
          Ibikorwa
        </h1>

        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto"
        >
          <FaPlus /> {showForm ? "Funga" : "Igikorwa gishya"}
        </button>

      </div>

      {/* FILTER */}
      <div className="flex gap-2 sm:gap-3 mb-6 overflow-x-auto pb-2">
        {["all", "today", "upcoming", "completed"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap transition ${
              filter === type
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {type === "all"
              ? "Byose"
              : type === "today"
              ? "Uyu munsi"
              : type === "upcoming"
              ? "Ibitegenyijwe"
              : "Byarangiye"}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
          className="bg-white p-4 sm:p-6 rounded-xl shadow mb-6 grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <input
            type="text"
            name="title"
            placeholder="Izina ry'igikorwa"
            value={formData.title}
            onChange={handleChange}
            required
            className="border p-3 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />

          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            className="border p-3 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />

          <textarea
            name="description"
            placeholder="Ubutumwa bwihariye ku gikorwa"
            value={formData.description}
            onChange={handleChange}
            required
            className="border p-3 rounded md:col-span-2 focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white py-3 rounded-lg md:col-span-2 hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Tegereza gato..." : "Hanga igikorwa"}
          </button>
        </form>
      )}

      {/* Events */}
      {fetching ? (
        <p className="text-center text-gray-500">Kureba ibikorwa...</p>
      ) : filteredEvents.length === 0 ? (
        <p className="text-center text-gray-500">
          Nta bikorwa byabonetse
        </p>
      ) : (

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

          {filteredEvents.map((event) => {
            const status = getEventStatus(event.date);

            return (
              <div
                key={event._id}
                onClick={() => navigate(`/events/${event._id}`)}
                className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer"
              >

                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-base sm:text-lg font-semibold text-gray-800">
                    {event.title}
                  </h2>

                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      status === "today"
                        ? "bg-green-100 text-green-600"
                        : status === "completed"
                        ? "bg-gray-200 text-gray-600"
                        : "bg-blue-100 text-blue-600"
                    }`}
                  >
                    {status === "today"
                      ? "Uyu munsi"
                      : status === "completed"
                      ? "Byarangiye"
                      : "Ibitegenyijwe"}
                  </span>
                </div>

                <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                  {event.description}
                </p>

                <div className="flex items-center gap-2 text-blue-600 text-sm">
                  <FaCalendarAlt />
                  {new Date(event.date).toLocaleDateString()}
                </div>

              </div>
            );
          })}

        </div>
      )}
    </div>
  );
}