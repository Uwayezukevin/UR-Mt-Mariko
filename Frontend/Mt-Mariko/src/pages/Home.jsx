import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import api from "../api/axios";
import { FaCalendarAlt, FaClock, FaArrowLeft } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [time, setTime] = useState(new Date());

  // CONTACT FORM STATE
  const [contactData, setContactData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Live clock
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
      alert("Please provide either email or phone number.");
      return;
    }

    try {
      setSending(true);
      await axios.post("http://localhost:2350/messages/send", contactData);
      setSuccessMsg("Message sent successfully!");
      setContactData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-blue-50 min-h-screen scroll-smooth">
      {/* NAVBAR */}
      <nav className="bg-white shadow fixed top-0 left-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Attendance System</h1>

          <div className="flex items-center gap-6 text-gray-700">
            <a href="#home" className="hover:text-blue-600">
              Home
            </a>
            <a href="#about" className="hover:text-blue-600">
              About
            </a>
            <a href="#contact" className="hover:text-blue-600">
              Contact
            </a>

            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 font-medium hover:underline"
            >
              Login
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
          Manage members, track attendance, and stay informed about upcoming
          events.
        </p>
      </section>

      {/* EVENTS */}
      <section className="px-6 pb-20 max-w-7xl mx-auto">
        <h3 className="text-2xl font-semibold text-blue-600 mb-6">
          Upcoming Events
        </h3>

        {events.length === 0 ? (
          <p className="text-gray-500">No upcoming events.</p>
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
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}

        <Link to="/events-public" className="text-blue-600 hover:underline">
          View all events →
        </Link>
      </section>

      {/* ABOUT */}
      <section id="about" className="bg-white py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-600 mb-4">
            About Us
          </h3>
          <p className="text-gray-600">
            This system was developed to help the track of attendance , data ,
            events of members of group called Umuryangoremezo witiriwe
            Mutagatifu Mariko. This System was developed to simplify all the
            processes made to check member's attendance and data , this was a
            complex and complicated process. So through the Idea of one member
            called Ufitingabire Vincent De Paul, we hired a developer to build
            this robust system to support our member's Idea and also inorder to
            solve such big problem we had been facing for along time. So this
            system is dedicated to our members and our leaders but also guests
            are allowed. This system is also in charge of Parish of Saint Peter
            cyahafi. We hope you guys will enjoy to use it.
          </p>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact" className="py-20 px-6 bg-blue-50">
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-semibold text-blue-600 mb-6">
            Contact Admin
          </h3>

          <form
            onSubmit={handleContactSubmit}
            className="bg-white shadow rounded-xl p-6 grid gap-4 max-w-xl"
          >
            <input
              type="text"
              name="name"
              placeholder="Your Name"
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
              placeholder="Phone (optional)"
              value={contactData.phone}
              onChange={handleContactChange}
              className="border rounded px-4 py-2"
            />

            <textarea
              name="message"
              placeholder="Your message (attendance request, question...)"
              value={contactData.message}
              onChange={handleContactChange}
              className="border rounded px-4 py-2 h-28"
              required
            />

            <button
              disabled={sending}
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Message"}
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
        || Empowered and built by dev Uwayezu Kevin
      </footer>
    </div>
  );
}
