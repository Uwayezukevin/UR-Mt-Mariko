import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaInfoCircle, 
  FaUserCheck, 
  FaUserTimes,
  FaClipboardList,
  FaDownload,
  FaShare
} from "react-icons/fa";
import api from "../api/axios";

export default function EventDetails() {
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
        setError("Ntibyakunze kuzana ibisobanuro by'iki gikorwa.");
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

  const handleExport = () => {
    // Create CSV content
    const headers = ['Umukristu', 'Uko Yitabiriye', 'Itariki'];
    const rows = attendance.map(record => [
      record.member?.fullName || 'Ntazwi',
      record.status === 'present' ? 'Yitabiriye' : 'Ntabwo yitabiriye',
      formatDate(record.createdAt)
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n');
    
    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event?.title || 'event'}-attendance.csv`;
    link.click();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.title,
          text: `Kwitabira: ${stats.present} yitabiriye, ${stats.absent} ntiyitabiriye`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 
                        border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Ibisobanuro by'igikorwa birimo gutegurwa...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <div className="text-red-500 text-4xl sm:text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg 
                     hover:bg-blue-700 transition-colors text-sm sm:text-base
                     w-full sm:w-auto"
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
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <div className="text-yellow-500 text-4xl sm:text-5xl mb-4">📅</div>
          <p className="text-gray-700 text-sm sm:text-base mb-4">Igikorwa nticyabonetse.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-lg 
                     hover:bg-blue-700 transition-colors text-sm sm:text-base
                     w-full sm:w-auto"
          >
            Subira Inyuma
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Back Button and Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors active:opacity-70 px-2 py-2 -ml-2 
                     rounded-lg active:bg-blue-50 w-fit"
            aria-label="Go back"
          >
            <FaArrowLeft className="text-sm sm:text-base" /> 
            <span className="font-medium text-sm sm:text-base">Subira inyuma</span>
          </button>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
                       bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 
                       transition-colors text-sm sm:text-base"
            >
              <FaShare className="text-sm" />
              <span className="hidden sm:inline">Share</span>
            </button>
            
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 
                       bg-green-100 text-green-600 rounded-lg hover:bg-green-200 
                       transition-colors text-sm sm:text-base"
            >
              <FaDownload className="text-sm" />
              <span className="hidden sm:inline">Download</span>
            </button>
          </div>
        </div>

        {/* Share Options (Mobile) */}
        {showShareOptions && !navigator.share && (
          <div className="mb-4 p-3 bg-white rounded-lg shadow-lg">
            <p className="text-xs sm:text-sm text-gray-600 mb-2">Sangira link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={window.location.href}
                readOnly
                className="flex-1 px-3 py-2 border rounded-lg text-xs sm:text-sm bg-gray-50"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Link yandukwe!');
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
              >
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
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden 
                          hover:shadow-xl transition-shadow">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                  {event.title}
                </h1>
              </div>
              
              <div className="p-4 sm:p-6 space-y-4">
                
                {/* Date */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <FaCalendarAlt className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Itariki</p>
                    <p className="text-sm sm:text-base font-medium text-gray-800">
                      {formatDate(event.date, true)}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                    <FaInfoCircle className="text-blue-600 text-sm sm:text-base" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Ibisobanuro</p>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed break-words">
                      {event.description || "Nta bisobanuro bihari"}
                    </p>
                  </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="bg-green-100 rounded-lg p-2 sm:p-3">
                      <FaUserCheck className="text-green-600 text-lg sm:text-xl mx-auto mb-1" />
                      <p className="text-xs sm:text-sm text-green-600 font-medium">Yitabiriye</p>
                      <p className="text-lg sm:text-xl font-bold text-green-700">{stats.present}</p>
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="bg-red-100 rounded-lg p-2 sm:p-3">
                      <FaUserTimes className="text-red-600 text-lg sm:text-xl mx-auto mb-1" />
                      <p className="text-xs sm:text-sm text-red-600 font-medium">Ntiyitabiriye</p>
                      <p className="text-lg sm:text-xl font-bold text-red-700">{stats.absent}</p>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white px-4 py-3 sm:py-4 rounded-lg sm:rounded-xl
                           hover:from-blue-700 hover:to-blue-800 
                           transition-all duration-300 transform hover:scale-[1.02]
                           text-sm sm:text-base font-medium
                           flex items-center justify-center gap-2 mt-4"
                  onClick={() => navigate(`/events/${event._id}/attendance`)}
                >
                  <FaClipboardList className="text-sm sm:text-base" />
                  Shyiraho Kwitabira
                </button>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              
              {/* Table Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaUserCheck className="text-sm sm:text-base" />
                    Kwitabira
                  </h2>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs sm:text-sm">
                    {stats.total} yose
                  </span>
                </div>
              </div>

              {/* Table Content */}
              <div className="p-4 sm:p-6">
                {attendance.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <div className="bg-gray-50 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                                  flex items-center justify-center mx-auto mb-4">
                      <FaUserTimes className="text-gray-400 text-2xl sm:text-3xl" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">
                      Nta makuru y'ukwitabira yabonetse
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400 mt-2">
                      Kanda "Shyiraho Kwitabira" gutangira
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Mobile Card View (visible on small screens) */}
                    <div className="block lg:hidden space-y-3">
                      {attendance.map((record) => (
                        <div
                          key={record._id}
                          className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-100"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-medium text-gray-800 text-sm sm:text-base">
                              {record.member?.fullName || "Ntazwi"}
                            </h3>
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
                          <div className="flex justify-between items-center text-xs text-gray-500">
                            <span>
                              {record.member?.subgroup?.name || "Nta group"}
                            </span>
                            <span>
                              {formatDate(record.createdAt)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop Table View (hidden on small screens) */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-blue-50">
                            <th className="p-3 text-left text-sm font-medium text-gray-700">
                              Umukristu
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-gray-700">
                              Umuryango Remezo
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-gray-700">
                              Uko Yitabiriye
                            </th>
                            <th className="p-3 text-left text-sm font-medium text-gray-700">
                              Itariki
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendance.map((record) => (
                            <tr
                              key={record._id}
                              className="border-b hover:bg-gray-50 transition-colors"
                            >
                              <td className="p-3 text-sm">
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {record.member?.fullName || "Ntazwi"}
                                  </p>
                                  <p className="text-xs text-gray-500 capitalize">
                                    {record.member?.category || ""}
                                  </p>
                                </div>
                              </td>
                              <td className="p-3 text-sm text-gray-600">
                                {record.member?.subgroup?.name || "-"}
                              </td>
                              <td className="p-3">
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
                              </td>
                              <td className="p-3 text-sm text-gray-500">
                                {formatDate(record.createdAt)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Summary Footer */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex flex-wrap gap-4 justify-between items-center">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              Yitabiriye: {stats.present}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span className="text-xs sm:text-sm text-gray-600">
                              Ntiyitabiriye: {stats.absent}
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          Update: {new Date().toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}