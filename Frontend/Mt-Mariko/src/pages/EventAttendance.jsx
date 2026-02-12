import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";
import { FaArrowLeft } from "react-icons/fa";

export default function EventAttendance() {
  const { id: eventId } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [members, setMembers] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [eventId]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [eventRes, membersRes, attendanceRes] = await Promise.all([
        api.get(`/events/${eventId}`),
        api.get("/members"),
        api.get(`/attendance/event/${eventId}`),
      ]);

      setEvent(eventRes.data);
      setMembers(membersRes.data);

      // Convert attendance array → object
      const map = {};
      attendanceRes.data.forEach((a) => {
        map[a.member._id] = a.status;
      });

      setAttendance(map);
    } catch (err) {
      console.error(err);
      setError("Failed to load data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const markAttendance = async (memberId, status) => {
    try {
      await api.post(`/attendance/mark/${eventId}/${memberId}`, { status });

      setAttendance((prev) => ({
        ...prev,
        [memberId]: status,
      }));
    } catch (err) {
      console.error(err);
      alert("Failed to mark attendance. Try again.");
    }
  };

  if (loading) return <p className="p-6 text-blue-600">Loading event...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!event) return <p className="p-6 text-red-500">Event not found.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800"
      >
        <FaArrowLeft /> Back
      </button>

      <h1 className="text-2xl font-bold text-blue-600 mb-2">{event.title}</h1>
      <p className="text-gray-500 mb-6">
        {event.date ? new Date(event.date).toLocaleDateString() : "-"}
      </p>

      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member._id}
            className="flex justify-between items-center bg-white p-4 rounded shadow hover:shadow-md transition"
          >
            <div>
              <p className="font-medium">{member.fullName}</p>
              <p className="text-sm text-gray-500 capitalize">{member.category}</p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => markAttendance(member._id, "present")}
                className={`px-3 py-1 rounded ${
                  attendance[member._id] === "present"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-600"
                }`}
              >
                Present
              </button>

              <button
                onClick={() => markAttendance(member._id, "absent")}
                className={`px-3 py-1 rounded ${
                  attendance[member._id] === "absent"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-600"
                }`}
              >
                Absent
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
