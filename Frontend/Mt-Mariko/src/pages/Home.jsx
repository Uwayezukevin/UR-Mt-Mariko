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
  FaArrowRight,
  FaUserPlus,
  FaIdBadge,
  FaVenusMars,
  FaLayerGroup,
  FaUserCheck,
  FaUserTimes,
  FaChartLine
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
  const [expandedMember, setExpandedMember] = useState(null); // For toggling member details

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

  // SAKRAMENTS STATE
  const [sakraments, setSakraments] = useState([]);
  const [parents, setParents] = useState([]);

  // MEMBER REGISTRATION STATES
  const [showRegistration, setShowRegistration] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: "",
    category: "",
    nationalId: "",
    dateOfBirth: "",
    phone: "",
    parent: "",
    gender: "",
    subgroup: "",
    sakraments: [],
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

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

  // FETCH SUBGROUPS, SAKRAMENTS, AND PARENTS
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subgroupsRes, sakramentsRes, membersRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members")
        ]);

        setSubgroups(subgroupsRes.data);
        setSakraments(sakramentsRes.data);

        // Filter adult parents
        const adults = membersRes.data.filter(
          (member) => member.category === "adult"
        );
        setParents(adults);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  // AUTO SEARCH - Enhanced to fetch full member details including attendance and decision
  useEffect(() => {
    const searchMembers = async () => {
      if (!searchTerm || !selectedSubgroup) {
        setSearchResults([]);
        return;
      }
      
      setSearchLoading(true);
      try {
        // First get basic search results
        const searchRes = await api.get(
          `/members/search?name=${searchTerm}&subgroup=${selectedSubgroup}`
        );
        
        // For each member, fetch their attendance and decision data
        const membersWithDetails = await Promise.all(
          searchRes.data.map(async (member) => {
            try {
              const [attendanceRes, decisionRes] = await Promise.all([
                api.get(`/attendance/member/${member._id}`),
                api.get(`/decision/member/${member._id}`)
              ]);
              
              // Calculate stats
              const attendanceData = attendanceRes.data || [];
              const present = attendanceData.filter(a => a.status === "present").length;
              const absent = attendanceData.filter(a => a.status === "absent").length;
              
              return {
                ...member,
                attendance: attendanceData,
                decision: decisionRes.data || null,
                stats: {
                  present,
                  absent,
                  total: attendanceData.length
                }
              };
            } catch (err) {
              console.error(err);
              return {
                ...member,
                attendance: [],
                decision: null,
                stats: { present: 0, absent: 0, total: 0 }
              };
            }
          })
        );
        
        setSearchResults(membersWithDetails);
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
      
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch (err) {
      setContactError("Ntibyashoboye koherezwa ubutumwa. Ongera ugerageze.");
    } finally {
      setSending(false);
    }
  };

  // REGISTRATION HANDLERS
  const handleRegisterChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && value !== "child" ? { parent: "" } : {}),
    }));
  };

  const handleSakramentToggle = (id) => {
    setRegisterData((prev) => ({
      ...prev,
      sakraments: prev.sakraments.includes(id)
        ? prev.sakraments.filter((s) => s !== id)
        : [...prev.sakraments, id],
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!registerData.fullName?.trim()) {
      errors.fullName = "Amazina yose arakenewe";
    }
    if (!registerData.category) {
      errors.category = "Icyiciro kirakenewe";
    }
    if (!registerData.gender) {
      errors.gender = "Igitsina kirakenewe";
    }
    if (!registerData.subgroup) {
      errors.subgroup = "Umuryango remezo urakenewe";
    }
    if (registerData.category === "child" && !registerData.parent) {
      errors.parent = "Umubyeyi arakenewe ku mwana";
    }

    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setRegisterLoading(true);
    setRegisterError("");

    try {
      const payload = {
        fullName: registerData.fullName.trim(),
        category: registerData.category,
        gender: registerData.gender,
        ...(registerData.nationalId?.trim() ? { nationalId: registerData.nationalId.trim() } : {}),
        ...(registerData.dateOfBirth ? { dateOfBirth: registerData.dateOfBirth } : {}),
        ...(registerData.phone?.trim() ? { phone: registerData.phone.trim() } : {}),
        ...(registerData.category === "child" && registerData.parent
          ? { parent: registerData.parent }
          : {}),
        ...(registerData.subgroup ? { subgroup: registerData.subgroup } : {}),
        ...(registerData.sakraments.length > 0
          ? { sakraments: registerData.sakraments }
          : {}),
      };

      await api.post("/members", payload);
      setRegisterSuccess(true);
      
      setRegisterData({
        fullName: "",
        category: "",
        nationalId: "",
        dateOfBirth: "",
        phone: "",
        parent: "",
        gender: "",
        subgroup: "",
        sakraments: [],
      });
      
      setTimeout(() => {
        setShowRegistration(false);
        setRegisterSuccess(false);
      }, 3000);
      
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        err.response?.data?.message ||
        "Kwiyandikisha byanze";

      setRegisterError(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setRegisterLoading(false);
    }
  };

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

  const getAttendancePercentage = (stats) => {
    if (stats.total === 0) return 0;
    return Math.round((stats.present / stats.total) * 100);
  };

  const toggleMemberDetails = (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
    }
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
                Umuryangoremezo Mutagatifu Mariko
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
                onClick={() => {
                  setShowRegistration(!showRegistration);
                  setTimeout(() => {
                    document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 
                         transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg
                         flex items-center gap-2"
              >
                <FaUserPlus />
                Kwiyandikisha
              </button>
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
          <div className="md:hidden bg-white shadow-lg border-t border-blue-100">
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
            <div className="px-6 py-3 border-t border-blue-100 space-y-2">
              <button
                onClick={() => {
                  setShowRegistration(!showRegistration);
                  setMenuOpen(false);
                }}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg 
                         hover:bg-green-700 transition-colors text-sm font-medium
                         flex items-center justify-center gap-2"
              >
                <FaUserPlus />
                Kwiyandikisha
              </button>
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
            <button
              onClick={() => {
                setShowRegistration(true);
                setTimeout(() => {
                  document.getElementById('registration')?.scrollIntoView({ behavior: 'smooth' });
                }, 100);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 
                       transition-all duration-300 transform hover:scale-105
                       text-sm sm:text-base font-medium shadow-md hover:shadow-lg
                       flex items-center justify-center gap-2"
            >
              <FaUserPlus />
              Kwiyandikisha ubu
            </button>
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
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-12 flex justify-center gap-4">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse delay-200"></div>
        </div>
      </section>

      {/* MEMBER REGISTRATION SECTION */}
      {showRegistration && (
        <section id="registration" className="px-4 sm:px-6 pb-16 max-w-2xl mx-auto">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl 
                        transition-shadow duration-300 overflow-hidden border-2 border-green-200">
            
            {/* Header with gradient */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                Kwiyandikisha nk'Umunyamuryango
              </h1>
              <p className="text-green-100 text-xs sm:text-sm text-center mt-1">
                Uzuza neza amakuru yawe wiyandikishe
              </p>
            </div>

            {/* Form Container */}
            <div className="p-4 sm:p-6 md:p-8">
              
              {/* Success Message */}
              {registerSuccess && (
                <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 
                              rounded-lg p-3 sm:p-4 flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 text-sm sm:text-base font-medium">
                      Kwiyandikisha byagenze neza!
                    </p>
                    <p className="text-green-600 text-xs sm:text-sm mt-1">
                      Ubu uri umunyamuryango w'umuryango.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {registerError && (
                <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 
                              rounded-lg p-3 sm:p-4 flex items-start gap-3">
                  <FaExclamationCircle className="text-red-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm sm:text-base font-medium">
                      Habayemo ikibazo
                    </p>
                    <p className="text-red-600 text-xs sm:text-sm mt-1">{registerError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-4 sm:space-y-5" autoComplete="off">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Amazina yose <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-green-400 text-sm sm:text-base" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Andika amazina yose"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base transition-all
                                 ${validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Icyiciro <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-green-400 text-sm sm:text-base" />
                    <select
                      name="category"
                      value={registerData.category}
                      onChange={handleRegisterChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Hitamo Icyiciro</option>
                      <option value="child">Umwana</option>
                      <option value="youth">Urubyiruko</option>
                      <option value="adult">Umukuru</option>
                    </select>
                  </div>
                  {validationErrors.category && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                  )}
                </div>

                {/* Parent - Conditional */}
                {registerData.category === "child" && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Umubyeyi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 
                                        text-green-400 text-sm sm:text-base" />
                      <select
                        name="parent"
                        value={registerData.parent}
                        onChange={handleRegisterChange}
                        required
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                   border rounded-lg sm:rounded-xl 
                                   focus:ring-2 focus:ring-green-500 focus:border-green-500
                                   text-sm sm:text-base appearance-none bg-white
                                   ${validationErrors.parent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                      >
                        <option value="">Hitamo Umubyeyi</option>
                        {parents.length === 0 ? (
                          <option value="" disabled>Nta babyeyi babonetse</option>
                        ) : (
                          parents.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.fullName}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                    {validationErrors.parent && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.parent}</p>
                    )}
                  </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  
                  {/* National ID */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Indangamuntu
                    </label>
                    <div className="relative">
                      <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 
                                          text-green-400 text-sm sm:text-base" />
                      <input
                        type="text"
                        name="nationalId"
                        placeholder="Indangamuntu"
                        value={registerData.nationalId}
                        onChange={handleRegisterChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border border-gray-200 rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Telefoni
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 
                                        text-green-400 text-sm sm:text-base" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0788 123 456"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border border-gray-200 rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base transition-all"
                      />
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Itariki y'Amavuko
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 
                                              text-green-400 text-sm sm:text-base" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={registerData.dateOfBirth}
                        onChange={handleRegisterChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border border-gray-200 rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base transition-all"
                      />
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Igitsina <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 
                                            text-green-400 text-sm sm:text-base" />
                      <select
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                        required
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                   border rounded-lg sm:rounded-xl 
                                   focus:ring-2 focus:ring-green-500 focus:border-green-500
                                   text-sm sm:text-base appearance-none bg-white
                                   ${validationErrors.gender ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                      >
                        <option value="">Hitamo Igitsina</option>
                        <option value="male">Gabo</option>
                        <option value="female">Gore</option>
                      </select>
                    </div>
                    {validationErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Subgroup */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Umuryango Remezo <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 
                                            text-green-400 text-sm sm:text-base" />
                    <select
                      name="subgroup"
                      value={registerData.subgroup}
                      onChange={handleRegisterChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-green-500 focus:border-green-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.subgroup ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Hitamo Umuryango Remezo</option>
                      {subgroups.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {validationErrors.subgroup && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.subgroup}</p>
                  )}
                </div>

                {/* Sakraments */}
                <div className="space-y-2 sm:space-y-3">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Amasakramentu
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sakraments.map((s) => (
                      <button
                        type="button"
                        key={s._id}
                        onClick={() => handleSakramentToggle(s._id)}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full 
                                   border-2 transition-all duration-200 font-medium
                                   ${registerData.sakraments.includes(s._id)
                                     ? 'bg-green-600 text-white border-green-600 hover:bg-green-700'
                                     : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600'
                                   }`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={registerLoading || registerSuccess}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 
                             text-white py-3.5 sm:py-4 rounded-lg sm:rounded-xl 
                             hover:from-green-700 hover:to-green-800 
                             transition-all duration-300 transform hover:scale-[1.02]
                             text-sm sm:text-base font-medium
                             disabled:opacity-60 disabled:cursor-not-allowed
                             disabled:hover:scale-100 shadow-md hover:shadow-lg"
                  >
                    {registerLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 
                                      border-2 border-white border-t-transparent"></div>
                        Turimo kwiyandikisha...
                      </span>
                    ) : (
                      "Kwiyandikisha"
                    )}
                  </button>
                </div>

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 
                           transition-colors mt-2"
                >
                  Gusiba
                </button>

                {/* Required Fields Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  <span className="text-red-500">*</span> Ibyanditswe n'inyuguti zitukura birakenewe
                </p>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH MEMBERS SECTION */}
      <section id="search" className="px-4 sm:px-6 pb-16 max-w-5xl mx-auto">
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

        {/* Search Results - Enhanced with full member details */}
        {searchResults.length > 0 && !searchLoading && (
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-semibold text-blue-600 mb-4">
              Abanyamuryango babonetse ({searchResults.length})
            </h4>
            {searchResults.map((member) => (
              <MemberDetailsCard
                key={member._id}
                member={member}
                isExpanded={expandedMember === member._id}
                onToggle={() => toggleMemberDetails(member._id)}
                formatDate={formatDate}
                getAttendancePercentage={getAttendancePercentage}
              />
            ))}
          </div>
        )}

        {/* No Results */}
        {searchTerm && selectedSubgroup && searchResults.length === 0 && !searchLoading && (
          <div className="mt-8 text-center py-8 bg-white rounded-2xl shadow">
            <FaUser className="text-gray-300 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">Nta munyamuryango wabonetse</p>
          </div>
        )}
      </section>

      {/* EVENTS SECTION */}
      <section id="events" className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
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
              <EventCard
                key={event._id}
                event={event}
                onClick={() => navigate(`/events-public/${event._id}`)}
              />
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

// Enhanced Member Details Card Component
function MemberDetailsCard({ member, isExpanded, onToggle, formatDate, getAttendancePercentage }) {
  const translateCategory = (category) => {
    if (category === "child") return "Umwana";
    if (category === "youth") return "Urubyiruko";
    if (category === "adult") return "Umukuru";
    return category;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100">
      {/* Header - Always visible */}
      <div 
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${member.decision?.status === "ACTIVE" 
                          ? "bg-green-100" 
                          : member.decision?.status === "INACTIVE"
                          ? "bg-red-100"
                          : "bg-blue-100"}`}>
            <span className={`font-bold ${
              member.decision?.status === "ACTIVE" 
                ? "text-green-600" 
                : member.decision?.status === "INACTIVE"
                ? "text-red-600"
                : "text-blue-600"
            }`}>
              {getInitials(member.fullName)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-800">{member.fullName}</h4>
                <p className="text-sm text-gray-500">
                  {member.subgroup?.name || "Nta muryango"} • {translateCategory(member.category)}
                </p>
              </div>
              <FaChevronRight className={`text-gray-400 transition-transform duration-300 
                                         ${isExpanded ? 'rotate-90' : ''}`} />
            </div>
          </div>
        </div>

        {/* Quick Stats - Always visible */}
        {member.decision && (
          <div className="mt-3 flex items-center gap-3">
            <div className={`px-3 py-1 rounded-full text-xs font-medium
                          ${member.decision.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                          }`}>
              {member.decision.status === "ACTIVE" ? "Aritabira" : "Ntiyitabira"} • {member.decision.attendancePercentage}%
            </div>
            <div className="text-xs text-gray-500">
              Yitabiriye: {member.stats?.present || 0}/{member.stats?.total || 0}
            </div>
          </div>
        )}
      </div>

      {/* Expanded Details - Similar to MemberDetails but without edit button */}
      {isExpanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50">
          {/* Personal Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <FaVenusMars className="text-blue-600 text-lg" />
              <div>
                <p className="text-xs text-gray-500">Igitsina</p>
                <p className="text-sm font-medium capitalize">
                  {member.gender === 'male' ? 'Gabo' : member.gender === 'female' ? 'Gore' : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <FaPhone className="text-blue-600 text-lg" />
              <div>
                <p className="text-xs text-gray-500">Telefone</p>
                <p className="text-sm font-medium">
                  {member.phone || "Nta telefone"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <FaCalendarAlt className="text-blue-600 text-lg" />
              <div>
                <p className="text-xs text-gray-500">Itariki y'amavuko</p>
                <p className="text-sm font-medium">
                  {member.dateOfBirth ? formatDate(member.dateOfBirth) : "Nta tariki"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-white rounded-xl">
              <FaLayerGroup className="text-blue-600 text-lg" />
              <div>
                <p className="text-xs text-gray-500">Umuryango remezo</p>
                <p className="text-sm font-medium">
                  {member.subgroup?.name || "Nta tsinda"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white rounded-xl sm:col-span-2">
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

            {member.category === "child" && member.parent && (
              <div className="flex items-center gap-3 p-3 bg-white rounded-xl sm:col-span-2">
                <FaUser className="text-blue-600 text-lg" />
                <div>
                  <p className="text-xs text-gray-500">Umubyeyi</p>
                  <p className="text-sm font-medium">{member.parent.fullName}</p>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="mb-4">
            <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <FaChartLine className="text-blue-600" />
              Ibarurishamibare
            </h5>
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{member.stats?.total || 0}</p>
                <p className="text-xs text-gray-500">Yose</p>
              </div>
              <div className="text-center p-2 bg-green-50 rounded-lg">
                <p className="text-lg font-bold text-green-600">{member.stats?.present || 0}</p>
                <p className="text-xs text-gray-500">Yitabiriye</p>
              </div>
              <div className="text-center p-2 bg-red-50 rounded-lg">
                <p className="text-lg font-bold text-red-600">{member.stats?.absent || 0}</p>
                <p className="text-xs text-gray-500">Ntiyitabiriye</p>
              </div>
            </div>

            {/* Progress Bar */}
            {member.stats?.total > 0 && (
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-600 mb-1">
                  <span>Kwitabira: {getAttendancePercentage(member.stats)}%</span>
                  <span>{member.stats.present}/{member.stats.total}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 rounded-full transition-all duration-500"
                    style={{ width: `${getAttendancePercentage(member.stats)}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Attendance History */}
          {member.attendance?.length > 0 && (
            <div>
              <h5 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FaUserCheck className="text-blue-600" />
                Amateka yo kwitabira
              </h5>
              
              {/* Mobile View */}
              <div className="block sm:hidden space-y-2">
                {member.attendance.slice(0, 3).map((record) => (
                  <div key={record._id} className="bg-white rounded-lg p-3">
                    <p className="font-medium text-sm">{record.event?.title || "Igikorwa"}</p>
                    <div className="flex justify-between items-center mt-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium
                        ${record.status === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                        }`}>
                        {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {record.createdAt ? formatDate(record.createdAt) : "-"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop View */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Igikorwa</th>
                      <th className="p-2 text-left">Uko yitabiriye</th>
                      <th className="p-2 text-left">Itariki</th>
                    </tr>
                  </thead>
                  <tbody>
                    {member.attendance.slice(0, 5).map((record) => (
                      <tr key={record._id} className="border-b">
                        <td className="p-2">{record.event?.title || "Igikorwa"}</td>
                        <td className="p-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium
                            ${record.status === "present"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                            }`}>
                            {record.status === "present" ? "Yitabiriye" : "Ntiyitabiriye"}
                          </span>
                        </td>
                        <td className="p-2 text-gray-500">
                          {record.createdAt ? formatDate(record.createdAt) : "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {member.attendance.length > 5 && (
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ... n'indi {member.attendance.length - 5}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Event Card Component
function EventCard({ event, onClick }) {
  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString('rw-TZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-5 border border-gray-100"
    >
      <h4 className="font-semibold text-gray-800 mb-2 line-clamp-2">{event.title}</h4>
      <div className="flex items-center gap-2 text-blue-600 text-sm mb-3">
        <FaCalendarAlt />
        {formatDate(event.date)}
      </div>
      <p className="text-gray-600 text-sm line-clamp-2">
        {event.description || "Nta bisobanuro"}
      </p>
    </div>
  );
}