import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  FaArrowLeft, 
  FaUserCheck, 
  FaUserTimes,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaVenusMars,
  FaLayerGroup,
  FaCross,
  FaEdit,
  FaChartLine,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaClock,
  FaChevronRight,
  FaHeartbeat,
  FaSkull,
  FaTruck,
  FaFileAlt,
  FaImage,
  FaMapMarkerAlt,
  FaUsers,
  FaPlus
} from "react-icons/fa";
import api from "../api/axios";
import EventReportForm from "../components/EventReportForm";
import EventReportView from "../components/EventReportView";

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info");
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [showReportForm, setShowReportForm] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = () => {
      const token = localStorage.getItem('token');
      setIsAdmin(!!token);
    };
    checkAdmin();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        // REMOVED the incorrect decision API call
        const [eventRes, attendanceRes, reportRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/attendance/event/${id}`),
          api.get(`/reports/event/${id}`).catch(() => null)
        ]);

        if (!isMounted) return;

        setEvent(eventRes.data);
        
        const attendanceData = attendanceRes.data || [];
        setAttendance(attendanceData);
        
        // Calculate stats
        const present = attendanceData.filter(a => a.status === "present").length;
        const absent = attendanceData.filter(a => a.status === "absent").length;
        setStats({ present, absent, total: attendanceData.length });
        
        setReport(reportRes?.data || null);
      } catch (err) {
        if (isMounted) {
          console.error(err);
          setError("Ntibyashoboye gupakurura amakuru y'igikorwa.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString('rw-TZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "-";
    }
  };

  const getAttendancePercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  const handleReportSuccess = () => {
    setShowReportForm(false);
    api.get(`/reports/event/${id}`)
      .then(res => setReport(res.data))
      .catch(() => setReport(null));
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
            Birimo gupakurura amakuru y'igikorwa...
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
            <FaExclamationCircle className="text-red-500 text-2xl sm:text-3xl" />
          </div>
          <p className="text-red-600 text-sm sm:text-base font-medium mb-2">
            Habayemo ikibazo
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-colors text-sm font-medium"
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
            Igikorwa ushaka gushakisha gishobora kuba cyarakuweho
          </p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-colors text-sm font-medium"
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
        
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors active:opacity-70 px-2 py-2 -ml-2 
                     rounded-lg active:bg-blue-50 w-fit group"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm sm:text-base">Subira Inyuma</span>
          </button>

          <div className="flex gap-2">
            {isAdmin && (
              <button
                onClick={() => navigate(`/events/${event._id}/attendance`)}
                className="flex items-center justify-center gap-2 bg-gradient-to-r 
                         from-blue-600 to-blue-700 text-white px-4 sm:px-5 
                         py-2.5 sm:py-3 rounded-xl hover:from-blue-700 
                         hover:to-blue-800 transition-all duration-300 
                         transform hover:scale-105 text-sm sm:text-base 
                         font-medium shadow-md hover:shadow-lg"
              >
                <FaUserCheck className="text-sm sm:text-base" />
                Shyiraho Kwitabira
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column - Event Info */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden 
                          hover:shadow-xl transition-all duration-300">
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                  {event.title}
                </h1>
              </div>

              <div className="p-5 sm:p-6 space-y-4">
                
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <FaCalendarAlt className="text-blue-600 text-lg" />
                  <div>
                    <p className="text-xs text-gray-500">Itariki</p>
                    <p className="text-sm font-medium">
                      {formatDate(event.date)}
                    </p>
                  </div>
                </div>

                {event.description && (
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Ibisobanuro</p>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChartLine className="text-blue-600" />
                    Ibarurishamibare
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                      <p className="text-xs text-gray-500">Bose</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{stats.present}</p>
                      <p className="text-xs text-gray-500">Abitabiriye</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                      <p className="text-xs text-gray-500">Abataritabiriye</p>
                    </div>
                  </div>

                  {stats.total > 0 && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Kwitabira: {getAttendancePercentage()}%</span>
                        <span>{stats.present}/{stats.total}</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 rounded-full transition-all duration-500"
                          style={{ width: `${getAttendancePercentage()}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance & Report */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaUserCheck className="text-sm sm:text-base" />
                    Abitabiriye igikorwa
                  </h2>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl">
                    <FaClock className="text-white text-xs" />
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {stats.total} Bose
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {attendance.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 
                                  flex items-center justify-center mx-auto mb-4">
                      <FaUserTimes className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500">Nta bitabiriye banditswe</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {attendance.map((record) => (
                      <div
                        key={record._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                        ${record.status === "present" ? "bg-green-100" : "bg-red-100"}`}>
                            {record.status === "present" 
                              ? <FaUserCheck className="text-green-600 text-xs" />
                              : <FaUserTimes className="text-red-600 text-xs" />
                            }
                          </div>
                          <div>
                            <p className="font-medium text-sm">
                              {record.member?.fullName || "Ntazwi"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {record.member?.subgroup?.name || "Nta muryango"}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium
                            ${record.status === "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}
                        >
                          {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-5 sm:p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaFileAlt />
                    Raporo y'igikorwa
                  </h2>
                  {isAdmin && (
                    <button
                      onClick={() => setShowReportForm(!showReportForm)}
                      className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg 
                               transition-colors flex items-center gap-2 text-sm"
                    >
                      {showReportForm ? (
                        "Gusiba"
                      ) : report ? (
                        <>
                          <FaEdit /> Hindura
                        </>
                      ) : (
                        <>
                          <FaPlus /> Ongeraho
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                {showReportForm ? (
                  <EventReportForm
                    eventId={id}
                    existingReport={report}
                    onSuccess={handleReportSuccess}
                    onCancel={() => setShowReportForm(false)}
                  />
                ) : report ? (
                  <EventReportView
                    report={report}
                    isAdmin={isAdmin}
                    onEdit={() => setShowReportForm(true)}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="bg-gray-100 rounded-full w-16 h-16 
                                  flex items-center justify-center mx-auto mb-4">
                      <FaFileAlt className="text-gray-400 text-2xl" />
                    </div>
                    <p className="text-gray-500 mb-2">Nta raporo yabonetse</p>
                    <p className="text-sm text-gray-400">
                      Ongeraho raporo kugirango ubone amakuru y'igikorwa
                    </p>
                    {isAdmin && (
                      <button
                        onClick={() => setShowReportForm(true)}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium"
                      >
                        + Ongeraho raporo
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}