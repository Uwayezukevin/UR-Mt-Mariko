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
  FaTruck
} from "react-icons/fa";
import api from "../api/axios";

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("info"); // 'info' or 'attendance'
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [memberRes, attendanceRes, decisionRes] = await Promise.all([
          api.get(`/members/${id}`),
          api.get(`/attendance/member/${id}`),
          api.get(`/decision/member/${id}`),
        ]);

        if (!isMounted) return;

        setMember(memberRes.data);
        
        const attendanceData = attendanceRes.data || [];
        setAttendance(attendanceData);
        
        // Calculate stats
        const present = attendanceData.filter(a => a.status === "present").length;
        const absent = attendanceData.filter(a => a.status === "absent").length;
        setStats({ present, absent, total: attendanceData.length });
        
        setDecision(decisionRes.data || null);
      } catch (err) {
        if (isMounted) {
          setError("Ntibyashoboye gupakira amakuru y'Umukristu.");
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
        day: 'numeric'
      });
    } catch {
      return "-";
    }
  };

  const getAttendancePercentage = () => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  // Get accessibility icon and color
  const getAccessibilityInfo = (status) => {
    switch(status) {
      case "alive":
        return { 
          icon: <FaHeartbeat className="text-green-500" />,
          color: "bg-green-50 border-green-200 text-green-700",
          label: "Ariho"
        };
      case "dead":
        return { 
          icon: <FaSkull className="text-gray-600" />,
          color: "bg-gray-100 border-gray-300 text-gray-700",
          label: "Yitabye Imana"
        };
      case "moved":
        return { 
          icon: <FaTruck className="text-orange-500" />,
          color: "bg-orange-50 border-orange-200 text-orange-700",
          label: "Yimukiye ahandi"
        };
      default:
        return { 
          icon: <FaInfoCircle className="text-blue-400" />,
          color: "bg-blue-50 border-blue-200 text-blue-700",
          label: status || "Ntamakuru"
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 
                          border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <FaUser className="absolute top-1/2 left-1/2 transform 
                             -translate-x-1/2 -translate-y-1/2 
                             text-blue-600 text-lg sm:text-xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-4">
            Birimo gupakira amakuru y'Umukristu...
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

  if (!member) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md text-center">
          <div className="bg-yellow-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                        flex items-center justify-center mx-auto mb-4">
            <FaUser className="text-yellow-500 text-2xl sm:text-3xl" />
          </div>
          <p className="text-gray-800 text-sm sm:text-base font-medium mb-2">
            Umukristu ntiyabonetse
          </p>
          <p className="text-gray-500 text-xs sm:text-sm mb-6">
            Umukristu ushaka gushakisha ashobora kuba atari mu bubiko
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

  const accessibilityInfo = getAccessibilityInfo(member.accessibility);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Header with Back Button and Edit */}
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

          <button
            onClick={() => navigate(`/members/edit/${member._id}`)}
            className="flex items-center justify-center gap-2 bg-gradient-to-r 
                     from-yellow-500 to-yellow-600 text-white px-4 sm:px-5 
                     py-2.5 sm:py-3 rounded-xl hover:from-yellow-600 
                     hover:to-yellow-700 transition-all duration-300 
                     transform hover:scale-105 text-sm sm:text-base 
                     font-medium shadow-md hover:shadow-lg w-full sm:w-auto"
          >
            <FaEdit className="text-sm sm:text-base" />
            Hindura Amakuru
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Left Column - Member Profile */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden 
                          hover:shadow-xl transition-all duration-300">
              
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6 text-center">
                <div className="bg-white/20 rounded-full w-20 h-20 sm:w-24 sm:h-24 
                              flex items-center justify-center mx-auto mb-3 
                              border-4 border-white/30">
                  <FaUser className="text-white text-3xl sm:text-4xl" />
                </div>
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
                  {member.fullName}
                </h1>
                <p className="text-blue-100 text-sm mt-1 capitalize">
                  {member.category === 'child' ? 'Umwana' : 
                   member.category === 'youth' ? 'Urubyiruko' : 'Umukuru'}
                </p>
              </div>

              {/* Profile Details */}
              <div className="p-5 sm:p-6 space-y-4">
                
                {/* Accessibility Status - NEW */}
                <div className={`p-4 rounded-xl border-2 ${accessibilityInfo.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {accessibilityInfo.icon}
                      <div>
                        <p className="text-xs font-medium opacity-75">Ikimezo</p>
                        <p className="font-semibold">{accessibilityInfo.label}</p>
                      </div>
                    </div>
                    {member.accessibilityNotes && (
                      <div className="text-xs italic max-w-[60%] text-right bg-white/50 p-2 rounded-lg">
                        "{member.accessibilityNotes}"
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Decision Status */}
                <div className={`p-4 rounded-xl ${
                  decision?.status === "ACTIVE" 
                    ? "bg-green-50 border border-green-200" 
                    : decision?.status === "INACTIVE"
                    ? "bg-red-50 border border-red-200"
                    : "bg-gray-50 border border-gray-200"
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {decision?.status === "ACTIVE" ? (
                        <FaCheckCircle className="text-green-600 text-lg" />
                      ) : decision?.status === "INACTIVE" ? (
                        <FaExclamationCircle className="text-red-600 text-lg" />
                      ) : (
                        <FaInfoCircle className="text-gray-400 text-lg" />
                      )}
                      <span className={`font-medium ${
                        decision?.status === "ACTIVE" 
                          ? "text-green-700" 
                          : decision?.status === "INACTIVE"
                          ? "text-red-700"
                          : "text-gray-500"
                      }`}>
                        {decision ? (
                          decision.status === "ACTIVE" ? "Aritabira" : "Ntiyitabira"
                        ) : (
                          "Nta cyemezo"
                        )}
                      </span>
                    </div>
                    {decision && (
                      <span className="text-lg font-bold text-blue-600">
                        {decision.attendancePercentage}%
                      </span>
                    )}
                  </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaVenusMars className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Igitsina</p>
                      <p className="text-sm font-medium capitalize">
                        {member.gender === 'male' ? 'Gabo' : member.gender === 'female' ? 'Gore' : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaPhone className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Telefone</p>
                      <p className="text-sm font-medium">
                        {member.phone || member.userphoneNumber || "Nta telefone"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaCalendarAlt className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Itariki y'amavuko</p>
                      <p className="text-sm font-medium">
                        {member.dateOfBirth ? formatDate(member.dateOfBirth) : "Nta tariki"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaLayerGroup className="text-blue-600 text-lg" />
                    <div>
                      <p className="text-xs text-gray-500">Umuryango remezo</p>
                      <p className="text-sm font-medium">
                        {member.subgroup?.name || "Nta tsinda"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <FaCross className="text-blue-600 text-lg mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500">Amasakramentu</p>
                      <p className="text-sm font-medium">
                        {member.sakraments?.length > 0 
                          ? member.sakraments.map((s) => s.name).join(", ")
                          : "Nta Sakramenti"}
                      </p>
                    </div>
                  </div>

                  {/* Parent Information - Enhanced */}
                  {member.parent && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                      <FaUser className="text-blue-600 text-lg" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Umubyeyi</p>
                        <p className="text-sm font-medium">{member.parent.fullName}</p>
                        <p className="text-xs text-gray-400 capitalize">
                          {member.parent.category === 'child' ? 'Umwana' : 
                           member.parent.category === 'youth' ? 'Urubyiruko' : 'Umukuru'}
                        </p>
                      </div>
                      <button
                        onClick={() => navigate(`/members/${member.parent._id}`)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                      >
                        Reba <FaChevronRight className="text-xs" />
                      </button>
                    </div>
                  )}

                  {/* Show message for adults without parent */}
                  {member.category === "adult" && !member.parent && (
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <FaUser className="text-gray-400 text-lg" />
                      <div>
                        <p className="text-xs text-gray-500">Umubyeyi</p>
                        <p className="text-sm text-gray-500 italic">Nta mubyeyi wanditswe (Umukuru ashobora kudafite umubyeyi)</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Stats */}
                <div className="pt-4 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <FaChartLine className="text-blue-600" />
                    Ibarurishamibare
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 bg-blue-50 rounded-lg">
                      <p className="text-lg font-bold text-blue-600">{stats.total}</p>
                      <p className="text-xs text-gray-500">Yose</p>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded-lg">
                      <p className="text-lg font-bold text-green-600">{stats.present}</p>
                      <p className="text-xs text-gray-500">Yitabiriye</p>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded-lg">
                      <p className="text-lg font-bold text-red-600">{stats.absent}</p>
                      <p className="text-xs text-gray-500">Ntiyitabiriye</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Attendance History */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              
              {/* Tabs for Mobile */}
              <div className="sm:hidden border-b border-gray-200">
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("info")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors
                              ${activeTab === "info" 
                                ? "text-blue-600 border-b-2 border-blue-600" 
                                : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Amakuru
                  </button>
                  <button
                    onClick={() => setActiveTab("attendance")}
                    className={`flex-1 py-3 text-sm font-medium transition-colors
                              ${activeTab === "attendance" 
                                ? "text-blue-600 border-b-2 border-blue-600" 
                                : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Kwitabira
                  </button>
                </div>
              </div>

              {/* Header - Desktop */}
              <div className="hidden sm:block bg-gradient-to-r from-blue-600 to-blue-700 p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FaUserCheck className="text-sm sm:text-base" />
                    Amateka yo kwitabira
                  </h2>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-xl">
                    <FaClock className="text-white text-xs" />
                    <span className="text-white text-xs sm:text-sm font-medium">
                      Ibikorwa: {stats.total}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {stats.total > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-white mb-1">
                      <span>Kwitabira: {getAttendancePercentage()}%</span>
                      <span>{stats.present}/{stats.total}</span>
                    </div>
                    <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${getAttendancePercentage()}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5 sm:p-6">
                {/* Mobile: Show only active tab content */}
                <div className={`${activeTab === "info" ? "block sm:hidden" : "hidden"}`}>
                  {/* Quick Info Summary for Mobile */}
                  <div className="space-y-3">
                    <div className="bg-blue-50 rounded-xl p-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-semibold">Icyiciro:</span>{" "}
                        {member.category === 'child' ? 'Umwana' : 
                         member.category === 'youth' ? 'Urubyiruko' : 'Umukuru'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Igitsina:</span>{" "}
                        {member.gender === 'male' ? 'Gabo' : member.gender === 'female' ? 'Gore' : 'N/A'}
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        <span className="font-semibold">Ikimezo:</span>{" "}
                        <span className={accessibilityInfo.color.split(' ')[2]}>
                          {accessibilityInfo.label}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Attendance Content */}
                <div className={`${activeTab === "attendance" ? "block" : "hidden sm:block"}`}>
                  {attendance.length === 0 ? (
                    <div className="text-center py-8 sm:py-12">
                      <div className="bg-gray-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                                    flex items-center justify-center mx-auto mb-4">
                        <FaUserTimes className="text-gray-400 text-2xl sm:text-3xl" />
                      </div>
                      <p className="text-gray-600 text-sm sm:text-base font-medium mb-2">
                        Nta mateka yo kwitabira
                      </p>
                      <p className="text-xs sm:text-sm text-gray-400">
                        Uyu munyamuryango ntabwo yitabiriye ibikorwa
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card View */}
                      <div className="block sm:hidden space-y-3">
                        {attendance.map((record) => (
                          <div
                            key={record._id}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100
                                     hover:shadow-md transition-all duration-300"
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                            ${record.status === "present" 
                                              ? "bg-green-100" 
                                              : "bg-red-100"}`}>
                                {record.status === "present" 
                                  ? <FaUserCheck className="text-green-600 text-xs" />
                                  : <FaUserTimes className="text-red-600 text-xs" />
                                }
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-800 text-sm">
                                  {record.event?.title || "Igikorwa nticyamenyekanye"}
                                </h3>
                                <div className="flex justify-between items-center mt-2">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                      ${record.status === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {record.createdAt ? formatDate(record.createdAt) : "-"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Igikorwa
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
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="p-4 text-sm text-gray-800">
                                  {record.event?.title || "Igikorwa nticyamenyekanye"}
                                </td>
                                <td className="p-4">
                                  <span
                                    className={`px-3 py-1 rounded-full text-xs font-medium
                                      ${record.status === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                                  </span>
                                </td>
                                <td className="p-4 text-sm text-gray-500">
                                  {record.createdAt ? formatDate(record.createdAt) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Summary Footer */}
                      <div className="mt-4 sm:mt-6 pt-4 border-t border-gray-100">
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
                            Ikigero: {new Date().toLocaleTimeString()}
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
    </div>
  );
}