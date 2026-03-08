import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";

export default function EventDetailsPublic() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        setLoading(true);
        setError("");

        const [eventRes, attendanceRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/attendance/event/${id}`),
        ]);

        setEvent(eventRes.data);
        setAttendance(attendanceRes.data || []);
      } catch (err) {
        console.error(err);
        setError("Ntibyashoboye kwerekana amakuru y'igikorwa.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 py-6 text-blue-600">
        Turimo gutunganya amakuru y'igikorwa...
      </div>
    );
  }

  if (error) {
    return <div className="px-4 sm:px-6 py-6 text-red-500">{error}</div>;
  }

  if (!event) {
    return (
      <div className="px-4 sm:px-6 py-6 text-red-500">
        Igikorwa nticyabonetse.
      </div>
    );
  }

  const formatDate = (dateStr) => {
    try {
      return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 text-sm sm:text-base"
      >
        <FaArrowLeft /> Subira inyuma
      </button>

      {/* Event Info */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-blue-600">
          {event.title}
        </h1>

        <p className="text-gray-500 mt-1 text-sm sm:text-base">
          {formatDate(event.date)}
        </p>

        <p className="mt-4 text-gray-700 text-sm sm:text-base leading-relaxed">
          {event.description}
        </p>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-blue-600 mb-4">
          Abitabiriye
        </h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500 text-sm sm:text-base">
            Nta bitabiriye banditswe kuri iki gikorwa.
          </p>
        ) : (
          <div className="overflow-x-auto">

            <table className="w-full text-sm sm:text-base">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-2 sm:p-3 text-left">Umuryango</th>
                  <th className="p-2 sm:p-3 text-left">Uburyo yitabiriye</th>
                  <th className="p-2 sm:p-3 text-left">Itariki</th>
                </tr>
              </thead>

              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-2 sm:p-3">
                      {record.member?.fullName || "Ntizwi"}
                    </td>

                    <td className="p-2 sm:p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-xs sm:text-sm ${
                          record.status === "present"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status || "-"}
                      </span>
                    </td>

                    <td className="p-2 sm:p-3 text-gray-500">
                      {formatDate(record.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>
        )}
      </div>
    </div>
  );
}