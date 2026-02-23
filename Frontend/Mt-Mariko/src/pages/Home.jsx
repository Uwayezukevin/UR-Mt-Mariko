import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { FaCalendarAlt, FaClock, FaArrowLeft } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [time, setTime] = useState(new Date());

  // STATE Y'UBUTUMWA
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Isaha ikora live
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch upcoming events
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

  // Handle contact input
  const handleContactChange = (e) => {
    setContactData({ ...contactData, [e.target.name]: e.target.value });
  };

  // Handle contact submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();

    if (!contactData.email && !contactData.phone) {
      alert("Nyamuneka shyiramo email cyangwa telefone.");
      return;
    }

    try {
      setSending(true);
      await axios.post("http://localhost:2350/messages/send", contactData);
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
          <h1 className="text-xl font-bold text-blue-600">Umuryango remezo witiriwe Mutagatifu Mariko</h1>

          <div className="flex items-center gap-6 text-gray-700">
            <a href="#home" className="hover:text-blue-600">
              Ahabanza
            </a>
            <a href="#about" className="hover:text-blue-600">
              Ibyerekeye
            </a>
            <a href="#contact" className="hover:text-blue-600">
              Tumenye
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
        className="pt-36 pb-24 px-6 max-w-7xl mx-auto text-center"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">
          Umuryangoremezo witiriwe Mutagatifu Mariko
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Kugenzura abanyamuryango, gukurikirana kwitabira ibikorwa, no kumenya amakuru y'ibikorwa biri imbere.
        </p>
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
              <div
                key={event._id}
                className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition"
              >
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
            Ku gitekerezo cy'umunyamuryango witwa Ufitingabire Vincent De Paul, twashatse umutekinisiye wubatse iyi sisitemu ikomeye, igamije gufasha abanyamuryango no koroshya ubu buryo. 
            Sisitemu igenewe abanyamuryango, abayobozi, ndetse n'abashyitsi barabemererwa. Ikaba kandi ishinzwe Paruwasi ya Mutagatifu Peter hafi aho. Twizeye ko muzayikoresha neza.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact" className="py-20 px-6 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">
            Tumenye Admin
          </h3>

          <form
            onSubmit={handleContactSubmit}
            autoComplete="off"
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
              placeholder="Email (optional)"
              value={contactData.email}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
            />

            <input
              type="tel"
              name="phone"
              placeholder="Telefone (optional)"
              value={contactData.phone}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
            />

            <textarea
              name="message"
              placeholder="Ubutumwa bwawe (gusaba kwitabira, ikibazo...)"
              value={contactData.message}
              onChange={handleContactChange}
              className="border rounded px-4 py-2 h-28"
              required
            />

            <button
              disabled={sending}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? "Birimo koherezwa..." : "Ohereza Ubutumwa"}
            </button>

            {successMsg && (
              <p className="text-green-600 text-sm">{successMsg}</p>
            )}
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