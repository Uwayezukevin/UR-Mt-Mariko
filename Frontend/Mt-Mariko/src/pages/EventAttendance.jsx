import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { 
  FaArrowLeft, 
  FaCalendarAlt, 
  FaUserCheck, 
  FaUserTimes,
  FaInfoCircle,
  FaFilter,
  FaSearch
} from "react-icons/fa";

export default function EventAttendance() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAttendanceClosed, setIsAttendanceClosed] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [submittingId, setSubmittingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, [eventId]);

  useEffect(() => {
    // Filter members based on search and filters
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member => 
        member.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(member => member.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(member => 
        attendance[member._id] === statusFilter
      );
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, categoryFilter, statusFilter, attendance]);

  const fetchData = async () => {
    setLoading(true);
    setError("");

    try {
      const [eventRes, membersRes, attendanceRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get("/members"),
        api.get(`/attendance/event/${eventId}`),
      ]);

      const eventData = eventRes.data;
      const membersData = membersRes.data;
      const attendanceData = attendanceRes.data;

      setEvent(eventData);

      // Sort members alphabetically
      const sortedMembers = membersData.sort((a, b) => 
        a.fullName.localeCompare(b.fullName)
      );
      setMembers(sortedMembers);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(eventData.date);
      eventDate.setHours(0, 0, 0, 0);

      const closed = eventDate < today;
      setIsAttendanceClosed(closed);

      const map = {};
      let present = 0;
      let absent = 0;

      attendanceData.forEach((a) => {
        map[a.member._id] = a.status;
        if (a.status === "yitabiriye") present++;
        else if (a.status === "ntabwo yitabiriye") absent++;
      });

      if (closed) {
        membersData.forEach((member) => {
          if (!map[member._id]) {
            map[member._id] = "ntabwo yitabiriye";
            absent++;
          }
        });
      }

      setAttendance(map);
      setStats({ present, absent, total: membersData.length });

    } catch (err) {
      console.error(err);
      setError("Ntibyakunze kuzana amakuru. Ongera ugerageze.");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (memberId, status) => {
    if (isAttendanceClosed) {
      alert("Iki gikorwa cyamaze kuba. Kwitabira byarafunzwe.");
      return;
    }

    setSubmittingId(memberId);

    try {
      await api.post(`/attendance/mark/${eventId}/${memberId}`, { status });

      setAttendance((prev) => {
        const newAttendance = { ...prev, [memberId]: status };
        
        // Update stats
        const present = Object.values(newAttendance).filter(s => s === "yitabiriye").length;
        const absent = Object.values(newAttendance).filter(s => s === "ntabwo yitabiriye").length;
        setStats({ present, absent, total: members.length });
        
        return newAttendance;
      });

    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Ntibyakunze gushyiraho kwitabira. Ongera ugerageze."
      );
    } finally {
      setSubmittingId(null);
    }
  };

  const getAttendanceCount = () => {
    const present = Object.values(attendance).filter(s => s === "yitabiriye").length;
    const absent = Object.values(attendance).filter(s => s === "ntabwo yitabiriye").length;
    return { present, absent };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 
                        border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Ibirori birimo gutegurwa...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <p className="text-red-600 text-sm sm:text-base mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                     transition-colors text-sm sm:text-base"
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
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-md text-center">
          <div className="text-yellow-500 text-4xl mb-4">📅</div>
          <p className="text-gray-700 text-sm sm:text-base mb-4">Ibirori ntibyabonetse.</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 
                     transition-colors text-sm sm:text-base"
          >
            Subira Inyuma
          </button>
        </div>
      </div>
    );
  }

  const { present, absent } = stats;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     mb-4 sm:mb-6 text-sm sm:text-base transition-colors
                     active:opacity-70 px-2 py-2 -ml-2 rounded-lg active:bg-blue-50"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-sm sm:text-base" /> 
          <span className="font-medium">Subira inyuma</span>
        </button>

        {/* Event Header Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white">
              {event.title}
            </h1>
            <div className="flex items-center gap-2 text-blue-100 mt-2 text-xs sm:text-sm">
              <FaCalendarAlt className="text-sm" />
              <span>
                {event.date 
                  ? new Date(event.date).toLocaleDateString('rw-TZ', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : "Itariki itagenwe"}
              </span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 sm:p-5">
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-green-600 font-medium">Yitabiriye</p>
              <p className="text-xl sm:text-2xl font-bold text-green-700">{present}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-red-600 font-medium">Ntabwo yitabiriye</p>
              <p className="text-xl sm:text-2xl font-bold text-red-700">{absent}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-3 sm:p-4 text-center">
              <p className="text-xs sm:text-sm text-blue-600 font-medium">Igiteranyo</p>
              <p className="text-xl sm:text-2xl font-bold text-blue-700">{members.length}</p>
            </div>
          </div>

          {/* Attendance Closed Warning */}
          {isAttendanceClosed && (
            <div className="mx-4 sm:mx-5 mb-4 sm:mb-5 bg-yellow-50 border border-yellow-200 
                          rounded-lg p-3 sm:p-4 flex items-start gap-3">
              <FaInfoCircle className="text-yellow-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-700 text-sm sm:text-base font-medium">
                  Kwitabira byarafunzwe
                </p>
                <p className="text-yellow-600 text-xs sm:text-sm mt-1">
                  Iki gikorwa cyamaze kuba. Ntushobora kongera guhindura kwitabira.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaFilter className="text-blue-600 text-sm sm:text-base" />
            <h2 className="text-sm sm:text-base font-medium text-gray-700">Tunga abakristu</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Shakisha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 border border-gray-200 
                         rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 
                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-sm sm:text-base bg-white"
            >
              <option value="all">Icyiciro cyose</option>
              <option value="child">Abana</option>
              <option value="youth">Urubyiruko</option>
              <option value="adult">Abakuru</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 sm:py-3 border border-gray-200 
                       rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                       text-sm sm:text-base bg-white"
            >
              <option value="all">Uko byitabiriwe</option>
              <option value="yitabiriye">Yitabiriye gusa</option>
              <option value="ntabwo yitabiriye">Ntabwo yitabiriye gusa</option>
            </select>
          </div>

          {/* Results count */}
          <p className="text-xs sm:text-sm text-gray-500 mt-3">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'umukristu' : 'abakristu'} babonetse
          </p>
        </div>

        {/* Members List */}
        <div className="space-y-3">
          {filteredMembers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 sm:p-12 text-center">
              <FaUserTimes className="text-gray-300 text-4xl sm:text-5xl mx-auto mb-4" />
              <p className="text-gray-500 text-sm sm:text-base">
                Nta mukristu uhuza n'ibyo washakishije
              </p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                }}
                className="mt-4 text-blue-600 text-sm sm:text-base hover:underline"
              >
                Siba ibyatangijwe
              </button>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const memberStatus = attendance[member._id];
              const isSubmitting = submittingId === member._id;

              return (
                <div
                  key={member._id}
                  className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md 
                           transition-all duration-300 overflow-hidden
                           border border-gray-100 hover:border-blue-200"
                >
                  <div className="p-4 sm:p-5">
                    {/* Mobile Layout */}
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                      
                      {/* Member Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full 
                                        flex items-center justify-center flex-shrink-0
                                        ${memberStatus === 'yitabiriye' 
                                          ? 'bg-green-100 text-green-600' 
                                          : memberStatus === 'ntabwo yitabiriye'
                                          ? 'bg-red-100 text-red-600'
                                          : 'bg-gray-100 text-gray-600'}`}>
                            <FaUserCheck className="text-lg sm:text-xl" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-800 text-sm sm:text-base md:text-lg 
                                         truncate">
                              {member.fullName}
                            </h3>
                            
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-xs sm:text-sm text-gray-500 capitalize bg-gray-100 
                                             px-2 py-0.5 rounded-full">
                                {member.category === 'child' && 'Umwana'}
                                {member.category === 'youth' && 'Urubyiruko'}
                                {member.category === 'adult' && 'Umukuru'}
                              </span>
                              
                              {member.subgroup?.name && (
                                <span className="text-xs sm:text-sm text-gray-500 bg-blue-50 
                                               px-2 py-0.5 rounded-full">
                                  {member.subgroup.name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge for Mobile */}
                      {isAttendanceClosed && memberStatus && (
                        <div className="sm:hidden">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                            ${memberStatus === 'yitabiriye' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'}`}>
                            {memberStatus === 'yitabiriye' ? '✓ Yitabiriye' : '✗ Ntabwo yitabiriye'}
                          </span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
                        <button
                          disabled={isAttendanceClosed || isSubmitting}
                          onClick={() => markAttendance(member._id, "yitabiriye")}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 
                                     text-sm sm:text-base rounded-lg sm:rounded-full
                                     font-medium transition-all duration-200
                                     flex items-center justify-center gap-2
                                     ${memberStatus === "yitabiriye"
                                       ? "bg-green-600 text-white shadow-md"
                                       : "bg-green-50 text-green-600 hover:bg-green-100"
                                     } 
                                     ${isAttendanceClosed || isSubmitting 
                                       ? "opacity-50 cursor-not-allowed" 
                                       : "hover:scale-105 active:scale-95"
                                     }`}
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 
                                          border-current border-t-transparent"></div>
                          ) : (
                            <>
                              <FaUserCheck className="text-sm sm:text-base" />
                              <span className="sm:hidden">Yitabiriye</span>
                              <span className="hidden sm:inline">Yitabiriye</span>
                            </>
                          )}
                        </button>

                        <button
                          disabled={isAttendanceClosed || isSubmitting}
                          onClick={() => markAttendance(member._id, "ntabwo yitabiriye")}
                          className={`flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-2 
                                     text-sm sm:text-base rounded-lg sm:rounded-full
                                     font-medium transition-all duration-200
                                     flex items-center justify-center gap-2
                                     ${memberStatus === "ntabwo yitabiriye"
                                       ? "bg-red-600 text-white shadow-md"
                                       : "bg-red-50 text-red-600 hover:bg-red-100"
                                     } 
                                     ${isAttendanceClosed || isSubmitting 
                                       ? "opacity-50 cursor-not-allowed" 
                                       : "hover:scale-105 active:scale-95"
                                     }`}
                        >
                          {isSubmitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 
                                          border-current border-t-transparent"></div>
                          ) : (
                            <>
                              <FaUserTimes className="text-sm sm:text-base" />
                              <span className="sm:hidden">Ntabwo yitabiriye</span>
                              <span className="hidden sm:inline">Ntabwo yitabiriye</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Desktop Status Badge */}
                    {isAttendanceClosed && memberStatus && (
                      <div className="hidden sm:block absolute top-4 right-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium
                          ${memberStatus === 'yitabiriye' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'}`}>
                          {memberStatus === 'yitabiriye' ? 'Yitabiriye' : 'Ntabwo yitabiriye'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            Igiteranyo: {present} yitabiriye, {absent} ntiyitabiriye • 
            abakristu bagize uruhare: {members.length}
          </p>
        </div>
      </div>
    </div>
  );
}