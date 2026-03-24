import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaArrowLeft,
  FaUser,
  FaUsers,
  FaChild,
  FaUserFriends,
  FaHeart,
  FaTree,
  FaSpinner,
  FaExclamationCircle,
  FaVenusMars,
  FaCalendarAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaRing,
  FaUserGraduate,
} from "react-icons/fa";
import api from "../api/axios";

export default function FamilyView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("family");

  useEffect(() => {
    fetchFamilyData();
  }, [id]);

  const fetchFamilyData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/members/${id}/family`);
      setFamilyData(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching family data:", err);
      setError("Failed to load family information");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading family information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
          >
            <FaArrowLeft /> Subira inyuma
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <FaExclamationCircle className="text-red-500 text-5xl mx-auto mb-4" />
            <p className="text-red-700 text-lg">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!familyData) return null;

  const { member, family, summary } = familyData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4 transition-colors"
          >
            <FaArrowLeft /> Subira inyuma
          </button>
          
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FaTree className="text-white text-2xl" />
                  <h1 className="text-2xl font-bold text-white">Umuryango wa {member.fullName}</h1>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("family")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "family"
                        ? "bg-white text-blue-600"
                        : "bg-blue-500 text-white hover:bg-blue-400"
                    }`}
                  >
                    <FaUsers className="inline mr-2" />
                    Umuryango
                  </button>
                  <button
                    onClick={() => setActiveTab("tree")}
                    className={`px-4 py-2 rounded-lg transition-colors ${
                      activeTab === "tree"
                        ? "bg-white text-blue-600"
                        : "bg-blue-500 text-white hover:bg-blue-400"
                    }`}
                  >
                    <FaTree className="inline mr-2" />
                    Igiti cy'Umuryango
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Member Profile Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <FaUser className="text-white text-3xl" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{member.fullName}</h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    member.category === "child" ? "bg-green-100 text-green-700" :
                    member.category === "youth" ? "bg-yellow-100 text-yellow-700" :
                    "bg-blue-100 text-blue-700"
                  }`}>
                    {member.category === "child" ? "Umwana" :
                     member.category === "youth" ? "Urubyiruko" : "Umukuru"}
                  </span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <FaVenusMars />
                    {member.gender === "male" ? "Gabo" : "Gore"}
                  </span>
                  {member.dateOfBirth && (
                    <span className="flex items-center gap-1 text-gray-600">
                      <FaCalendarAlt />
                      {new Date(member.dateOfBirth).toLocaleDateString()}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 ${
                    member.isActive ? "text-green-600" : "text-red-600"
                  }`}>
                    {member.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                    {member.isActive ? "Ariho" : "Ntakiriho"}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Ikimezo</div>
              <div className="font-semibold">
                {member.accessibility === "alive" ? "Ariho" :
                 member.accessibility === "dead" ? "Yapfuye" : "Yimukiye"}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Content */}
        {activeTab === "family" ? (
          <FamilyTab family={family} summary={summary} />
        ) : (
          <FamilyTreeTab member={member} family={family} />
        )}
      </div>
    </div>
  );
}

// Family Tab Component
function FamilyTab({ family, summary }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          icon={<FaUserFriends className="text-blue-500 text-2xl" />}
          title="Abana"
          count={summary.totalChildren}
          color="blue"
        />
        <SummaryCard
          icon={<FaUsers className="text-green-500 text-2xl" />}
          title="Abavandimwe"
          count={summary.totalSiblings}
          color="green"
        />
        <SummaryCard
          icon={<FaChild className="text-purple-500 text-2xl" />}
          title="Abuzukuru"
          count={summary.totalGrandchildren}
          color="purple"
        />
        <SummaryCard
          icon={<FaHeart className="text-red-500 text-2xl" />}
          title="Uwo bashakanye"
          count={summary.hasSpouse ? 1 : 0}
          color="red"
        />
      </div>

      {/* Parents Section */}
      {family.parents && family.parents.length > 0 && (
        <FamilySection title="Ababyeyi" icon={<FaUserGraduate />}>
          {family.parents.map((parent, idx) => (
            <FamilyMemberCard key={idx} member={parent} relation="Parent" />
          ))}
        </FamilySection>
      )}

      {/* Spouse Section */}
      {family.spouse && (
        <FamilySection title="Uwo bashakanye" icon={<FaRing />}>
          <FamilyMemberCard member={family.spouse} relation="Spouse" />
        </FamilySection>
      )}

      {/* Children Section */}
      {family.children && family.children.length > 0 && (
        <FamilySection title="Abana" icon={<FaChild />}>
          {family.children.map((child) => (
            <FamilyMemberCard key={child._id} member={child} relation="Child" />
          ))}
        </FamilySection>
      )}

      {/* Siblings Section */}
      {family.siblings && family.siblings.length > 0 && (
        <FamilySection title="Abavandimwe" icon={<FaUsers />}>
          {family.siblings.map((sibling) => (
            <FamilyMemberCard key={sibling._id} member={sibling} relation="Sibling" />
          ))}
        </FamilySection>
      )}

      {/* Grandchildren Section */}
      {family.grandchildren && family.grandchildren.length > 0 && (
        <FamilySection title="Abuzukuru" icon={<FaChild />}>
          {family.grandchildren.map((grandchild) => (
            <FamilyMemberCard key={grandchild._id} member={grandchild} relation="Grandchild" />
          ))}
        </FamilySection>
      )}

      {/* Grandparents Section */}
      {family.grandparents && family.grandparents.length > 0 && (
        <FamilySection title="Abakuru" icon={<FaUserGraduate />}>
          {family.grandparents.map((grandparent, idx) => (
            <FamilyMemberCard key={idx} member={grandparent} relation="Grandparent" />
          ))}
        </FamilySection>
      )}
    </div>
  );
}

// Family Tree Tab Component
function FamilyTreeTab({ member, family }) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
      <div className="min-w-[600px]">
        {/* Tree Structure */}
        <div className="relative">
          {/* Grandparents Row */}
          {family.grandparents && family.grandparents.length > 0 && (
            <div className="mb-12">
              <h3 className="text-center text-gray-600 mb-4">Abakuru</h3>
              <div className="flex justify-center gap-8">
                {family.grandparents.map((gp, idx) => (
                  <TreeMemberCard key={idx} member={gp} />
                ))}
              </div>
              <div className="relative mt-4">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
              </div>
            </div>
          )}

          {/* Parents Row */}
          {family.parents && family.parents.length > 0 && (
            <div className="mb-12">
              <h3 className="text-center text-gray-600 mb-4">Ababyeyi</h3>
              <div className="flex justify-center gap-8">
                {family.parents.map((parent, idx) => (
                  <TreeMemberCard key={idx} member={parent} />
                ))}
              </div>
              <div className="relative mt-4">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
              </div>
            </div>
          )}

          {/* Current Member and Spouse */}
          <div className="mb-12">
            <div className="flex justify-center items-center gap-8">
              <TreeMemberCard member={member} isMain />
              {family.spouse && (
                <>
                  <div className="text-gray-400">+</div>
                  <TreeMemberCard member={family.spouse} />
                </>
              )}
            </div>
            <div className="relative mt-4">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-px h-8 bg-gray-300"></div>
            </div>
          </div>

          {/* Children Row */}
          {family.children && family.children.length > 0 && (
            <div>
              <h3 className="text-center text-gray-600 mb-4">Abana</h3>
              <div className="flex flex-wrap justify-center gap-4">
                {family.children.map((child) => (
                  <TreeMemberCard key={child._id} member={child} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon, title, count, color }) {
  return (
    <div className={`bg-white rounded-lg shadow-md p-4 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{count}</p>
        </div>
        <div className={`text-${color}-500`}>{icon}</div>
      </div>
    </div>
  );
}

// Family Section Component
function FamilySection({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          {icon}
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Family Member Card Component
function FamilyMemberCard({ member, relation }) {
  const navigate = useNavigate();
  
  const getCategoryColor = (category) => {
    switch(category) {
      case "child": return "bg-green-100 text-green-700";
      case "youth": return "bg-yellow-100 text-yellow-700";
      default: return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div 
      onClick={() => navigate(`/members/${member._id}`)}
      className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <h4 className="font-semibold text-gray-800">{member.fullName}</h4>
          <div className="flex items-center gap-2 mt-1">
            <span className={`px-2 py-1 rounded-full text-xs ${getCategoryColor(member.category)}`}>
              {member.category === "child" ? "Umwana" :
               member.category === "youth" ? "Urubyiruko" : "Umukuru"}
            </span>
            <span className="text-xs text-gray-500">
              {member.gender === "male" ? "Gabo" : "Gore"}
            </span>
          </div>
        </div>
        <div className="text-xs text-gray-400">{relation}</div>
      </div>
      {member.dateOfBirth && (
        <p className="text-xs text-gray-500 mt-2">
          <FaCalendarAlt className="inline mr-1 text-xs" />
          {new Date(member.dateOfBirth).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// Tree Member Card Component
function TreeMemberCard({ member, isMain = false }) {
  const navigate = useNavigate();
  
  return (
    <div 
      onClick={() => navigate(`/members/${member._id}`)}
      className={`bg-white rounded-lg shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
        isMain ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
      style={{ minWidth: "150px" }}
    >
      <div className="text-center">
        <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
          isMain ? "bg-blue-500" : "bg-gray-200"
        }`}>
          <FaUser className={isMain ? "text-white" : "text-gray-500"} />
        </div>
        <p className={`font-semibold text-sm ${isMain ? "text-blue-600" : "text-gray-800"}`}>
          {member.fullName}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {member.category === "child" ? "Umwana" :
           member.category === "youth" ? "Urubyiruko" : "Umukuru"}
        </p>
      </div>
    </div>
  );
}