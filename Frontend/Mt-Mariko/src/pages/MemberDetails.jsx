import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserCheck, FaUserTimes } from "react-icons/fa";
import api from "../api/axios";

export default function MemberDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [decision, setDecision] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const [memberRes, attendanceRes, decisionRes] = await Promise.all([
          api.get(`/members/${id}`),
          api.get(`/attendance/member/${id}`),
          api.get(`/decision/member/${id}`),
        ]);

        if (!isMounted) return;

        setMember(memberRes.data);
        setAttendance(attendanceRes.data || []);
        setDecision(decisionRes.data || null);
      } catch (err) {
        if (isMounted) {
          setError("Ntibyashoboye gupakira amakuru y'umunyamuryango.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return <div className="p-6 text-blue-600">Birimo gupakira amakuru y'umunyamuryango...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!member) {
    return <div className="p-6 text-red-500">Umunyamuryango ntiyabonetse</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6 hover:underline"
      >
        <FaArrowLeft /> Subira Inyuma
      </button>

      {/* Member Profile */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">{member.fullName}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-gray-700">
          <p><span className="font-semibold">Icyiciro:</span> {member.category}</p>
          <p><span className="font-semibold">Igitsina:</span> {member.gender || "N/A"}</p>
          <p><span className="font-semibold">Telefone:</span> {member.phone || member.userphoneNumber || "Nta telefone yatanzwe"}</p>
          <p><span className="font-semibold">Itariki y'amavuko:</span> {member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : "Nta tariki yatanzwe"}</p>
          <p><span className="font-semibold">Itsinda rito:</span> {member.subgroup?.name || "Nta tsinda ryashyizweho"}</p>
          <p className="md:col-span-2">
            <span className="font-semibold">Sakraments:</span> {member.sakraments?.length > 0 ? member.sakraments.map((s) => s.name).join(", ") : "Nta Sakramenti"}
          </p>

          <button
            onClick={() => navigate(`/members/edit/${member._id}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded transition mt-2 md:col-span-2"
          >
            Hindura Amakuru
          </button>
        </div>

        {/* Attendance Decision */}
        <div className="mt-6 flex items-center gap-2">
          {decision ? (
            <>
              {decision.status === "ACTIVE" ? (
                <FaUserCheck className="text-blue-600" />
              ) : (
                <FaUserTimes className="text-red-500" />
              )}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  decision.status === "ACTIVE"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {decision.status === "ACTIVE" ? "Aritabira" : "Ntiyitabira"} — {decision.attendancePercentage}%
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-sm">Nta cyemezo ku kwitabira kigezeho</span>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">Amateka yo kwitabira</h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500">Nta mateka yo kwitabira yabonetse.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="p-3">Igikorwa</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Itariki yanditsweho</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id} className="border-b">
                    <td className="p-3">{record.event?.title || "Igikorwa nticyamenyekanye"}</td>
                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          record.status === "present"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status === "present" ? "Yitabiriye" : "Ntacyitabiriye"}
                      </span>
                    </td>
                    <td className="p-3 text-gray-500">
                      {record.createdAt ? new Date(record.createdAt).toLocaleDateString() : "-"}
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