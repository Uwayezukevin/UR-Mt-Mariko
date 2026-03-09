import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { 
  FaCalendarAlt, 
  FaClock, 
  FaBars, 
  FaTimes,
  FaSearch,
  FaUser,
  FaUsers,
  FaPhone,
  FaEnvelope,
  FaChurch,
  FaCross,
  FaChevronRight,
  FaInfoCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowRight
} from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [time, setTime] = useState(new Date());

  // SEARCH STATES
  const [subgroups, setSubgroups] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  // CONTACT STATES
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [contactError, setContactError] = useState("");

  // MOBILE MENU
  const [menuOpen, setMenuOpen] = useState(false);

  // LIVE CLOCK
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // FETCH EVENTS
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get("/events");
        const upcoming = res.data
          .filter((e) => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming.slice(0, 3));
      } catch (err) {
        console.error(err);
      }
    };
    fetchEvents();
  }, []);

  // FETCH SUBGROUPS
  useEffect(() => {
    const fetchSubgroups = async () => {
      try {
        const res = await api.get("/subgroups");
        setSubgroups(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSubgroups();
  }, []);

  // AUTO SEARCH
  useEffect(() => {
    const searchMembers = async () => {
      if (!searchTerm || !selectedSubgroup) {
        setSearchResults([]);
        return;
      }
      
      setSearchLoading(true);
      try {
        const res = await api.get(
          `/members/search?name=${searchTerm}&subgroup=${selectedSubgroup}`
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setSearchLoading(false);
      }
    };
    const delay = setTimeout(searchMembers, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedSubgroup]);

  // CONTACT HANDLER
  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
    setContactError("");
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactData.email && !contactData.phone) {
      setContactError("Nyamuneka shyiramo email cyangwa telefone.");
      return;
    }

    if (!contactData.message.trim()) {
      setContactError("Nyamuneka andika ubutumwa.");
      return;
    }

    try {
      setSending(true);
      await axios.post("https://ur-mt-mariko.onrender.com/messages/send", contactData);
      setSuccessMsg("Ubutumwa bwoherejwe neza!");
      setContactData({ name: "", email: "", phone: "", message: "" });
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setContactError("Ntibyashoboye koherezwa ubutumwa. Ongera ugerageze.");
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('rw-TZ', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen scroll-smooth">
      {/* NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 w-full z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <FaChurch className="text-blue-600 text-xl sm:text-2xl mr-2" />
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
                Umuryango Mutagatifu Mariko
              </h1>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-6 text-gray-700">
              <a href="#home" className="hover:text-blue-600 transition-colors text-sm font-medium">
                Ahabanza
              </a>
              <a href="#about" className="hover:text-blue-600 transition-colors text-sm font-medium">
                Ibyerekeye
              </a>
              <a href="#contact" className="hover:text-blue-600 transition-colors text-sm font-medium">
                Twandikire
              </a>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                         transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
              >
                Injira
              </button>
              <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                <FaClock className="text-blue-600" />
                <span className="font-medium text-gray-700">{time.toLocaleTimeString()}</span>
              </div>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-blue-600 text-xl p-2 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-blue-100 animate-slideDown">
            <a 
              href="#home" 
              className="block px-6 py-3 hover:bg-blue-50 transition-colors text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Ahabanza
            </a>
            <a 
              href="#about" 
              className="block px-6 py-3 hover:bg-blue-50 transition-colors text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Ibyerekeye
            </a>
            <a 
              href="#contact" 
              className="block px-6 py-3 hover:bg-blue-50 transition-colors text-gray-700"
              onClick={() => setMenuOpen(false)}
            >
              Twandikire
            </a>
            <div className="px-6 py-3 border-t border-blue-100">
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg 
                         hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Injira
              </button>
              <div className="flex items-center justify-center gap-2 mt-3 text-sm text-gray-500">
                <FaClock className="text-blue-600" />
                <span>{time.toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* HERO SECTION */}
      <section
        id="home"
        className="pt-28 sm:pt-32 md:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            Murakaza neza
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-blue-600 mb-4 sm:mb-6">
            Umuryango remezo witiriwe
            <span className="block text-gray-800">Mutagatifu Mariko</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
            Kugenzura abanyamuryango, gukurikirana kwitabira ibikorwa, no kumenya
            amakuru y'ibikorwa biri imbere by'umuryango witiriwe Mutagatifu Mariko.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <a
              href="#search"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 
                       transition-all duration-300 transform hover:scale-105
                       text-sm sm:text-base font-medium shadow-md hover:shadow-lg
                       flex items-center justify-center gap-2"
            >
              <FaSearch />
              Shakisha umunyamuryango
            </a>
            <a
              href="#events"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl hover:bg-blue-50 
                       transition-all duration-300 transform hover:scale-105
                       text-sm sm:text-base font-medium border-2 border-blue-600
                       flex items-center justify-center gap-2"
            >
              <FaCalendarAlt />
              Reba ibikorwa
            </a>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
        </div>
      </section>

      {/* SEARCH MEMBERS SECTION */}
      <section id="search" className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            Shakisha Umunyamuryango
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Shakisha abanyamuryango ukoresheje izina n'umuryango remezo
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Subgroup Select */}
            <div className="relative">
              <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
              <select
                value={selectedSubgroup}
                onChange={(e) => setSelectedSubgroup(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base appearance-none bg-white"
              >
                <option value="">Hitamo Umuryango remezo</option>
                {subgroups.map((sg) => (
                  <option key={sg._id} value={sg._id}>
                    {sg.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
              <input
                type="text"
                placeholder="Andika izina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Search Tips */}
          <div className="text-xs text-gray-400 flex items-center gap-2">
            <FaInfoCircle />
            <span>Shyiramo umuryango remezo n'izina kugirango ubone ibisubizo</span>
          </div>
        </div>

        {/* Loading State */}
        {searchLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
            <p className="text-gray-500 text-sm mt-2">Turimo gushakisha...</p>
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && !searchLoading && (
          <div className="mt-8 space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-blue-600">
                Abanyamuryango babonetse ({searchResults.length})
              </h4>
              <button
                onClick={() => setSearchResults([])}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Siba byose
              </button>
            </div>

            {searchResults.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Member Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 sm:p-6">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 rounded-full p-3">
                      <FaUser className="text-white text-xl" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-bold text-white">
                        {member.fullName}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {member.category === 'child' ? 'Umwana' : 
                         member.category === 'youth' ? 'Urubyiruko' : 'Umukuru'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Member Details */}
                <div className="p-4 sm:p-6 space-y-4">
                  {/* Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaUsers className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Umuryango remezo</p>
                        <p className="text-sm font-medium">{member.subgroup?.name || "Nta tsinda"}</p>
                      </div>
                    </div>

                    {member.category === "child" && member.parent && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <FaUser className="text-blue-600" />
                        <div>
                          <p className="text-xs text-gray-500">Umubyeyi</p>
                          <p className="text-sm font-medium">{member.parent.fullName}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaPhone className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Telefone</p>
                        <p className="text-sm font-medium">{member.phone || "Nta telefone"}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <FaCross className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-500">Amasakramentu</p>
                        <p className="text-sm font-medium">
                          {member.sakraments?.length > 0
                            ? member.sakraments.map((s) => s.name).join(", ")
                            : "Nta Sakramenti"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Decision Status */}
                  {member.decision && (
                    <div className={`p-4 rounded-xl ${
                      member.decision.status === "ACTIVE" 
                        ? "bg-green-50 border border-green-200" 
                        : "bg-red-50 border border-red-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {member.decision.status === "ACTIVE" 
                            ? <FaCheckCircle className="text-green-600" />
                            : <FaExclamationCircle className="text-red-600" />
                          }
                          <span className={`font-medium ${
                            member.decision.status === "ACTIVE" 
                              ? "text-green-700" 
                              : "text-red-700"
                          }`}>
                            {member.decision.status === "ACTIVE" ? "Akiriho" : "Ntahari"}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-blue-600">
                          {member.decision.attendancePercentage}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Attendance History */}
                  {member.attendance?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-blue-600 mb-3 flex items-center gap-2">
                        <FaCalendarAlt />
                        Amateka yo kwitabira
                      </h4>
                      
                      {/* Mobile Card View */}
                      <div className="block sm:hidden space-y-3">
                        {member.attendance.slice(0, 3).map((record) => (
                          <div key={record._id} className="bg-gray-50 rounded-xl p-3">
                            <div className="flex justify-between items-start mb-2">
                              <p className="font-medium text-sm">{record.event?.title || "N/A"}</p>
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
                            <p className="text-xs text-gray-500">
                              {record.createdAt ? formatDate(record.createdAt) : "-"}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Desktop Table View */}
                      <div className="hidden sm:block overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-gray-50">
                              <th className="p-3 text-left">Igikorwa</th>
                              <th className="p-3 text-left">Uko yitabiriye</th>
                              <th className="p-3 text-left">Itariki</th>
                            </tr>
                          </thead>
                          <tbody>
                            {member.attendance.slice(0, 3).map((record) => (
                              <tr key={record._id} className="border-b">
                                <td className="p-3">{record.event?.title || "N/A"}</td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium
                                      ${record.status === "present"
                                        ? "bg-green-100 text-green-700"
                                        : "bg-red-100 text-red-700"
                                      }`}
                                  >
                                    {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                                  </span>
                                </td>
                                <td className="p-3 text-gray-500">
                                  {record.createdAt ? formatDate(record.createdAt) : "-"}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {member.attendance.length > 3 && (
                        <button
                          onClick={() => setSelectedMember(member)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-800 
                                   flex items-center gap-1"
                        >
                          Reba byose <FaChevronRight className="text-xs" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {searchTerm && selectedSubgroup && searchResults.length === 0 && !searchLoading && (
          <div className="mt-8 text-center py-12 bg-white rounded-2xl shadow">
            <FaUser className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500 text-sm sm:text-base">
              Nta munyamuryango wabonetse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Gerageza ukoresheje izina ritandukanye
            </p>
          </div>
        )}
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="px-4 sm:px-6 pb-16 sm:pb-20 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            Ibikorwa biri imbere
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Reba ibikorwa bigiye kubaho mu muryango
          </p>
        </div>

        {events.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <FaCalendarAlt className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Nta bikorwa biri imbere.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {events.map((event) => (
              <div
                key={event._id}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-xl 
                         transition-all duration-300 overflow-hidden transform hover:-translate-y-1
                         border border-gray-100"
              >
                <div className="h-2 bg-gradient-to-r from-blue-500 to-blue-600"></div>
                <div className="p-5 sm:p-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-blue-600 
                               transition-colors line-clamp-2">
                    {event.title}
                  </h4>
                  
                  <div className="flex items-center gap-2 text-blue-600 text-sm mb-4">
                    <FaCalendarAlt className="text-sm" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {event.description || "Nta bisobanuro byatanzwe"}
                  </p>

                  <button
                    onClick={() => navigate(`/events-public/${event._id}`)}
                    className="w-full bg-blue-50 text-blue-600 px-4 py-2 rounded-xl
                             hover:bg-blue-100 transition-colors text-sm font-medium
                             flex items-center justify-center gap-2 group"
                  >
                    <span>Reba ibisobanuro</span>
                    <FaArrowRight className="text-xs group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            to="/events-public"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors text-sm sm:text-base font-medium"
          >
            Reba ibikorwa byose
            <FaChevronRight className="text-xs" />
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section id="about" className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ibyerekeye Sisitemu
          </h3>
          <div className="w-20 h-1 bg-white/30 mx-auto mb-6"></div>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed max-w-3xl mx-auto">
            Iyi sisitemu yashyizweho kugirango ifashe gukurikirana abanyamuryango, 
            amakuru yabo, n'ibikorwa byabo by'umuryango witiriwe Mutagatifu Mariko.
            Mbere, kugenzura abanyamuryango no kubika amakuru byari inzira igoye 
            kandi itari yoroshye. Ku bitekerezo by'abakristu twashatse umutekinisiye 
            wubatse iyi sisitemu ikomeye, igamije gufasha abanyamuryango no koroshya 
            ubu buryo. Sisitemu igenewe abanyamuryango, abayobozi, ndetse n'abandi. 
            Twizeye ko muzayikoresha neza.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              Ohereza ubutumwa ku muyobozi
            </h3>
            <p className="text-gray-500 text-sm sm:text-base">
              Ufite ikibazo cyangwa igitekerezo? Twandikire!
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 max-w-xl mx-auto">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Name Input */}
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
                <input
                  type="text"
                  name="name"
                  placeholder="Izina ryawe"
                  value={contactData.name}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-sm sm:text-base"
                  required
                />
              </div>

              {/* Email Input */}
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={contactData.email}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-sm sm:text-base"
                />
              </div>

              {/* Phone Input */}
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefone"
                  value={contactData.phone}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl
                           focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                           text-sm sm:text-base"
                />
              </div>

              {/* Message Input */}
              <textarea
                name="message"
                placeholder="Ubutumwa bwawe..."
                value={contactData.message}
                onChange={handleContactChange}
                rows="4"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base resize-none"
                required
              />

              {/* Error Message */}
              {contactError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
                  <FaExclamationCircle className="text-red-500 text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-red-600 text-xs sm:text-sm">{contactError}</p>
                </div>
              )}

              {/* Success Message */}
              {successMsg && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                  <FaCheckCircle className="text-green-500 text-sm flex-shrink-0 mt-0.5" />
                  <p className="text-green-600 text-xs sm:text-sm">{successMsg}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                         text-white py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 
                         transition-all duration-300 transform hover:scale-[1.02]
                         text-sm sm:text-base font-medium shadow-md hover:shadow-lg
                         disabled:opacity-60 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Birimo koherezwa...
                  </>
                ) : (
                  "Ohereza Ubutumwa"
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-6 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs sm:text-sm text-gray-500">
            © {new Date().getFullYear()} Umuryango remezo witiriwe Mutagatifu Mariko
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Yubatswe na dev Uwayezu Kevin
          </p>
        </div>
      </footer>

      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-3 rounded-full
                 shadow-lg hover:bg-blue-700 transition-all duration-300
                 transform hover:scale-110 active:scale-95 z-50"
        aria-label="Back to top"
      >
        <FaArrowRight className="rotate-[-90deg]" />
      </button>
    </div>
  );
}