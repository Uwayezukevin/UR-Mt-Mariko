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

        const [memberRes, attendanceRes, decisionRes] =
          await Promise.all([
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
          setError("Failed to load member details.");
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
    return (
      <div className="p-6 text-blue-600">
        Loading member details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500">
        {error}
      </div>
    );
  }

  if (!member) {
    return (
      <div className="p-6 text-red-500">
        Member not found
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      {/* Member Profile */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-600">
          {member.fullName}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-gray-700">
          <p>
            <span className="font-semibold">Category:</span>{" "}
            <span className="capitalize">{member.category}</span>
          </p>

          <p>
            <span className="font-semibold">Gender:</span>{" "}
            {member.gender || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Phone:</span>{" "}
            {member.phone || member.userphoneNumber || "N/A"}
          </p>

          <p>
            <span className="font-semibold">Date of Birth:</span>{" "}
            {member.dateOfBirth
              ? new Date(member.dateOfBirth).toLocaleDateString()
              : "Not provided"}
          </p>

          <p>
            <span className="font-semibold">Subgroup:</span>{" "}
            {member.subgroup?.name || "Not assigned"}
          </p>

          <p className="md:col-span-2">
            <span className="font-semibold">Sakraments:</span>{" "}
            {member.sakraments?.length > 0
              ? member.sakraments.map((s) => s.name).join(", ")
              : "None"}
          </p>
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
                {decision.status} — {decision.attendancePercentage}%
              </span>
            </>
          ) : (
            <span className="text-gray-400 text-sm">
              No attendance decision yet
            </span>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-semibold text-blue-600 mb-4">
          Attendance History
        </h2>

        {attendance.length === 0 ? (
          <p className="text-gray-500">
            No attendance records found.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-50 text-left">
                  <th className="p-3">Event</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Marked On</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record._id} className="border-b">
                    <td className="p-3">
                      {record.event?.title || "Unknown event"}
                    </td>

                    <td className="p-3 capitalize">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          record.status === "present"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>

                    <td className="p-3 text-gray-500">
                      {record.createdAt
                        ? new Date(record.createdAt).toLocaleDateString()
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
  );
}
