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
  FaLock,
  FaEye,
  FaEyeSlash
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

  // SAKRAMENTS STATE - FIXED: Added this missing state
  const [sakraments, setSakraments] = useState([]);

  // SELF-REGISTRATION STATES
  const [showRegistration, setShowRegistration] = useState(false);
  const [registerData, setRegisterData] = useState({
    fullName: "",
    nationalId: "",
    dateOfBirth: "",
    phone: "",
    gender: "",
    subgroup: "",
    sakraments: [],
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [registerValidation, setRegisterValidation] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  // FETCH SUBGROUPS AND SAKRAMENTS - FIXED: Added sakraments fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subgroupsRes, sakramentsRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments")
        ]);
        setSubgroups(subgroupsRes.data);
        setSakraments(sakramentsRes.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
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

  // Password strength checker
  useEffect(() => {
    const password = registerData.password;
    let strength = 0;
    
    if (password?.length >= 8) strength += 25;
    if (password?.match(/[a-z]/)) strength += 25;
    if (password?.match(/[A-Z]/)) strength += 25;
    if (password?.match(/[0-9]/)) strength += 15;
    if (password?.match(/[^a-zA-Z0-9]/)) strength += 10;
    
    setPasswordStrength(Math.min(strength, 100));
  }, [registerData.password]);

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
    setRegisterData(prev => ({ ...prev, [name]: value }));
    
    // Clear validation error for this field
    if (registerValidation[name]) {
      setRegisterValidation(prev => ({ ...prev, [name]: "" }));
    }
    if (registerError) setRegisterError("");
  };

  const handleRegisterBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateRegisterField(field, registerData[field]);
  };

  const validateRegisterField = (field, value) => {
    const errors = { ...registerValidation };
    
    switch(field) {
      case "fullName":
        if (!value?.trim()) {
          errors.fullName = "Amazina ni ngombwa";
        } else if (value.trim().length < 3) {
          errors.fullName = "Amazina agomba kuba byibura 3";
        }
        break;
        
      case "gender":
        if (!value) {
          errors.gender = "Igitsina ni ngombwa";
        }
        break;
        
      case "subgroup":
        if (!value) {
          errors.subgroup = "Umuryango remezo ni ngombwa";
        }
        break;
        
      case "phone":
        if (!value) {
          errors.phone = "Telefone ni ngombwa";
        } else if (!/^(\+250|0)7[0-9]{8}$/.test(value.replace(/\s/g, ''))) {
          errors.phone = "Telefone igomba gutangira na 07 cyangwa +2507";
        }
        break;
        
      case "email":
        if (!value) {
          errors.email = "Email ni ngombwa";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.email = "Email itari mu buryo bukwiriye";
        }
        break;
        
      case "password":
        if (!value) {
          errors.password = "Ijambobanga ni ngombwa";
        } else if (value.length < 6) {
          errors.password = "Ijambobanga rigomba kuba byibura 6";
        }
        break;
        
      case "confirmPassword":
        if (value !== registerData.password) {
          errors.confirmPassword = "Ijambobanga ntirihwanye";
        }
        break;
        
      case "nationalId":
        if (value && value.length < 16) {
          errors.nationalId = "Indangamuntu igomba kuba byibura 16";
        }
        break;
        
      default:
        break;
    }
    
    setRegisterValidation(errors);
    return !errors[field];
  };

  const validateRegisterForm = () => {
    const fields = ["fullName", "gender", "subgroup", "phone", "email", "password", "confirmPassword"];
    
    let isValid = true;
    fields.forEach(field => {
      if (!validateRegisterField(field, registerData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSakramentToggle = (id) => {
    setRegisterData(prev => ({
      ...prev,
      sakraments: prev.sakraments.includes(id)
        ? prev.sakraments.filter(s => s !== id)
        : [...prev.sakraments, id]
    }));
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(registerData).forEach(key => allTouched[key] = true);
    setTouchedFields(allTouched);
    
    if (!validateRegisterForm()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setRegisterLoading(true);
    setRegisterError("");

    try {
      // First create user account
      const userRes = await api.post("/users/register", {
        username: registerData.fullName,
        userphonenumber: registerData.phone,
        useremail: registerData.email,
        userpassword: registerData.password,
      });

      // Then create member profile linked to user
      const memberData = {
        fullName: registerData.fullName,
        nationalId: registerData.nationalId || undefined,
        dateOfBirth: registerData.dateOfBirth || undefined,
        phone: registerData.phone,
        gender: registerData.gender,
        subgroup: registerData.subgroup,
        sakraments: registerData.sakraments,
        category: "adult", // Default to adult for self-registration
        userId: userRes.data.userId, // Link to user account
      };

      await api.post("/members", memberData);
      
      setRegisterSuccess(true);
      
      // Reset form
      setRegisterData({
        fullName: "",
        nationalId: "",
        dateOfBirth: "",
        phone: "",
        gender: "",
        subgroup: "",
        sakraments: [],
        email: "",
        password: "",
        confirmPassword: "",
      });
      
      // Hide form after 3 seconds
      setTimeout(() => {
        setShowRegistration(false);
        setRegisterSuccess(false);
      }, 3000);
      
    } catch (err) {
      const message = err.response?.data?.message || 
                     err.response?.data?.errors?.map(e => e.msg).join(", ") ||
                     "Kwiyandikisha byanze. Ongera ugerageze.";
      setRegisterError(message);
    } finally {
      setRegisterLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
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
                onClick={() => setShowRegistration(!showRegistration)}
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
                // Scroll to registration form
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

      {/* SELF-REGISTRATION SECTION */}
      {showRegistration && (
        <section id="registration" className="px-4 sm:px-6 pb-16 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-green-200">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-3">
                  <FaUserPlus className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Kwiyandikisha</h3>
                  <p className="text-green-100 text-sm">Uzuza amakuru yawe wiyandikishe</p>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="p-6">
              {/* Success Message */}
              {registerSuccess && (
                <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
                  <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 font-medium">Kwiyandikisha byagenze neza!</p>
                    <p className="text-green-600 text-sm mt-1">Ubu ushobora kwinjira muri konti yawe.</p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {registerError && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <FaExclamationCircle className="text-red-500 text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 font-medium">Habayemo ikibazo</p>
                    <p className="text-red-600 text-sm mt-1">{registerError}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Amazina yose <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className={`absolute left-3 top-1/2 -translate-y-1/2 
                                        ${touchedFields.fullName && registerValidation.fullName 
                                          ? 'text-red-400' : 'text-green-600'}`} />
                      <input
                        type="text"
                        name="fullName"
                        value={registerData.fullName}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("fullName")}
                        placeholder="Andika amazina yose"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.fullName && registerValidation.fullName 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {touchedFields.fullName && registerValidation.fullName && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.fullName}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Igitsina <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <select
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("gender")}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.gender && registerValidation.gender 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      >
                        <option value="">Hitamo Igitsina</option>
                        <option value="male">Gabo</option>
                        <option value="female">Gore</option>
                      </select>
                    </div>
                    {touchedFields.gender && registerValidation.gender && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.gender}</p>
                    )}
                  </div>

                  {/* Subgroup */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Umuryango remezo <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <select
                        name="subgroup"
                        value={registerData.subgroup}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("subgroup")}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.subgroup && registerValidation.subgroup 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      >
                        <option value="">Hitamo Umuryango</option>
                        {subgroups.map(s => (
                          <option key={s._id} value={s._id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                    {touchedFields.subgroup && registerValidation.subgroup && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.subgroup}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <input
                        type="tel"
                        name="phone"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("phone")}
                        placeholder="07XXXXXXXX"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.phone && registerValidation.phone 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {touchedFields.phone && registerValidation.phone && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.phone}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <input
                        type="email"
                        name="email"
                        value={registerData.email}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("email")}
                        placeholder="email@example.com"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.email && registerValidation.email 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {touchedFields.email && registerValidation.email && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.email}</p>
                    )}
                  </div>

                  {/* National ID (Optional) */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Indangamuntu (Ntayo)
                    </label>
                    <div className="relative">
                      <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <input
                        type="text"
                        name="nationalId"
                        value={registerData.nationalId}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("nationalId")}
                        placeholder="Indangamuntu"
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.nationalId && registerValidation.nationalId 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                    </div>
                    {touchedFields.nationalId && registerValidation.nationalId && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.nationalId}</p>
                    )}
                  </div>

                  {/* Date of Birth (Optional) */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Itariki y'Amavuko (Ntayo)
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-600" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={registerData.dateOfBirth}
                        onChange={handleRegisterChange}
                        className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl
                                 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Ijambobanga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 
                                        ${touchedFields.password && registerValidation.password 
                                          ? 'text-red-400' : 'text-green-600'}`} />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("password")}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.password && registerValidation.password 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    
                    {/* Password Strength */}
                    {registerData.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1">
                          <div className={`flex-1 rounded-full ${
                            passwordStrength > 0 ? 'bg-red-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex-1 rounded-full ${
                            passwordStrength > 25 ? 'bg-yellow-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex-1 rounded-full ${
                            passwordStrength > 50 ? 'bg-blue-500' : 'bg-gray-200'
                          }`}></div>
                          <div className={`flex-1 rounded-full ${
                            passwordStrength > 75 ? 'bg-green-500' : 'bg-gray-200'
                          }`}></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {passwordStrength < 40 ? 'Ijambobanga rike' :
                           passwordStrength < 70 ? 'Ijambobanga ririmo' :
                           'Ijambobanga rikomeye'}
                        </p>
                      </div>
                    )}
                    
                    {touchedFields.password && registerValidation.password && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Emeza Ijambobanga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaLock className={`absolute left-3 top-1/2 -translate-y-1/2 
                                        ${touchedFields.confirmPassword && registerValidation.confirmPassword 
                                          ? 'text-red-400' : 'text-green-600'}`} />
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={registerData.confirmPassword}
                        onChange={handleRegisterChange}
                        onBlur={() => handleRegisterBlur("confirmPassword")}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-12 py-3 border-2 rounded-xl
                                  focus:outline-none focus:ring-2 focus:ring-green-500
                                  ${touchedFields.confirmPassword && registerValidation.confirmPassword 
                                    ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {touchedFields.confirmPassword && registerValidation.confirmPassword && (
                      <p className="text-red-500 text-xs mt-1">{registerValidation.confirmPassword}</p>
                    )}
                    {touchedFields.confirmPassword && registerData.confirmPassword && 
                     registerData.confirmPassword === registerData.password && !registerValidation.confirmPassword && (
                      <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                        <FaCheckCircle className="text-xs" />
                        Ijambobanga rirahwanye
                      </p>
                    )}
                  </div>
                </div>

                {/* Sakraments (Optional) */}
                {sakraments.length > 0 && (
                  <div className="border-2 border-gray-100 rounded-xl p-4 bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      <FaCross className="text-green-600" />
                      Amasakramentu (Ntayo)
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {sakraments.map(s => (
                        <button
                          type="button"
                          key={s._id}
                          onClick={() => handleSakramentToggle(s._id)}
                          className={`px-3 py-2 rounded-lg text-sm transition-all duration-200
                                    ${registerData.sakraments.includes(s._id)
                                      ? 'bg-green-600 text-white'
                                      : 'bg-white border-2 border-gray-200 text-gray-600 hover:border-green-400'}`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="submit"
                    disabled={registerLoading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-green-700 
                             text-white py-3 rounded-xl hover:from-green-700 
                             hover:to-green-800 transition-all duration-300
                             disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2 font-medium"
                  >
                    {registerLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Birimo kwiyandikisha...
                      </>
                    ) : (
                      <>
                        <FaUserPlus />
                        Kwiyandikisha
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowRegistration(false)}
                    className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 
                             transition-colors font-medium"
                  >
                    Gusiba
                  </button>
                </div>

                <p className="text-xs text-gray-400 text-center">
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

        {/* Search Results */}
        {searchResults.length > 0 && !searchLoading && (
          <div className="mt-8 space-y-4">
            {searchResults.map((member) => (
              <MemberCard
                key={member._id}
                member={member}
                onClick={() => navigate(`/members/public/${member._id}`)}
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

// Member Card Component
function MemberCard({ member, onClick }) {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer p-4 border border-gray-100"
    >
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
          <span className="text-blue-600 font-bold">{getInitials(member.fullName)}</span>
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{member.fullName}</h4>
          <p className="text-sm text-gray-500">{member.subgroup?.name || "Nta muryango"}</p>
        </div>
        <FaChevronRight className="text-gray-400" />
      </div>
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