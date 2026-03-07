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
  const [isAttendanceClosed, setIsAttendanceClosed] = useState(false);

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

      const eventData = eventRes.data;
      const membersData = membersRes.data;
      const attendanceData = attendanceRes.data;

      setEvent(eventData);
      setMembers(membersData);

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const eventDate = new Date(eventData.date);
      eventDate.setHours(0, 0, 0, 0);

      setIsAttendanceClosed(eventDate < today);

      const map = {};
      attendanceData.forEach((a) => {
        map[a.member._id] = a.status;
      });

      if (eventDate < today) {
        membersData.forEach((member) => {
          if (!map[member._id]) {
            map[member._id] = "ntabwo yitabiriye";
          }
        });
      }

      setAttendance(map);
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

    try {
      await api.post(`/attendance/mark/${eventId}/${memberId}`, { status });

      setAttendance((prev) => ({
        ...prev,
        [memberId]: status,
      }));
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Ntibyakunze gushyiraho kwitabira. Ongera ugerageze."
      );
    }
  };

  if (loading)
    return <p className="p-4 sm:p-6 text-blue-600">Ibirori birimo gutegurwa...</p>;

  if (error)
    return <p className="p-4 sm:p-6 text-red-500">{error}</p>;

  if (!event)
    return <p className="p-4 sm:p-6 text-red-500">Ibirori ntibyabonetse.</p>;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto">

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:text-blue-800 text-sm sm:text-base"
      >
        <FaArrowLeft /> Subira inyuma
      </button>

      <h1 className="text-xl sm:text-2xl font-bold text-blue-600 mb-2">
        {event.title}
      </h1>

      <p className="text-gray-500 mb-3 text-sm sm:text-base">
        {event.date ? new Date(event.date).toLocaleDateString() : "-"}
      </p>

      {isAttendanceClosed && (
        <p className="text-red-600 font-medium mb-4 text-sm sm:text-base">
          ⚠ Kwitabira byarafunzwe — iki gikorwa cyamaze kuba.
        </p>
      )}

      <div className="space-y-3">

        {members.map((member) => (
          <div
            key={member._id}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white p-4 rounded-xl shadow hover:shadow-md transition gap-3"
          >

            {/* MEMBER INFO */}
            <div>
              <p className="font-medium text-sm sm:text-base">
                {member.fullName}
              </p>

              <p className="text-xs sm:text-sm text-gray-500 capitalize">
                {member.category}
              </p>

              <p className="text-xs sm:text-sm text-gray-500 capitalize">
                {member.subgroup?.name}
              </p>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-2 flex-wrap">

              <button
                disabled={isAttendanceClosed}
                onClick={() => markAttendance(member._id, "yitabiriye")}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  attendance[member._id] === "yitabiriye"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-100 text-blue-600"
                } ${isAttendanceClosed ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Yitabiriye
              </button>

              <button
                disabled={isAttendanceClosed}
                onClick={() => markAttendance(member._id, "ntabwo yitabiriye")}
                className={`px-3 py-1.5 text-sm rounded transition ${
                  attendance[member._id] === "ntabwo yitabiriye"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 text-red-600"
                } ${isAttendanceClosed ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                Ntabwo yitabiriye
              </button>

            </div>
          </div>
        ))}

      </div>
    </div>
  );
}