import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import api from "../api/axios";

export default function EventDetails() {
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
        setError("Ntibyakunze kuzana ibisobanuro by'iki gikorwa.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [id]);

  if (loading) {
    return <div className="p-6 text-blue-600">Ibisobanuro by'igikorwa birimo gutegurwa...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!event) {
    return <div className="p-6 text-red-500">Igikorwa nticyabonetse.</div>;
  }

  const formatDate = (dateStr) => {
    try {
      return dateStr ? new Date(dateStr).toLocaleDateString() : "-";
    } catch {
      return "-";
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Subira Inyuma */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
      >
        <FaArrowLeft /> Subira inyuma
      </button>

      {/* Amakuru y'Igikorwa */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">{event.title}</h1>
        <p className="text-gray-500 mt-1">{formatDate(event.date)}</p>
        <p className="mt-4 text-gray-700">{event.description}</p>
        <br />
        <button
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          onClick={() => navigate(`/events/${event._id}/attendance`)}
        >
          Shyiraho Kwitabira
        </button>
      </div>

      {/* Imbonerahamwe y'Abitabiriye */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Kwitabira</h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500">
            Nta makuru y'ukwitabira yabonetse kuri iki gikorwa.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50">
                  <th className="p-3 text-left">Umunyamuryango</th>
                  <th className="p-3 text-left">Uko Yitabiriye</th>
                  <th className="p-3 text-left">Itariki</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr
                    key={record._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3">
                      {record.member?.fullName || "Ntazwi"}
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
                          : record.status === "absent"
                          ? "Ntabwo yitabiriye"
                          : "-"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
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