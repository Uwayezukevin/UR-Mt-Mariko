import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios"; // ✅ Make sure this is imported
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
  FaChartLine,
  FaHeartbeat,
  FaSkull,
  FaTruck,
  FaRing,
  FaChild,
  FaUserGraduate,
  FaUserFriends,
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
  const [expandedMember, setExpandedMember] = useState(null);

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
  const [allParents, setAllParents] = useState([]);
  const [members, setMembers] = useState([]);
  const [marriageSakramentId, setMarriageSakramentId] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

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
    spouse: "",
    accessibility: "alive",
    accessibilityNotes: "",
    isActive: true,
  });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [showSpouse, setShowSpouse] = useState(false);

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
        const res = await api.get("/events").catch((err) => {
          console.warn("Events fetch failed:", err.response?.status);
          return { data: [] };
        });
        const upcoming = (res.data || [])
          .filter((e) => new Date(e.date) >= new Date())
          .sort((a, b) => new Date(a.date) - new Date(b.date));
        setEvents(upcoming.slice(0, 3));
      } catch (err) {
        console.error("Error fetching events:", err);
      }
    };
    fetchEvents();
  }, []);

  // FETCH SUBGROUPS, SAKRAMENTS, AND MEMBERS - USING AXIOS DIRECTLY (NO AUTH)
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("📡 Fetching public data...");

        // Use direct axios for public data (no auth required)
        const [subgroupsRes, sakramentsRes, membersRes] = await Promise.all([
          axios.get(
            "https://ur-mt-mariko.onrender.com/umuryangoremezo/backend/subgroups",
          ),
          axios.get(
            "https://ur-mt-mariko.onrender.com/umuryangoremezo/backend/sakraments",
          ),
          axios.get(
            "https://ur-mt-mariko.onrender.com/umuryangoremezo/backend/members",
          ),
        ]);

        console.log("Subgroups response:", subgroupsRes.data);
        console.log("Sakraments response:", sakramentsRes.data);
        console.log("Members response:", membersRes.data);

        // Set data
        setSubgroups(Array.isArray(subgroupsRes.data) ? subgroupsRes.data : []);
        setSakraments(
          Array.isArray(sakramentsRes.data) ? sakramentsRes.data : [],
        );

        let membersData = [];
        if (Array.isArray(membersRes.data)) {
          membersData = membersRes.data;
        } else if (
          membersRes.data?.members &&
          Array.isArray(membersRes.data.members)
        ) {
          membersData = membersRes.data.members;
        }
        setMembers(membersData);

        // Find marriage sakrament ID
        const marriage = sakramentsRes.data?.find(
          (s) => s.name === "Ugushyingirwa",
        );
        if (marriage) {
          setMarriageSakramentId(marriage._id);
        }

        // Set parents
        const adults = membersData.filter((m) => m.category === "adult");
        setParents(adults);

        const potentialParents = membersData.filter(
          (m) => m.category === "adult" || m.category === "youth",
        );
        setAllParents(potentialParents);

        setDataLoaded(true);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        console.error(
          "Error details:",
          err.response?.status,
          err.response?.data,
        );
        setDataLoaded(true); // Still show UI even if data fails
      }
    };

    fetchData();
  }, []);

  // Check if marriage sakrament is selected
  const isMarriageSakramentSelected = () => {
    return (
      marriageSakramentId &&
      registerData.sakraments.includes(marriageSakramentId)
    );
  };

  // Update spouse field visibility when sakraments change
  useEffect(() => {
    setShowSpouse(isMarriageSakramentSelected());
    // Clear spouse if marriage is deselected
    if (!isMarriageSakramentSelected() && registerData.spouse) {
      setRegisterData((prev) => ({ ...prev, spouse: "" }));
    }
  }, [registerData.sakraments, marriageSakramentId]);

  // AUTO SEARCH - Using api (with auth if available)
  useEffect(() => {
    const searchMembers = async () => {
      if (!searchTerm || !selectedSubgroup) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const searchRes = await api
          .get(
            `/members/search?name=${searchTerm}&subgroup=${selectedSubgroup}`,
          )
          .catch((err) => {
            console.warn("Search failed:", err.response?.status);
            return { data: [] };
          });

        const membersWithDetails = await Promise.all(
          (searchRes.data || []).map(async (member) => {
            try {
              const [attendanceRes, decisionRes] = await Promise.all([
                api
                  .get(`/attendance/member/${member._id}`)
                  .catch(() => ({ data: [] })),
                api
                  .get(`/decision/member/${member._id}`)
                  .catch(() => ({ data: null })),
              ]);

              const attendanceData = attendanceRes.data || [];
              const present = attendanceData.filter(
                (a) => a.status === "present",
              ).length;
              const absent = attendanceData.filter(
                (a) => a.status === "absent",
              ).length;

              return {
                ...member,
                attendance: attendanceData,
                decision: decisionRes.data || null,
                stats: {
                  present,
                  absent,
                  total: attendanceData.length,
                },
                accessibility: member.accessibility || "alive",
                accessibilityNotes: member.accessibilityNotes || "",
              };
            } catch (err) {
              console.error(err);
              return {
                ...member,
                attendance: [],
                decision: null,
                stats: { present: 0, absent: 0, total: 0 },
                accessibility: member.accessibility || "alive",
                accessibilityNotes: member.accessibilityNotes || "",
              };
            }
          }),
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
      await axios.post(
        "https://ur-mt-mariko.onrender.com/messages/send",
        contactData,
      );
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
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setRegisterData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "category") {
        updated.parent = "";
      }

      if (name === "accessibility") {
        setShowNotes(value !== "alive");
        if (value === "dead" || value === "moved") {
          updated.isActive = false;
        } else if (value === "alive") {
          updated.isActive = true;
        }
      }

      return updated;
    });
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

    // Parent validation - required for child and youth
    if (
      registerData.category &&
      registerData.category !== "adult" &&
      !registerData.parent
    ) {
      errors.parent =
        registerData.category === "child"
          ? "Umwana agomba kugira umubyeyi"
          : "Urubyiruko rugomba kugira umubyeyi";
    }

    // Spouse validation - only if marriage is selected
    if (showSpouse && !registerData.spouse) {
      errors.spouse = "Ugomba gushyiraho uwo mwashyingiranywe";
    }

    // Accessibility notes validation
    if (
      registerData.accessibility !== "alive" &&
      !registerData.accessibilityNotes?.trim()
    ) {
      errors.accessibilityNotes = "Andika impamvu y'ihinduka ry'ikimezo";
    }

    // National ID validation
    if (registerData.nationalId && registerData.nationalId.trim()) {
      const nationalIdRegex = /^[0-9]{16}$/;
      if (!nationalIdRegex.test(registerData.nationalId.trim())) {
        errors.nationalId = "Indangamuntu igomba kuba imibare 16";
      }
    }

    // Phone validation
    if (registerData.phone && registerData.phone.trim()) {
      const phoneRegex = /^(\+2507|07)[0-9]{8}$/;
      if (!phoneRegex.test(registerData.phone.trim())) {
        errors.phone =
          "Telefoni igomba kuba iy'u Rwanda (ex: 0788123456 cyangwa +250788123456)";
      }
    }

    return errors;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setRegisterLoading(true);
    setRegisterError("");

    try {
      // Build payload - only include fields that have values
      const payload = {
        fullName: registerData.fullName.trim(),
        category: registerData.category,
        gender: registerData.gender,
        accessibility: registerData.accessibility,
        isActive: registerData.isActive,
      };

      // Only add optional fields if they have values
      if (registerData.subgroup) {
        payload.subgroup = registerData.subgroup;
      }

      if (registerData.nationalId?.trim()) {
        payload.nationalId = registerData.nationalId.trim();
      }

      if (registerData.dateOfBirth) {
        payload.dateOfBirth = registerData.dateOfBirth;
      }

      if (registerData.phone?.trim()) {
        payload.phone = registerData.phone.trim();
      }

      if (registerData.sakraments.length > 0) {
        payload.sakraments = registerData.sakraments;
      }

      if (registerData.accessibilityNotes?.trim()) {
        payload.accessibilityNotes = registerData.accessibilityNotes.trim();
      }

      // Add parent - ONLY for non-adult categories
      if (registerData.category !== "adult" && registerData.parent) {
        payload.parent = registerData.parent;
      }

      // Add spouse if marriage is selected AND spouse is selected
      if (showSpouse && registerData.spouse) {
        payload.spouse = registerData.spouse;
      }

      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));

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
        spouse: "",
        accessibility: "alive",
        accessibilityNotes: "",
        isActive: true,
      });

      setTimeout(() => {
        setShowRegistration(false);
        setRegisterSuccess(false);
      }, 3000);
    } catch (err) {
      console.error("❌ Error creating member:", err);

      let errorMessage = "Kwiyandikisha byanze. Ongera ugerageze.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors
          .map((e) => e.msg || e.message)
          .join(", ");
      }

      if (
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.includes("Indangamuntu")
      ) {
        errorMessage = "Indangamuntu isanzwe ikoreshwa n'undi muntu";
      }

      setRegisterError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setRegisterLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    try {
      if (!dateStr) return "-";
      const date = new Date(dateStr);
      return date.toLocaleDateString("rw-TZ", {
        year: "numeric",
        month: "long",
        day: "numeric",
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

  const getParentOptions = () => {
    if (registerData.category === "child") {
      return allParents;
    } else if (registerData.category === "youth") {
      return parents;
    } else if (registerData.category === "adult") {
      return allParents;
    }
    return [];
  };

  const getPotentialSpouses = () => {
    if (!registerData.gender) return [];
    const oppositeGender = registerData.gender === "male" ? "female" : "male";
    return members.filter(
      (m) =>
        m.gender === oppositeGender &&
        m.accessibility === "alive" &&
        m.category === "adult" &&
        !m.spouse,
    );
  };

  // Show loading indicator while data is being fetched
  if (!dataLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">
            Turimo gutegura...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen scroll-smooth">
      {/* NAVBAR */}
      <nav className="bg-white/95 backdrop-blur-sm shadow-lg fixed top-0 left-0 w-full z-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center">
              <FaChurch className="text-blue-600 text-xl sm:text-2xl mr-2" />
              <h1 className="text-sm sm:text-base md:text-lg font-bold text-blue-600 truncate max-w-[200px] sm:max-w-none">
                Umuryangoremezo Mutagatifu Mariko
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-6 text-gray-700">
              <a
                href="#home"
                className="hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Ahabanza
              </a>
              <a
                href="#about"
                className="hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Ibyerekeye
              </a>
              <a
                href="#contact"
                className="hover:text-blue-600 transition-colors text-sm font-medium"
              >
                Twandikire
              </a>
              <button
                onClick={() => {
                  setShowRegistration(!showRegistration);
                  setTimeout(() => {
                    document
                      .getElementById("registration")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <FaUserPlus /> Kwiyandikisha
              </button>
              <button
                onClick={() => navigate("/login")}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium shadow-md hover:shadow-lg"
              >
                Injira
              </button>
              <div className="flex items-center gap-2 text-sm bg-blue-50 px-3 py-1.5 rounded-full">
                <FaClock className="text-blue-600" />
                <span className="font-medium text-gray-700">
                  {time.toLocaleTimeString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden text-blue-600 text-xl p-2 hover:bg-blue-50 rounded-lg transition-colors"
            >
              {menuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden bg-white shadow-lg border-t border-blue-100">
            <a
              href="#home"
              className="block px-6 py-3 hover:bg-blue-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Ahabanza
            </a>
            <a
              href="#about"
              className="block px-6 py-3 hover:bg-blue-50 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              Ibyerekeye
            </a>
            <a
              href="#contact"
              className="block px-6 py-3 hover:bg-blue-50 transition-colors"
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
                className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
              >
                <FaUserPlus /> Kwiyandikisha
              </button>
              <button
                onClick={() => {
                  navigate("/login");
                  setMenuOpen(false);
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Injira
              </button>
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
            Kugenzura abakristu, gukurikirana kwitabira ibikorwa, no kumenya
            amakuru y'ibikorwa biri imbere by'umuryango witiriwe Mutagatifu
            Mariko.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => {
                setShowRegistration(true);
                setTimeout(() => {
                  document
                    .getElementById("registration")
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FaUserPlus /> Kwiyandikisha ubu
            </button>
            <a
              href="#search"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-sm sm:text-base font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <FaSearch /> Shakisha Umukristu
            </a>
          </div>
        </div>
      </section>

      {/* MEMBER REGISTRATION SECTION */}
      {showRegistration && (
        <section
          id="registration"
          className="px-4 sm:px-6 pb-16 max-w-2xl mx-auto"
        >
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border-2 border-green-200">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FaChurch className="text-white text-2xl sm:text-3xl" />
                <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                  Kwiyandikisha nk'Umukristu
                </h1>
              </div>
              <p className="text-green-100 text-xs sm:text-sm text-center">
                Uzuza neza amakuru yawe wiyandikishe
              </p>
            </div>

            <div className="p-4 sm:p-6 md:p-8">
              {registerSuccess && (
                <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 animate-fade-in">
                  <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-green-700 text-sm sm:text-base font-medium">
                      Kwiyandikisha byagenze neza!
                    </p>
                    <p className="text-green-600 text-xs sm:text-sm mt-1">
                      Ubu uri Umukristu w'umuryango.
                    </p>
                  </div>
                </div>
              )}

              {registerError && (
                <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3">
                  <FaExclamationCircle className="text-red-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-700 text-sm sm:text-base font-medium">
                      Habayemo ikibazo
                    </p>
                    <p className="text-red-600 text-xs sm:text-sm mt-1">
                      {registerError}
                    </p>
                  </div>
                </div>
              )}

              <form
                onSubmit={handleRegisterSubmit}
                className="space-y-4 sm:space-y-5"
                autoComplete="off"
              >
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Amazina yose <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Andika amazina yose"
                      value={registerData.fullName}
                      onChange={handleRegisterChange}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base transition-all ${validationErrors.fullName ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                    />
                  </div>
                  {validationErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.fullName}
                    </p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Icyiciro <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                    <select
                      name="category"
                      value={registerData.category}
                      onChange={handleRegisterChange}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base appearance-none bg-white ${validationErrors.category ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                    >
                      <option value="">Hitamo Icyiciro</option>
                      <option value="child">Umwana</option>
                      <option value="youth">Urubyiruko</option>
                      <option value="adult">Umukuru</option>
                    </select>
                  </div>
                  {validationErrors.category && (
                    <p className="text-red-500 text-xs mt-1">
                      {validationErrors.category}
                    </p>
                  )}
                </div>

                {/* Parent */}
                {registerData.category && (
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Umubyeyi
                      {registerData.category !== "adult" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      {registerData.category === "adult" && (
                        <span className="text-xs text-gray-400 ml-2">
                          (Ntayo)
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <select
                        name="parent"
                        value={registerData.parent}
                        onChange={handleRegisterChange}
                        required={registerData.category !== "adult"}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base appearance-none bg-white ${validationErrors.parent ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      >
                        <option value="">
                          {registerData.category === "adult"
                            ? "Hitamo Umubyeyi (Ntawe)"
                            : `Hitamo Umubyeyi w'${registerData.category === "child" ? "Umwana" : "Umukristu"}`}
                        </option>
                        {getParentOptions().map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.fullName} (
                            {p.category === "adult" ? "Umukuru" : "Urubyiruko"})
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.parent && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.parent}
                      </p>
                    )}
                  </div>
                )}

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Indangamuntu
                    </label>
                    <div className="relative">
                      <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <input
                        type="text"
                        name="nationalId"
                        placeholder="Indangamuntu (imibare 16)"
                        value={registerData.nationalId}
                        onChange={handleRegisterChange}
                        maxLength="16"
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base transition-all ${validationErrors.nationalId ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      />
                    </div>
                    {validationErrors.nationalId && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.nationalId}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Telefoni
                    </label>
                    <div className="relative">
                      <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <input
                        type="tel"
                        name="phone"
                        placeholder="0788 123 456"
                        value={registerData.phone}
                        onChange={handleRegisterChange}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base transition-all ${validationErrors.phone ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.phone}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Itariki y'Amavuko
                    </label>
                    <div className="relative">
                      <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <input
                        type="date"
                        name="dateOfBirth"
                        value={registerData.dateOfBirth}
                        onChange={handleRegisterChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Igitsina <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <select
                        name="gender"
                        value={registerData.gender}
                        onChange={handleRegisterChange}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base appearance-none bg-white ${validationErrors.gender ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      >
                        <option value="">Hitamo Igitsina</option>
                        <option value="male">Gabo</option>
                        <option value="female">Gore</option>
                      </select>
                    </div>
                    {validationErrors.gender && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.gender}
                      </p>
                    )}
                  </div>
                </div>

                {/* Subgroup */}
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Umuryango Remezo{" "}
                    <span className="text-gray-400 text-xs">(Ntayo)</span>
                  </label>
                  <div className="relative">
                    <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                    <select
                      name="subgroup"
                      value={registerData.subgroup}
                      onChange={handleRegisterChange}
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base appearance-none bg-white"
                    >
                      <option value="">Hitamo Umuryango Remezo (Ntayo)</option>
                      {subgroups.map((s) => (
                        <option key={s._id} value={s._id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-gray-400 text-xs">
                    Iki gice ni uguhitamo gusa
                  </p>
                </div>

                {/* Spouse Field */}
                {showSpouse && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Uwo mwashyingiranywe{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaRing className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 text-sm sm:text-base" />
                      <select
                        name="spouse"
                        value={registerData.spouse}
                        onChange={handleRegisterChange}
                        className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base appearance-none bg-white ${validationErrors.spouse ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      >
                        <option value="">Hitamo uwo mwashyingiranywe</option>
                        {getPotentialSpouses().map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName} (
                            {s.gender === "male" ? "Gabo" : "Gore"})
                          </option>
                        ))}
                      </select>
                    </div>
                    {validationErrors.spouse && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.spouse}
                      </p>
                    )}
                  </div>
                )}

                {/* Accessibility Status */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Icyemezo cy'Umukristu{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      {
                        value: "alive",
                        label: "Ariho",
                        icon: <FaHeartbeat />,
                        bgColor: "bg-green-50",
                        borderColor: "border-green-500",
                        textColor: "text-green-700",
                      },
                      {
                        value: "dead",
                        label: "Yitabye Imana",
                        icon: <FaSkull />,
                        bgColor: "bg-gray-50",
                        borderColor: "border-gray-500",
                        textColor: "text-gray-700",
                      },
                      {
                        value: "moved",
                        label: "Yimukiye ahandi",
                        icon: <FaTruck />,
                        bgColor: "bg-orange-50",
                        borderColor: "border-orange-500",
                        textColor: "text-orange-700",
                      },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleRegisterChange({
                            target: {
                              name: "accessibility",
                              value: option.value,
                            },
                          })
                        }
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${registerData.accessibility === option.value ? `${option.bgColor} ${option.borderColor} ${option.textColor}` : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"}`}
                      >
                        <span className="text-lg">{option.icon}</span>
                        <span className="text-xs font-medium">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility Notes */}
                {showNotes && (
                  <div className="space-y-1 animate-fade-in">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Impamvu y'ihinduka <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaInfoCircle
                        className={`absolute left-3 top-3 text-sm sm:text-base ${validationErrors.accessibilityNotes ? "text-red-400" : "text-blue-400"}`}
                      />
                      <textarea
                        name="accessibilityNotes"
                        value={registerData.accessibilityNotes}
                        onChange={handleRegisterChange}
                        placeholder={
                          registerData.accessibility === "dead"
                            ? "Andika igihe n'impamvu y'urupfu..."
                            : "Andika aho Yimukiye ahandi n'igihe..."
                        }
                        rows="3"
                        className={`w-full pl-9 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm sm:text-base transition-all resize-none ${validationErrors.accessibilityNotes ? "border-red-500 bg-red-50" : "border-gray-200"}`}
                      />
                    </div>
                    {validationErrors.accessibilityNotes && (
                      <p className="text-red-500 text-xs mt-1">
                        {validationErrors.accessibilityNotes}
                      </p>
                    )}
                  </div>
                )}

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
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full border-2 transition-all duration-200 font-medium ${registerData.sakraments.includes(s._id) ? "bg-green-600 text-white border-green-600 hover:bg-green-700" : "bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:text-green-600"}`}
                      >
                        {s.name}
                      </button>
                    ))}
                  </div>
                  <p className="text-gray-400 text-xs">
                    Hitamo amasakramentu yakiriye
                  </p>
                </div>

                {/* Submit Button */}
                <div className="pt-4 sm:pt-6">
                  <button
                    type="submit"
                    disabled={registerLoading || registerSuccess}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3.5 sm:py-4 rounded-lg sm:rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md hover:shadow-lg"
                  >
                    {registerLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        Turimo kwandika...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <FaChurch className="text-white" />
                        Kwiyandikisha
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs text-gray-500 text-center mt-4">
                  <span className="text-red-500">*</span> Ibyanditswe n'inyuguti
                  zitukura birakenewe
                </p>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* SEARCH SECTION */}
      <section id="search" className="px-4 sm:px-6 pb-16 max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            Shakisha Umukristu
          </h3>
          <p className="text-gray-500 text-sm sm:text-base">
            Shakisha abakristu ukoresheje izina n'umuryango remezo
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <select
                value={selectedSubgroup}
                onChange={(e) => setSelectedSubgroup(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Hitamo Umuryango remezo</option>
                {subgroups.map((sg) => (
                  <option key={sg._id} value={sg._id}>
                    {sg.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
              <input
                type="text"
                placeholder="Andika izina..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {searchLoading && (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        )}

        {searchResults.length > 0 && !searchLoading && (
          <div className="mt-8 space-y-4">
            <h4 className="text-lg font-semibold text-blue-600 mb-4">
              Abakristu babonetse ({searchResults.length})
            </h4>
            {searchResults.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div
                  className="p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleMemberDetails(member._id)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${member.decision?.status === "ACTIVE" ? "bg-green-100" : "bg-blue-100"}`}
                    >
                      <span className="font-bold text-blue-600">
                        {member.fullName
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800">
                        {member.fullName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {member.subgroup?.name} •{" "}
                        {member.category === "child"
                          ? "Umwana"
                          : member.category === "youth"
                            ? "Urubyiruko"
                            : "Umukuru"}
                      </p>
                    </div>
                    <FaChevronRight
                      className={`text-gray-400 transition-transform ${expandedMember === member._id ? "rotate-90" : ""}`}
                    />
                  </div>
                  {member.decision && (
                    <div className="mt-3 flex items-center gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${member.decision.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                      >
                        {member.decision.status === "ACTIVE"
                          ? "Aritabira"
                          : "Ntiyitabira"}{" "}
                        • {member.decision.attendancePercentage}%
                      </span>
                    </div>
                  )}
                </div>
                {expandedMember === member._id && (
                  <div className="border-t p-4 bg-gray-50">
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <FaVenusMars />
                        <span className="text-sm capitalize">
                          {member.gender === "male" ? "Gabo" : "Gore"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone />
                        <span className="text-sm">
                          {member.phone || "Nta telefone"}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-blue-50 p-2 rounded">
                        <p className="text-lg font-bold text-blue-600">
                          {member.stats?.total || 0}
                        </p>
                        <p className="text-xs">Yose</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded">
                        <p className="text-lg font-bold text-green-600">
                          {member.stats?.present || 0}
                        </p>
                        <p className="text-xs">Yitabiriye</p>
                      </div>
                      <div className="bg-red-50 p-2 rounded">
                        <p className="text-lg font-bold text-red-600">
                          {member.stats?.absent || 0}
                        </p>
                        <p className="text-xs">Ntiyitabiriye</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* EVENTS SECTION */}
      <section className="px-4 sm:px-6 pb-16 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
            Ibikorwa biri imbere
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <div
              key={event._id}
              onClick={() => navigate(`/events-public/${event._id}`)}
              className="bg-white rounded-xl shadow-md hover:shadow-lg cursor-pointer p-5"
            >
              <h4 className="font-semibold text-gray-800 mb-2">
                {event.title}
              </h4>
              <div className="flex items-center gap-2 text-blue-600 text-sm mb-3">
                <FaCalendarAlt /> {new Date(event.date).toLocaleDateString()}
              </div>
              <p className="text-gray-600 text-sm">
                {event.description || "Nta bisobanuro"}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/events-public"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800"
          >
            Reba ibikorwa byose <FaChevronRight />
          </Link>
        </div>
      </section>

      {/* ABOUT SECTION */}
      <section
        id="about"
        className="bg-gradient-to-br from-blue-600 to-blue-700 py-16 px-4"
      >
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Ibyerekeye Sisitemu
          </h3>
          <p className="text-blue-100 text-sm sm:text-base md:text-lg leading-relaxed">
            Iyi sisitemu yashyizweho kugirango ifashe gukurikirana abakristu,
            amakuru yabo, n'ibikorwa byabo by'umuryango witiriwe Mutagatifu
            Mariko.
          </p>
        </div>
      </section>

      {/* CONTACT SECTION */}
      <section id="contact" className="py-16 px-4">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h3 className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
              Ohereza ubutumwa
            </h3>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="text"
                  name="name"
                  placeholder="Izina ryawe"
                  value={contactData.name}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={contactData.email}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Telefone"
                  value={contactData.phone}
                  onChange={handleContactChange}
                  className="w-full pl-9 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <textarea
                name="message"
                placeholder="Ubutumwa bwawe..."
                value={contactData.message}
                onChange={handleContactChange}
                rows="4"
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                required
              />
              {contactError && (
                <div className="bg-red-50 p-3 rounded-xl text-red-600 text-sm">
                  {contactError}
                </div>
              )}
              {successMsg && (
                <div className="bg-green-50 p-3 rounded-xl text-green-600 text-sm">
                  {successMsg}
                </div>
              )}
              <button
                type="submit"
                disabled={sending}
                className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition-all"
              >
                {sending ? "Birimo koherezwa..." : "Ohereza Ubutumwa"}
              </button>
            </form>
          </div>
        </div>
      </section>

      <footer className="bg-white border-t py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Umuryango remezo witiriwe Mutagatifu Mariko
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}