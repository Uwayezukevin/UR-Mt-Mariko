import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { messagesApi } from "../api/axios";
import RegisterMemberForm from "../components/RegisterMemberForm";
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
  FaChevronRight,
  FaUserPlus,
  FaVenusMars,
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

  const [dataLoaded, setDataLoaded] = useState(false);

  // MEMBER REGISTRATION
  const [showRegistration, setShowRegistration] = useState(false);

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

  // FETCH SUBGROUPS (needed for the public search)
  useEffect(() => {
    const fetchData = async () => {
      try {
        const subgroupsRes = await api
          .get("/subgroups")
          .catch(() => ({ data: [] }));

        setSubgroups(Array.isArray(subgroupsRes.data) ? subgroupsRes.data : []);
        setDataLoaded(true);
      } catch (err) {
        console.error("Error fetching data:", err);
        setDataLoaded(true); // Still show UI even if data fails
      }
    };

    fetchData();
  }, []);



  // AUTO SEARCH - search endpoint already returns attendance + decision
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
            `/members/search?name=${encodeURIComponent(searchTerm)}&subgroup=${selectedSubgroup}`,
          )
          .catch((err) => {
            console.warn("Search failed:", err.response?.status);
            return { data: [] };
          });

        const membersWithDetails = (searchRes.data || []).map((member) => {
          const attendanceData = Array.isArray(member.attendance)
            ? member.attendance
            : [];
          const present = attendanceData.filter(
            (a) => a.status === "present",
          ).length;
          const absent = attendanceData.filter(
            (a) => a.status === "absent",
          ).length;

          return {
            ...member,
            attendance: attendanceData,
            decision: member.decision || null,
            stats: {
              present,
              absent,
              total: attendanceData.length,
            },
            accessibility: member.accessibility || "alive",
            accessibilityNotes: member.accessibilityNotes || "",
          };
        });

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
      await messagesApi.post("/send", contactData);
      setSuccessMsg("Ubutumwa bwoherejwe neza!");
      setContactData({ name: "", email: "", phone: "", message: "" });

      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setContactError("Ntibyashoboye koherezwa ubutumwa. Ongera ugerageze.");
    } finally {
      setSending(false);
    }
  };

  const toggleMemberDetails = (memberId) => {
    if (expandedMember === memberId) {
      setExpandedMember(null);
    } else {
      setExpandedMember(memberId);
    }
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
        <RegisterMemberForm onClose={() => setShowRegistration(false)} />
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
    </div>
  );
}