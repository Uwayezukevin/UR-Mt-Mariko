import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { FaCalendarAlt, FaClock } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [time, setTime] = useState(new Date());

  // SEARCH STATES
  const [subgroups, setSubgroups] = useState([]);
  const [selectedSubgroup, setSelectedSubgroup] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // CONTACT STATES
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

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
        const upcoming = res.data.filter((e) => new Date(e.date) >= new Date());
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

      try {
        const res = await api.get(
          `/members/search?name=${searchTerm}&subgroup=${selectedSubgroup}`,
        );
        setSearchResults(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const delay = setTimeout(searchMembers, 400);
    return () => clearTimeout(delay);
  }, [searchTerm, selectedSubgroup]);

  // CONTACT HANDLER
  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactData.email && !contactData.phone) {
      alert("Nyamuneka shyiramo email cyangwa telefone.");
      return;
    }

    try {
      setSending(true);
      await axios.post("https://ur-mt-mariko.onrender.com/umuryangoremezo/backend/messages/send", contactData);
      setSuccessMsg("Ubutumwa bwoherejwe neza!");
      setContactData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      alert("Ntibyashoboye koherezwa ubutumwa");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen scroll-smooth">
      {/* NAVBAR */}
      <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">
            Umuryango remezo witiriwe Mutagatifu Mariko
          </h1>

          <div className="flex items-center gap-6 text-gray-700">
            <a href="#home" className="hover:text-blue-600">
              Ahabanza
            </a>
            <a href="#about" className="hover:text-blue-600">
              Ibyerekeye
            </a>
            <a href="#contact" className="hover:text-blue-600">
              Twandikire
            </a>

            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Injira
            </button>

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FaClock />
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section
        id="home"
        className="pt-36 pb-16 px-6 max-w-7xl mx-auto text-center"
      >
        <h2 className="text-4xl font-bold text-blue-600 mb-4">
          Umuryangoremezo witiriwe Mutagatifu Mariko
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Kugenzura abanyamuryango, gukurikirana kwitabira ibikorwa, no kumenya
          amakuru y'ibikorwa biri imbere.
        </p>
      </section>

      {/* SEARCH SECTION */}
      <section className="px-6 pb-16 max-w-5xl mx-auto">
        <h3 className="text-2xl font-semibold text-blue-600 mb-6">
          Shakisha Umunyamuryango
        </h3>

        <div className="bg-white p-6 rounded-xl shadow space-y-4">
          <select
            value={selectedSubgroup}
            onChange={(e) => setSelectedSubgroup(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          >
            <option value="">Hitamo Umuryangoremezo muto</option>
            {subgroups.map((sg) => (
              <option key={sg._id} value={sg._id}>
                {sg.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Andika izina..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border px-4 py-2 rounded w-full"
          />
        </div>

        {/* RESULTS */}
        {searchResults.length > 0 && (
          <div className="mt-6 space-y-4">
            {searchResults.length > 0 && (
              <div className="mt-6 space-y-6">
                {searchResults.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white rounded-xl shadow p-6"
                  >
                    <h3 className="text-xl font-bold text-blue-600">
                      {member.fullName}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-gray-700">
                      <p>
                        <span className="font-semibold">Icyiciro:</span>{" "}
                        {member.category}
                      </p>

                      {member.category === "child" && member.parent && (
                        <p>
                          <span className="font-semibold">Umubyeyi:</span>{" "}
                          {member.parent.fullName}
                        </p>
                      )}

                      <p>
                        <span className="font-semibold">Igitsina:</span>{" "}
                        {member.gender || "N/A"}
                      </p>

                      <p>
                        <span className="font-semibold">Telefone:</span>{" "}
                        {member.phone || "Nta telefone"}
                      </p>

                      <p>
                        <span className="font-semibold">Itsinda rito:</span>{" "}
                        {member.subgroup?.name || "Nta tsinda"}
                      </p>

                      <p className="md:col-span-2">
                        <span className="font-semibold">Sakraments:</span>{" "}
                        {member.sakraments?.length > 0
                          ? member.sakraments.map((s) => s.name).join(", ")
                          : "Nta Sakramenti"}
                      </p>
                    </div>

                    {/* Decision Section */}
                    <div className="mt-6">
                      {member.decision ? (
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            member.decision.status === "ACTIVE"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          {member.decision.status === "ACTIVE"
                            ? "Akiriho"
                            : "Ntahari"}{" "}
                          — {member.decision.attendancePercentage}%
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">
                          Nta cyemezo ku kwitabira
                        </span>
                      )}
                    </div>

                    {/* Attendance Table */}
                    <div className="mt-6">
                      <h4 className="font-semibold text-blue-600 mb-2">
                        Amateka yo kwitabira
                      </h4>

                      {member.attendance?.length === 0 ? (
                        <p className="text-gray-500">Nta mateka yabonetse.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-blue-50 text-left">
                                <th className="p-3">Igikorwa</th>
                                <th className="p-3">Status</th>
                                <th className="p-3">Itariki</th>
                              </tr>
                            </thead>
                            <tbody>
                              {member.attendance.map((record) => (
                                <tr key={record._id} className="border-b">
                                  <td className="p-3">
                                    {record.event?.title || "N/A"}
                                  </td>

                                  <td className="p-3 capitalize">
                                    <span
                                      className={`px-2 py-1 rounded text-sm ${
                                        record.status === "present"
                                          ? "bg-blue-100 text-blue-600"
                                          : "bg-red-100 text-red-600"
                                      }`}
                                    >
                                      {record.status === "present"
                                        ? "Yitabiriye"
                                        : "Ntabwo itabiriye"}
                                    </span>
                                  </td>

                                  <td className="p-3 text-gray-500">
                                    {record.createdAt
                                      ? new Date(
                                          record.createdAt,
                                        ).toLocaleDateString()
                                      : "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* EVENTS */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <h3 className="text-2xl font-semibold text-blue-600 mb-6">
          Ibikorwa biri imbere
        </h3>

        {events.length === 0 ? (
          <p className="text-gray-500">Nta bikorwa biri imbere.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="bg-white rounded-xl shadow p-6">
                <h4 className="text-lg font-semibold text-gray-800">
                  {event.title}
                </h4>
                <div className="flex items-center gap-2 mt-3 text-blue-600 text-sm">
                  <FaCalendarAlt />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <button
                  onClick={() => navigate(`events-public/${event._id}`)}
                  className="mt-4 text-sm text-blue-600 hover:underline"
                >
                  Reba ibisobanuro
                </button>
              </div>
            ))}
          </div>
        )}

        <Link to="/events-public" className="text-blue-600 hover:underline">
          Reba ibikorwa byose →
        </Link>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">
            Ibyerekeye Sisitemu
          </h3>
          <p className="text-gray-600">
            Iyi sisitemu yashyizweho kugirango ifashe gukurikirana abanyamuryango, amakuru yabo, n'ibikorwa byabo by'umuryango witiriwe Mutagatifu Mariko. 
            Mbere, kugenzura abanyamuryango no kubika amakuru byari inzira igoye kandi itari yoroshye. 
            Ku bitekerezo by' abakristu twashatse umutekinisiye wubatse iyi sisitemu ikomeye, igamije gufasha abanyamuryango no koroshya ubu buryo. 
            Sisitemu igenewe abanyamuryango, abayobozi, ndetse n'abandi. Twizeye ko muzayikoresha neza.
          </p>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-20 px-6 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">
            Ohereza ubutumwa ku muyobozi
          </h3>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white shadow rounded-xl p-6 grid gap-4 max-w-xl"
          >
            <input
              type="text"
              name="name"
              placeholder="Izina ryawe"
              value={contactData.name}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={contactData.email}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Telefone"
              value={contactData.phone}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
            />

            <textarea
              name="message"
              placeholder="Ubutumwa bwawe..."
              value={contactData.message}
              onChange={handleContactChange}
              className="border rounded px-4 py-2 h-28"
              required
            />

            <button
              disabled={sending}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              {sending ? "Birimo koherezwa..." : "Ohereza Ubutumwa"}
            </button>

            {successMsg && <p className="text-green-600">{successMsg}</p>}
          </form>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white text-center py-4 text-sm text-gray-500">
        © {new Date().getFullYear()} Umuryangoremezo witiriwe Mutagatifu Mariko
        || Yubatswe na dev Uwayezu Kevin
      </footer>
    </div>
  );
}
