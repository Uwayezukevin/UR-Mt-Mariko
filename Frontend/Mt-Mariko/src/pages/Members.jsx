import { useEffect, useState } from "react";
import { FaUserCheck, FaUserTimes, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Members() {
  const navigate = useNavigate();

  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [decisions, setDecisions] = useState({});

  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subgroupFilter, setSubgroupFilter] = useState("all");
  const [genderFilter, setGenderFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch members and subgroups first
        const [membersRes, subgroupsRes] = await Promise.all([
          api.get("/members"),
          api.get("/subgroups"),
        ]);

        setMembers(membersRes.data);
        setFilteredMembers(membersRes.data);
        setSubgroups(subgroupsRes.data);

        // Fetch decisions for each member individually
        const decisionMap = {};
        await Promise.all(
          membersRes.data.map(async (member) => {
            try {
              const res = await api.get(`/decision/member/${member._id}`);
              decisionMap[member._id] = res.data;
            } catch {
              decisionMap[member._id] = null;
            }
          })
        );

        setDecisions(decisionMap);
      } catch (err) {
        console.error(err);
        setError("Failed to load members.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters
  useEffect(() => {
    let data = [...members];

    if (categoryFilter !== "all") data = data.filter((m) => m.category === categoryFilter);
    if (genderFilter !== "all") data = data.filter((m) => m.gender === genderFilter);
    if (subgroupFilter !== "all") data = data.filter((m) => m.subgroup?._id === subgroupFilter);

    setFilteredMembers(data);
  }, [categoryFilter, genderFilter, subgroupFilter, members]);

  if (loading)
    return <div className="p-6 text-center text-blue-600">Loading members...</div>;

  if (error)
    return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-blue-600 mb-6">Members</h1>

      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-blue-600 mb-6"
      >
        <FaArrowLeft /> Back
      </button>

      {/* FILTERS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Categories</option>
          <option value="child">Child</option>
          <option value="youth">Youth</option>
          <option value="adult">Adult</option>
        </select>

        <select
          value={subgroupFilter}
          onChange={(e) => setSubgroupFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Subgroups</option>
          {subgroups.map((sg) => (
            <option key={sg._id} value={sg._id}>
              {sg.name}
            </option>
          ))}
        </select>

        <select
          value={genderFilter}
          onChange={(e) => setGenderFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      {/* MEMBERS GRID */}
      {filteredMembers.length === 0 ? (
        <p className="text-gray-500">No members found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <MemberCard
              key={member._id}
              member={member}
              decision={decisions[member._id]}
              onClick={() => navigate(`/members/${member._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MemberCard({ member, decision, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
    >
      <h2 className="text-lg font-semibold text-gray-800">{member.fullName}</h2>
      <p className="text-sm text-gray-500 capitalize">Category: {member.category}</p>
      <p className="text-sm text-gray-500">Subgroup: {member.subgroup?.name || "None"}</p>

      {decision ? (
        <div className="mt-4 flex items-center gap-2">
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
            {decision.status} ({decision.attendancePercentage}%)
          </span>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-400">No attendance record</p>
      )}
    </div>
  );
}
