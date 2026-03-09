import { useEffect, useState, useMemo } from "react";
import { 
  FaPlus, 
  FaCalendarAlt, 
  FaArrowLeft,
  FaFilter,
  FaSearch,
  FaTimes,
  FaChevronRight,
  FaClock,
  FaInfoCircle
} from "react-icons/fa";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);

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

  const getStatusColor = (status) => {
    switch(status) {
      case "today": return "bg-green-100 text-green-700 border-green-200";
      case "upcoming": return "bg-blue-100 text-blue-700 border-blue-200";
      case "completed": return "bg-gray-100 text-gray-700 border-gray-200";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case "today": return "Uyu munsi";
      case "upcoming": return "Ibitegenyijwe";
      case "completed": return "Byarangiye";
      default: return "";
    }
  };

  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Apply status filter
    if (filter !== "all") {
      filtered = filtered.filter((event) => getEventStatus(event.date) === filter);
    }

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description?.toLowerCase().includes(term)
      );
    }

    // Sort events by date
    return filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, filter, searchTerm]);

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

  const clearFilters = () => {
    setFilter("all");
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors active:opacity-70 px-2 py-2 -ml-2 
                     rounded-lg active:bg-blue-50 w-fit group"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm sm:text-base">Subira Inyuma</span>
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center 
                       bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Ibikorwa
          </h1>

          <button
            onClick={() => setShowForm((prev) => !prev)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r 
                     from-blue-600 to-blue-700 text-white px-4 sm:px-5 py-2.5 sm:py-3 
                     rounded-xl hover:from-blue-700 hover:to-blue-800 
                     transition-all duration-300 transform hover:scale-105
                     text-sm sm:text-base font-medium shadow-md hover:shadow-lg
                     active:scale-95 w-full sm:w-auto"
          >
            {showForm ? <FaTimes /> : <FaPlus />}
            {showForm ? "Funga" : "Igikorwa gishya"}
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Shakisha ibikorwa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 border border-gray-200 
                         rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base transition-all"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 
                       bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl
                       hover:bg-blue-200 transition-colors"
            >
              <FaFilter />
              <span>Tunga</span>
            </button>

            {/* Filter Buttons (Desktop) */}
            <div className="hidden sm:flex gap-2">
              {["all", "today", "upcoming", "completed"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium 
                           whitespace-nowrap transition-all duration-300
                           ${filter === type
                             ? "bg-blue-600 text-white shadow-md transform scale-105"
                             : "bg-gray-100 text-gray-600 hover:bg-gray-200"
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
          </div>

          {/* Mobile Filter Buttons */}
          {showFilters && (
            <div className="sm:hidden mt-3 grid grid-cols-2 gap-2">
              {["all", "today", "upcoming", "completed"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilter(type);
                    setShowFilters(false);
                  }}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium 
                           transition-all duration-300
                           ${filter === type
                             ? "bg-blue-600 text-white"
                             : "bg-gray-100 text-gray-600"
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
          )}

          {/* Active Filters */}
          {(filter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Ifilitero ikoreshwa:</span>
              {filter !== "all" && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium flex items-center gap-1">
                  {getStatusText(filter)}
                </span>
              )}
              {searchTerm && (
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium flex items-center gap-1">
                  "{searchTerm}"
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-800 ml-auto 
                         font-medium flex items-center gap-1"
              >
                <FaTimes /> Siba byose
              </button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 
                        flex items-start gap-3">
            <FaInfoCircle className="text-red-500 text-lg flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 text-sm sm:text-base font-medium">
                Habayemo ikibazo
              </p>
              <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Create Event Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            autoComplete="off"
            className="bg-white rounded-xl sm:rounded-2xl shadow-xl p-5 sm:p-6 mb-6 
                     border-2 border-blue-100 animate-fadeIn"
          >
            <h2 className="text-lg sm:text-xl font-bold text-blue-600 mb-4">
              Hanga igikorwa gishya
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="title"
                placeholder="Izina ry'igikorwa *"
                value={formData.title}
                onChange={handleChange}
                required
                className="border border-gray-200 p-3 sm:p-4 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base transition-all"
              />

              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 p-3 sm:p-4 border border-gray-200 
                           rounded-xl focus:ring-2 focus:ring-blue-500 
                           focus:border-blue-500 text-sm sm:text-base"
                />
              </div>

              <textarea
                name="description"
                placeholder="Ibisobanuro ku gikorwa *"
                value={formData.description}
                onChange={handleChange}
                required
                rows="3"
                className="md:col-span-2 border border-gray-200 p-3 sm:p-4 
                         rounded-xl focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500 text-sm sm:text-base resize-none"
              />

              <div className="md:col-span-2 flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white py-3 sm:py-4 rounded-xl 
                           hover:from-blue-700 hover:to-blue-800 
                           transition-all duration-300 transform hover:scale-[1.02]
                           text-sm sm:text-base font-medium
                           disabled:opacity-60 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 
                                    border-2 border-white border-t-transparent"></div>
                      Tegereza...
                    </>
                  ) : (
                    "Hanga igikorwa"
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 sm:py-4 border border-gray-300 
                           rounded-xl hover:bg-gray-50 transition-colors
                           text-sm sm:text-base font-medium"
                >
                  Gusiba
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Events Grid */}
        {fetching ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 
                            border-4 border-blue-200 border-t-blue-600"></div>
              <FaCalendarAlt className="absolute top-1/2 left-1/2 transform 
                                      -translate-x-1/2 -translate-y-1/2 
                                      text-blue-600 text-lg sm:text-xl" />
            </div>
            <p className="text-gray-500 text-sm sm:text-base mt-4">
              Kureba ibikorwa...
            </p>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 
                          flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl sm:text-4xl" />
            </div>
            <p className="text-gray-700 text-sm sm:text-base font-medium mb-2">
              Nta bikorwa byabonetse
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {searchTerm || filter !== "all" 
                ? "Ongera ugerageze ukoresheje ifilitero zinyuranye"
                : "Tangira ukore igikorwa gishya"}
            </p>
            {(searchTerm || filter !== "all") && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl 
                         hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Siba ifilitero
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Results Count */}
            <div className="flex justify-between items-center mb-4">
              <p className="text-xs sm:text-sm text-gray-500">
                {filteredEvents.length} {filteredEvents.length === 1 ? 'igikorwa' : 'ibikorwa'} byabonetse
              </p>
            </div>

            {/* Events Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
              {filteredEvents.map((event) => {
                const status = getEventStatus(event.date);
                const statusColor = getStatusColor(status);
                const eventDate = new Date(event.date);
                const isPast = eventDate < new Date();

                return (
                  <div
                    key={event._id}
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="group bg-white rounded-xl sm:rounded-2xl 
                             shadow-md hover:shadow-xl transition-all duration-300 
                             cursor-pointer overflow-hidden transform hover:-translate-y-1
                             border border-gray-100 hover:border-blue-200"
                  >
                    {/* Status Bar */}
                    <div className={`h-2 w-full ${
                      status === "today" ? "bg-green-500" :
                      status === "upcoming" ? "bg-blue-500" :
                      "bg-gray-400"
                    }`} />

                    <div className="p-5 sm:p-6">
                      {/* Header with Status */}
                      <div className="flex justify-between items-start gap-3 mb-3">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-800 
                                     line-clamp-2 flex-1 group-hover:text-blue-600 
                                     transition-colors">
                          {event.title}
                        </h2>

                        <span className={`text-xs px-2.5 py-1.5 rounded-full 
                                       font-medium whitespace-nowrap border ${statusColor}`}>
                          {getStatusText(status)}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3 
                                  leading-relaxed">
                        {event.description || "Nta bisobanuro"}
                      </p>

                      {/* Date and Footer */}
                      <div className="flex items-center justify-between pt-3 
                                    border-t border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600">
                          <FaCalendarAlt className="text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-medium">
                            {eventDate.toLocaleDateString('rw-TZ', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-gray-400 
                                      group-hover:text-blue-600 transition-colors">
                          <span className="text-xs">Reba</span>
                          <FaChevronRight className="text-xs group-hover:translate-x-1 
                                                    transition-transform" />
                        </div>
                      </div>

                      {/* Time Indicator for Today/Upcoming */}
                      {!isPast && (
                        <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                          <FaClock className="text-xs" />
                          <span>
                            {eventDate.toLocaleTimeString('rw-TZ', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Quick Stats Footer */}
        {!fetching && events.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {events.filter(e => getEventStatus(e.date) === "today").length}
                </p>
                <p className="text-xs text-gray-500">Uyu munsi</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {events.filter(e => getEventStatus(e.date) === "upcoming").length}
                </p>
                <p className="text-xs text-gray-500">Ibitegenyijwe</p>
              </div>
              <div className="text-center">
                <p className="text-lg sm:text-xl font-bold text-gray-600">
                  {events.filter(e => getEventStatus(e.date) === "completed").length}
                </p>
                <p className="text-xs text-gray-500">Byarangiye</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}