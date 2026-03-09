import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  FaCalendarAlt, 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaTimes,
  FaChevronRight,
  FaClock,
  FaInfoCircle,
  FaEye
} from "react-icons/fa";

export default function EventsPublic() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/events");
      // Sort events by date (upcoming first)
      const sortedEvents = res.data.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      setEvents(sortedEvents);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Ntibyakunze kugaragaza ibikorwa. Ongera ugerageze.");
    } finally {
      setLoading(false);
    }
  };

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

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(term) || 
        event.description?.toLowerCase().includes(term)
      );
    }

    // Apply category/status filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(event => 
        getEventStatus(event.date) === selectedCategory
      );
    }

    return filtered;
  }, [events, searchTerm, selectedCategory]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return {
      full: date.toLocaleDateString('rw-TZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      short: date.toLocaleDateString('rw-TZ', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('rw-TZ', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 
                          border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <FaCalendarAlt className="absolute top-1/2 left-1/2 transform 
                                    -translate-x-1/2 -translate-y-1/2 
                                    text-blue-600 text-lg sm:text-xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-4">
            Kureba ibikorwa...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                        flex items-center justify-center mx-auto mb-4">
            <FaInfoCircle className="text-red-500 text-2xl sm:text-3xl" />
          </div>
          <p className="text-red-600 text-sm sm:text-base font-medium mb-2">
            Habayemo ikibazo
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mb-6">{error}</p>
          <button
            onClick={fetchEvents}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ongera ugerageze
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/90 hover:text-white 
                     transition-colors mb-4 sm:mb-6 group"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
            <span className="text-sm sm:text-base">Subira Inyuma</span>
          </button>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3">
            Ibikorwa Byose
          </h1>
          <p className="text-blue-100 text-sm sm:text-base max-w-2xl">
            Reba ibikorwa byose bigenwa, uzabone amakuru y'igihe n'ibisobanuro birambuye
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Shakisha ibikorwa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 sm:py-3.5 border border-gray-200 
                         rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base transition-all"
              />
            </div>

            {/* View Toggle (Desktop) */}
            <div className="hidden sm:flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${viewMode === "grid" 
                            ? "bg-white text-blue-600 shadow-sm" 
                            : "text-gray-600 hover:text-gray-800"}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                          ${viewMode === "list" 
                            ? "bg-white text-blue-600 shadow-sm" 
                            : "text-gray-600 hover:text-gray-800"}`}
              >
                List
              </button>
            </div>

            {/* Filter Toggle (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 
                       bg-blue-100 text-blue-600 px-4 py-3 rounded-xl
                       hover:bg-blue-200 transition-colors"
            >
              <FaFilter />
              <span>Tunga</span>
            </button>
          </div>

          {/* Filter Buttons */}
          <div className={`${showFilters ? 'block' : 'hidden'} sm:block mt-3 sm:mt-4`}>
            <div className="flex flex-wrap gap-2">
              {["all", "upcoming", "today", "completed"].map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedCategory(type);
                    setShowFilters(false);
                  }}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm 
                           font-medium transition-all duration-300
                           ${selectedCategory === type
                             ? "bg-blue-600 text-white shadow-md"
                             : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                           }`}
                >
                  {type === "all"
                    ? "Byose"
                    : type === "today"
                    ? "Uyu munsi"
                    : type === "upcoming"
                    ? "Ibiteganyijwe"
                    : "Byarangiye"}
                </button>
              ))}
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedCategory !== "all") && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Inyuguti:</span>
              {selectedCategory !== "all" && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
                  {getStatusText(selectedCategory)}
                </span>
              )}
              {searchTerm && (
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
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

        {/* Results Count */}
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <p className="text-xs sm:text-sm text-gray-500">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'igikorwa' : 'ibikorwa'} byabonetse
          </p>
          
          {/* Mobile View Toggle */}
          <div className="sm:hidden flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium
                        ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium
                        ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"}`}
            >
              List
            </button>
          </div>
        </div>

        {/* Events Display */}
        {filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 
                          flex items-center justify-center mx-auto mb-4">
              <FaCalendarAlt className="text-gray-400 text-3xl sm:text-4xl" />
            </div>
            <p className="text-gray-700 text-sm sm:text-base font-medium mb-2">
              Nta bikorwa byabonetse
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {searchTerm || selectedCategory !== "all" 
                ? "Ongera ugerageze"
                : "Hari igikorwa kizagaragara vuba"}
            </p>
            {(searchTerm || selectedCategory !== "all") && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-xl 
                         hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Siba
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === "grid" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event.date);
                  const statusColor = getStatusColor(status);
                  const formattedDate = formatDate(event.date);
                  const isPast = status === "completed";

                  return (
                    <div
                      key={event._id}
                      onClick={() => navigate(`/events/public/${event._id}`)}
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
                        {/* Status Badge */}
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
                          {event.description || "Nta bisobanuro byatanzwe"}
                        </p>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                          <FaCalendarAlt className="text-xs sm:text-sm" />
                          <span className="text-xs sm:text-sm font-medium">
                            {formattedDate.short}
                          </span>
                        </div>

                        {/* Time if not past */}
                        {!isPast && (
                          <div className="flex items-center gap-2 text-gray-500 text-xs">
                            <FaClock className="text-xs" />
                            <span>{formattedDate.time}</span>
                          </div>
                        )}

                        {/* View Details Link */}
                        <div className="mt-4 pt-3 border-t border-gray-100 
                                      flex justify-between items-center">
                          <span className="text-xs text-gray-400">
                            Kanda urebe
                          </span>
                          <FaChevronRight className="text-xs text-gray-400 
                                                   group-hover:text-blue-600 
                                                   group-hover:translate-x-1 
                                                   transition-all" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <div className="space-y-3 sm:space-y-4">
                {filteredEvents.map((event) => {
                  const status = getEventStatus(event.date);
                  const statusColor = getStatusColor(status);
                  const formattedDate = formatDate(event.date);

                  return (
                    <div
                      key={event._id}
                      onClick={() => navigate(`/events/public/${event._id}`)}
                      className="group bg-white rounded-xl sm:rounded-2xl 
                               shadow-md hover:shadow-lg transition-all duration-300 
                               cursor-pointer overflow-hidden border border-gray-100 
                               hover:border-blue-200"
                    >
                      <div className="p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center 
                                      gap-4 sm:gap-6">
                          {/* Date Column */}
                          <div className="sm:w-32 flex sm:flex-col items-center 
                                        sm:items-start gap-2 sm:gap-1">
                            <div className="text-lg sm:text-xl font-bold text-blue-600">
                              {new Date(event.date).getDate()}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">
                              {new Date(event.date).toLocaleDateString('rw-TZ', { month: 'short' })}
                            </div>
                          </div>

                          {/* Content Column */}
                          <div className="flex-1">
                            <div className="flex flex-wrap items-start gap-2 mb-2">
                              <h2 className="text-base sm:text-lg font-semibold 
                                           text-gray-800 group-hover:text-blue-600 
                                           transition-colors">
                                {event.title}
                              </h2>
                              <span className={`text-xs px-2 py-1 rounded-full 
                                             font-medium border ${statusColor}`}>
                                {getStatusText(status)}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 line-clamp-2">
                              {event.description || "Nta bisobanuro byatanzwe"}
                            </p>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-2 text-gray-500 text-xs">
                                <FaCalendarAlt className="text-blue-400" />
                                <span>{formattedDate.full}</span>
                              </div>
                              {status !== "completed" && (
                                <div className="flex items-center gap-2 text-gray-500 text-xs">
                                  <FaClock className="text-blue-400" />
                                  <span>{formattedDate.time}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Arrow Icon */}
                          <div className="hidden sm:block">
                            <FaChevronRight className="text-gray-400 
                                                     group-hover:text-blue-600 
                                                     group-hover:translate-x-1 
                                                     transition-all" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Quick Stats */}
        {events.length > 0 && (
          <div className="mt-8 sm:mt-10 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-3 sm:gap-4 max-w-md mx-auto">
              <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
                <p className="text-lg sm:text-xl font-bold text-blue-600">
                  {events.filter(e => getEventStatus(e.date) === "upcoming").length}
                </p>
                <p className="text-xs text-gray-600">Ibitegenyijwe</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-green-50 rounded-xl">
                <p className="text-lg sm:text-xl font-bold text-green-600">
                  {events.filter(e => getEventStatus(e.date) === "today").length}
                </p>
                <p className="text-xs text-gray-600">Uyu munsi</p>
              </div>
              <div className="text-center p-3 sm:p-4 bg-gray-50 rounded-xl">
                <p className="text-lg sm:text-xl font-bold text-gray-600">
                  {events.filter(e => getEventStatus(e.date) === "completed").length}
                </p>
                <p className="text-xs text-gray-600">Byarangiye</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Action Button for Mobile Filter */}
      <button
        onClick={() => setShowFilters(true)}
        className="fixed bottom-6 right-6 sm:hidden bg-blue-600 text-white 
                   p-4 rounded-full shadow-xl hover:bg-blue-700 
                   transition-all duration-300 transform hover:scale-110
                   active:scale-95 z-50"
        aria-label="Filter"
      >
        <FaFilter className="text-lg" />
      </button>
    </div>
  );
}