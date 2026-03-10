import { useEffect, useState, useMemo } from "react";
import { 
  FaUserCheck, 
  FaUserTimes, 
  FaArrowLeft,
  FaSearch,
  FaFilter,
  FaTimes,
  FaUser,
  FaUsers,
  FaVenusMars,
  FaLayerGroup,
  FaChevronRight,
  FaInfoCircle,
  FaExclamationCircle,
  FaCheckCircle,
  FaSortAmountDown,
  FaSortAmountUp
} from "react-icons/fa";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch members, subgroups, and decisions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [membersRes, subgroupsRes] = await Promise.all([
          api.get("/members"),
          api.get("/subgroups"),
        ]);

        setMembers(membersRes.data);
        setSubgroups(subgroupsRes.data);

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
        setError("Ntibishoboye gupakurura abanyamuryango.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let data = [...members];

    // Apply category filter
    if (categoryFilter !== "all") {
      data = data.filter((m) => m.category === categoryFilter);
    }

    // Apply gender filter
    if (genderFilter !== "all") {
      data = data.filter((m) => m.gender === genderFilter);
    }

    // Apply subgroup filter
    if (subgroupFilter !== "all") {
      data = data.filter((m) => m.subgroup?._id === subgroupFilter);
    }

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(m => 
        m.fullName.toLowerCase().includes(term) ||
        m.phone?.toLowerCase().includes(term) ||
        m.subgroup?.name?.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    data.sort((a, b) => {
      let comparison = 0;
      
      if (sortBy === "name") {
        comparison = a.fullName.localeCompare(b.fullName);
      } else if (sortBy === "category") {
        comparison = (a.category || "").localeCompare(b.category || "");
      } else if (sortBy === "attendance") {
        const aDecision = decisions[a._id];
        const bDecision = decisions[b._id];
        const aPercent = aDecision?.attendancePercentage || 0;
        const bPercent = bDecision?.attendancePercentage || 0;
        comparison = aPercent - bPercent;
      }
      
      return sortOrder === "asc" ? comparison : -comparison;
    });

    setFilteredMembers(data);
  }, [categoryFilter, genderFilter, subgroupFilter, searchTerm, sortBy, sortOrder, members, decisions]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setSubgroupFilter("all");
    setGenderFilter("all");
    setSearchTerm("");
  };

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getStats = () => {
    const total = filteredMembers.length;
    const active = filteredMembers.filter(m => decisions[m._id]?.status === "ACTIVE").length;
    const inactive = filteredMembers.filter(m => decisions[m._id]?.status === "NOT ACTIVE").length;
    return { total, active, inactive };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 
                          border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
            <FaUsers className="absolute top-1/2 left-1/2 transform 
                              -translate-x-1/2 -translate-y-1/2 
                              text-blue-600 text-lg sm:text-xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-4">
            Turimo gupakurura abanyamuryango...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 max-w-md text-center">
          <div className="bg-red-100 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                        flex items-center justify-center mx-auto mb-4">
            <FaExclamationCircle className="text-red-500 text-2xl sm:text-3xl" />
          </div>
          <p className="text-red-600 text-sm sm:text-base font-medium mb-2">
            Habayemo ikibazo
          </p>
          <p className="text-gray-600 text-xs sm:text-sm mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2.5 sm:py-3 rounded-xl 
                     hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            Ongera ugerageze
          </button>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     transition-colors active:opacity-70 px-2 py-2 -ml-2 
                     rounded-lg active:bg-blue-50 w-fit group"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
            <span className="font-medium text-sm sm:text-base">Subira Inyuma</span>
          </button>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-center 
                       bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Urutonde rw'Abanyamuryango
          </h1>

          <div className="sm:w-32"></div> {/* Spacer for alignment */}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500">Yose</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500">Aritabira</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-green-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-3 sm:p-4 text-center">
            <p className="text-xs sm:text-sm text-gray-500">Ntiyitabira</p>
            <p className="text-lg sm:text-xl md:text-2xl font-bold text-red-600">{stats.inactive}</p>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-5 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Shakisha abanyamuryango..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 sm:py-3 border border-gray-200 
                         rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm sm:text-base transition-all"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden flex items-center justify-center gap-2 
                       bg-blue-100 text-blue-600 px-4 py-2.5 rounded-xl
                       hover:bg-blue-200 transition-colors"
            >
              <FaFilter />
              <span>Filter</span>
            </button>

            {/* Desktop Filters */}
            <div className="hidden sm:flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Ibyiciro byose</option>
                <option value="child">Abana</option>
                <option value="youth">Urubyiruko</option>
                <option value="adult">Abakuru</option>
              </select>

              <select
                value={subgroupFilter}
                onChange={(e) => setSubgroupFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Imiryango remezo mito yose</option>
                {subgroups.map((sg) => (
                  <option key={sg._id} value={sg._id}>
                    {sg.name}
                  </option>
                ))}
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Ibitsina byombi</option>
                <option value="male">Gabo</option>
                <option value="female">Gore</option>
              </select>
            </div>
          </div>

          {/* Mobile Filters */}
          {showFilters && (
            <div className="sm:hidden mt-3 space-y-3">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Ibyiciro byose</option>
                <option value="child">Abana</option>
                <option value="youth">Urubyiruko</option>
                <option value="adult">Abakuru</option>
              </select>

              <select
                value={subgroupFilter}
                onChange={(e) => setSubgroupFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Imiryangoremezo mito yose</option>
                {subgroups.map((sg) => (
                  <option key={sg._id} value={sg._id}>
                    {sg.name}
                  </option>
                ))}
              </select>

              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         text-sm bg-white"
              >
                <option value="all">Ibitsina byombi</option>
                <option value="male">Gabo</option>
                <option value="female">Gore</option>
              </select>
            </div>
          )}

          {/* Active Filters */}
          {(categoryFilter !== "all" || subgroupFilter !== "all" || genderFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500">Ifilitero ikoreshwa:</span>
              {categoryFilter !== "all" && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
                  {categoryFilter === 'child' ? 'Abana' : 
                   categoryFilter === 'youth' ? 'Urubyiruko' : 'Abakuru'}
                </span>
              )}
              {subgroupFilter !== "all" && (
                <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
                  {subgroups.find(s => s._id === subgroupFilter)?.name}
                </span>
              )}
              {genderFilter !== "all" && (
                <span className="bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
                  {genderFilter === 'male' ? 'Gabo' : 'Gore'}
                </span>
              )}
              {searchTerm && (
                <span className="bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-lg 
                               text-xs font-medium">
                  "{searchTerm}"
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-xs text-red-600 hover:text-red-800 ml-auto 
                         font-medium flex items-center gap-1"
              >
                <FaTimes /> Siba byose
              </button>
            </div>
          )}
        </div>

        {/* Sort Options */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <p className="text-xs sm:text-sm text-gray-500">
            {filteredMembers.length} {filteredMembers.length === 1 ? 'umunyamuryango' : 'abanyamuryango'} babonetse
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => toggleSort("name")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm
                        transition-colors ${
                sortBy === "name" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Izina
              {sortBy === "name" && (
                sortOrder === "asc" ? <FaSortAmountUp className="text-xs" /> : <FaSortAmountDown className="text-xs" />
              )}
            </button>
            
            <button
              onClick={() => toggleSort("attendance")}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs sm:text-sm
                        transition-colors ${
                sortBy === "attendance" 
                  ? "bg-blue-100 text-blue-600" 
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Kwitabira
              {sortBy === "attendance" && (
                sortOrder === "asc" ? <FaSortAmountUp className="text-xs" /> : <FaSortAmountDown className="text-xs" />
              )}
            </button>
          </div>
        </div>

        {/* Members Grid */}
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-12 text-center">
            <div className="bg-gray-100 rounded-full w-20 h-20 sm:w-24 sm:h-24 
                          flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-gray-400 text-3xl sm:text-4xl" />
            </div>
            <p className="text-gray-700 text-sm sm:text-base font-medium mb-2">
              Nta munyamuryango wabonetse
            </p>
            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              Ongera ugerageze
            </p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl 
                       hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Siba 
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
    </div>
  );
}

// Single Member Card
function MemberCard({ member, decision, onClick }) {
  const translateCategory = (category) => {
    if (category === "child") return "Umwana";
    if (category === "youth") return "Urubyiruko";
    if (category === "adult") return "Umukuru";
    return category;
  };

  const translateStatus = (status) => {
    if (status === "ACTIVE") return "Aritabira";
    if (status === "NOT ACTIVE") return "Ntiyitabira";
    return status;
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-xl sm:rounded-2xl shadow-md 
                 hover:shadow-xl transition-all duration-300 
                 cursor-pointer overflow-hidden transform hover:-translate-y-1
                 border border-gray-100 hover:border-blue-200"
    >
      {/* Color bar based on status */}
      <div className={`h-2 w-full ${
        decision?.status === "ACTIVE" 
          ? "bg-green-500" 
          : decision?.status === "NOT ACTIVE"
          ? "bg-red-500"
          : "bg-gray-400"
      }`} />

      <div className="p-5 sm:p-6">
        {/* Avatar and Name */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center
                        ${decision?.status === "ACTIVE" 
                          ? "bg-green-100 text-green-600" 
                          : decision?.status === "NOT ACTIVE"
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                        }`}>
            <span className="text-sm font-bold">{getInitials(member.fullName)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-800 
                         truncate group-hover:text-blue-600 transition-colors">
              {member.fullName}
            </h2>
            <p className="text-xs text-gray-500">
              {translateCategory(member.category)}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaLayerGroup className="text-blue-400 text-xs" />
            <span className="text-xs truncate">
              {member.subgroup?.name || "Nta muryango"}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <FaVenusMars className="text-blue-400 text-xs" />
            <span className="text-xs capitalize">
              {member.gender === 'male' ? 'Gabo' : member.gender === 'female' ? 'Gore' : 'N/A'}
            </span>
          </div>
        </div>

        {/* Decision Status */}
        {decision ? (
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2">
              {decision.status === "ACTIVE" ? (
                <FaUserCheck className="text-green-600 text-sm" />
              ) : (
                <FaUserTimes className="text-red-500 text-sm" />
              )}
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full
                  ${decision.status === "ACTIVE"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                  }`}
              >
                {translateStatus(decision.status)}
              </span>
            </div>
            <span className="text-sm font-bold text-blue-600">
              {decision.attendancePercentage}%
            </span>
          </div>
        ) : (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <FaInfoCircle className="text-gray-400" />
              Nta makuru y'ukwitabira
            </p>
          </div>
        )}

        {/* View Details Link */}
        <div className="mt-3 text-right">
          <span className="text-xs text-blue-600 opacity-0 group-hover:opacity-100 
                         transition-opacity flex items-center justify-end gap-1">
            Reba ibisobanuro
            <FaChevronRight className="text-xs" />
          </span>
        </div>
      </div>
    </div>
  );
}