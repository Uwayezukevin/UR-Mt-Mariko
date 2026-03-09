import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaInfoCircle, 
  FaUserCheck, 
  FaUserTimes,
  FaShare,
  FaDownload,
  FaUsers,
  FaClock
} from "react-icons/fa";
import api from "../api/axios";

export default function EventDetailsPublic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventRes, attendanceRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/attendance/event/${id}`),
        ]);

        setEvent(eventRes.data);
        
        const attendanceData = attendanceRes.data || [];
        setAttendance(attendanceData);

        // Calculate stats
        const present = attendanceData.filter(a => a.status === "present").length;
        const absent = attendanceData.filter(a => a.status === "absent").length;
        setStats({ present, absent, total: attendanceData.length });

      } catch (err) {
        console.error(err);
        setError("Ntibyashoboye kwerekana amakuru y'igikorwa.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  const formatDate = (dateStr, includeTime = false) => {
    try {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      if (includeTime) {
        return date.toLocaleDateString('rw-TZ', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
      return date.toLocaleDateString('rw-TZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `✅ Yitabiriye: ${stats.present} | ❌ Ntiyitabiriye: ${stats.absent}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Link yandukwe neza!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 
                          border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <FaCalendarAlt className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                                     text-blue-600 text-lg sm:text-xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base font-medium">
            Turimo gutunganya amakuru y'igikorwa...
          </p>
          <p className="text-xs sm:text-sm text-gray-400 mt-2">
            Nyamuneka tegereza gato
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
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-all duration-300 transform hover:scale-105
                     text-sm sm:text-base font-medium w-full sm:w-auto sm:px-8"
          >
            Subira Inyuma
          </button>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md text-center">
          <div className="bg-yellow-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                        flex items-center justify-center mx-auto mb-4">
            <FaCalendarAlt className="text-yellow-500 text-2xl sm:text-3xl" />
          </div>
          <p className="text-gray-800 text-sm sm:text-base font-medium mb-2">
            Igikorwa nticyabonetse
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Igikorwa ushaka gishobora kuba cyarakuweho cyangwa nticyabaho
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-all duration-300 transform hover:scale-105
                     text-sm sm:text-base font-medium w-full sm:w-auto sm:px-8"
          >
            Tangira Ubusobanuro
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Navigation and Share */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors active:opacity-70 px-2 py-2 -ml-2 
                     rounded-xl active:bg-blue-50 w-fit group"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm sm:text-base">Subira inyuma</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 
                     bg-blue-600 text-white rounded-xl hover:bg-blue-700 
                     transition-all duration-300 transform hover:scale-105
                     text-sm sm:text-base font-medium shadow-md hover:shadow-lg
                     active:scale-95"
          >
            <FaShare className="text-sm sm:text-base" />
            <span>Sangira ibisobanuro</span>
          </button>
        </div>

        {/* Share Options (Mobile) */}
        {showShareOptions && !navigator.share && (
          <div className="mb-4 sm:mb-6 p-4 bg-white rounded-xl shadow-lg border border-blue-100">
            <p className="text-xs sm:text-sm text-gray-600 mb-3 font-medium">
              Kopi link y'igikorwa:
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl 
                         text-xs sm:text-sm bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-blue-500"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={handleCopyLink}
                className="px-5 py-3 bg-blue-600 text-white rounded-xl 
                         hover:bg-blue-700 transition-colors text-sm font-medium
                         flex items-center justify-center gap-2"
              >
                <FaDownload className="text-sm" />
                Kopi
              </button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column - Event Details */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Event Info Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden 
                          hover:shadow-xl transition-all duration-300">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                  {event.title}
                </h1>
              </div>
              
              <div className="p-5 sm:p-6 space-y-5">
                
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FaCalendarAlt className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Itariki</p>
                    <p className="text-sm sm:text-base font-semibold text-gray-800">
                      {formatDate(event.date, true)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-3 rounded-xl">
                    <FaInfoCircle className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500 font-medium">Ibisobanuro</p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                      {event.description || "Nta bisobanuro bihari"}
                    </p>
                  </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="bg-gradient-to-br from-green-50 to-green-100 
                                rounded-xl p-4 text-center transform hover:scale-105 
                                transition-transform duration-300">
                    <FaUserCheck className="text-green-600 text-xl sm:text-2xl mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-green-700 font-medium">Yitabiriye</p>
                    <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.present}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 
                                rounded-xl p-4 text-center transform hover:scale-105 
                                transition-transform duration-300">
                    <FaUserTimes className="text-red-600 text-xl sm:text-2xl mx-auto mb-2" />
                    <p className="text-xs sm:text-sm text-red-700 font-medium">Ntiyitabiriye</p>
                    <p className="text-xl sm:text-2xl font-bold text-red-700">{stats.absent}</p>
                  </div>
                </div>

                {/* Total Participants */}
                <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FaUsers className="text-blue-600 text-lg" />
                    <span className="text-sm sm:text-base text-gray-700">Abitabiriye bose</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.total}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaUserCheck className="text-sm sm:text-base" />
                    Abitabiriye
                  </h2>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl">
                    <FaClock className="text-white text-xs" />
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {stats.total} yose
                    </span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {attendance.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 
                                  flex items-center justify-center mx-auto mb-4">
                      <FaUserTimes className="text-gray-400 text-3xl sm:text-4xl" />
                    </div>
                    <p className="text-gray-600 text-sm sm:text-base font-medium mb-2">
                      Nta bitabiriye banditswe
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">
                      Abantu bazagaragara iyo bitabiriye iki gikorwa
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View */}
                    <div className="block lg:hidden space-y-3">
                      {attendance.map((record, index) => (
                        <div
                          key={record._id}
                          className="bg-gradient-to-r from-gray-50 to-white 
                                   rounded-xl p-4 border border-gray-100 
                                   hover:shadow-md transition-all duration-300
                                   transform hover:scale-[1.02]"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center
                                          ${record.status === "present" 
                                            ? "bg-green-100" 
                                            : "bg-red-100"}`}>
                              {record.status === "present" 
                                ? <FaUserCheck className="text-green-600" />
                                : <FaUserTimes className="text-red-600" />
                              }
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                                    {record.member?.fullName || "Ntizwi"}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {record.member?.subgroup?.name || "Nta group"}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium
                                    ${record.status === "present"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {record.status === "present"
                                    ? "Yitabiriye"
                                    : "Ntabwo yitabiriye"}
                                </span>
                              </div>
                              <p className="text-xs text-gray-400 mt-2">
                                {formatDate(record.createdAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Umunyamuryango
                            </th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Umuryango
                            </th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Uko yitabiriye
                            </th>
                            <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Itariki
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {attendance.map((record) => (
                            <tr 
                              key={record._id} 
                              className="hover:bg-gray-50 transition-colors group"
                            >
                              <td className="p-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                                ${record.status === "present" 
                                                  ? "bg-green-100" 
                                                  : "bg-red-100"}`}>
                                    {record.status === "present" 
                                      ? <FaUserCheck className="text-green-600 text-xs" />
                                      : <FaUserTimes className="text-red-600 text-xs" />
                                    }
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-800 text-sm">
                                      {record.member?.fullName || "Ntizwi"}
                                    </p>
                                    <p className="text-xs text-gray-500 capitalize">
                                      {record.member?.category || ""}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-4 text-sm text-gray-600">
                                {record.member?.subgroup?.name || "-"}
                              </td>
                              <td className="p-4">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium
                                    ${record.status === "present"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                    }`}
                                >
                                  {record.status === "present"
                                    ? "Yitabiriye"
                                    : "Ntabwo yitabiriye"}
                                </span>
                              </td>
                              <td className="p-4 text-sm text-gray-500">
                                {formatDate(record.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-6 pt-4 border-t border-gray-100">
                      <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              Yitabiriye: <span className="font-semibold">{stats.present}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              Ntiyitabiriye: <span className="font-semibold">{stats.absent}</span>
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 flex items-center gap-1">
                          <FaClock className="text-gray-400" />
                          Kugeza: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Button for Mobile Share */}
        <button
          onClick={handleShare}
          className="fixed bottom-6 right-6 lg:hidden bg-blue-600 text-white 
                     p-4 rounded-full shadow-xl hover:bg-blue-700 
                     transition-all duration-300 transform hover:scale-110
                     active:scale-95 z-50"
          aria-label="Share"
        >
          <FaShare className="text-lg" />
        </button>
      </div>
    </div>
  );
}