import { useState, useEffect } from "react";
import {
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaCalendarAlt,
  FaPhone,
  FaIdBadge,
  FaVenusMars,
  FaLayerGroup,
  FaCheckCircle,
  FaExclamationCircle,
  FaHeartbeat,
  FaSkull,
  FaTruck,
  FaInfoCircle,
  FaRing,
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function CreateMember() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    category: "",
    nationalId: "",
    dateOfBirth: "",
    phone: "",
    parent: "",
    gender: "",
    subgroup: "",
    sakraments: [],
    spouse: "",
    accessibility: "alive",
    accessibilityNotes: "",
    isActive: true,
  });

  const [parents, setParents] = useState([]);
  const [allParents, setAllParents] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [sakraments, setSakraments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showNotes, setShowNotes] = useState(false);
  const [showSpouse, setShowSpouse] = useState(false);
  const [marriageSakramentId, setMarriageSakramentId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data...");
        
        const [subRes, sakRes, membersRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        console.log("Subgroups response:", subRes.data);
        console.log("Sakraments response:", sakRes.data);
        console.log("Members response:", membersRes.data);

        // Handle different response formats
        const subgroupsData = Array.isArray(subRes.data) ? subRes.data : 
                              subRes.data.subgroups || subRes.data.members || [];
        
        const sakramentsData = Array.isArray(sakRes.data) ? sakRes.data : 
                               sakRes.data.sakraments || sakRes.data.members || [];
        
        let membersData = [];
        if (Array.isArray(membersRes.data)) {
          membersData = membersRes.data;
        } else if (membersRes.data.members && Array.isArray(membersRes.data.members)) {
          membersData = membersRes.data.members;
        } else if (membersRes.data.data && Array.isArray(membersRes.data.data)) {
          membersData = membersRes.data.data;
        }

        console.log("Processed members data:", membersData);

        setSubgroups(subgroupsData);
        setSakraments(sakramentsData);
        setMembers(membersData);

        // Find marriage sakrament ID
        const marriage = sakramentsData.find(s => s.name === "Ugushyingirwa");
        if (marriage) {
          setMarriageSakramentId(marriage._id);
        }

        // Get all potential parents (adults and youth)
        const potentialParents = membersData.filter(
          (member) => member.category === "adult" || member.category === "youth"
        );
        setAllParents(potentialParents);

        // Filter adult parents
        const adults = membersData.filter(
          (member) => member.category === "adult"
        );
        setParents(adults);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        console.error("Error details:", err.response?.data);
        setError("Failed to load form data: " + (err.response?.data?.message || err.message));
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  // Check if marriage sakrament is selected
  const isMarriageSakramentSelected = () => {
    return marriageSakramentId && formData.sakraments.includes(marriageSakramentId);
  };

  // Update spouse field visibility when sakraments change
  useEffect(() => {
    setShowSpouse(isMarriageSakramentSelected());
    // Clear spouse if marriage is deselected
    if (!isMarriageSakramentSelected() && formData.spouse) {
      setFormData(prev => ({ ...prev, spouse: "" }));
    }
  }, [formData.sakraments, marriageSakramentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === "category" && value !== "child") {
        updated.parent = "";
      }
      
      if (name === "accessibility") {
        setShowNotes(value !== "alive");
        if (value === "dead" || value === "moved") {
          updated.isActive = false;
        } else if (value === "alive") {
          updated.isActive = true;
        }
      }
      
      return updated;
    });
  };

  const handleSakramentToggle = (id) => {
    setFormData((prev) => ({
      ...prev,
      sakraments: prev.sakraments.includes(id)
        ? prev.sakraments.filter((s) => s !== id)
        : [...prev.sakraments, id],
    }));
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName?.trim()) {
      errors.fullName = "Amazina yose arafuzwe";
    }
    if (!formData.category) {
      errors.category = "Icyiciro arafuzwe";
    }
    if (!formData.gender) {
      errors.gender = "Igitsina arafuzwe";
    }
    if (!formData.subgroup) {
      errors.subgroup = "Umuryango remezo arafuzwe";
    }
    
    // Parent validation - required for child and youth
    if (formData.category && formData.category !== "adult" && !formData.parent) {
      errors.parent = formData.category === "child" 
        ? "Umwana agomba kugira umubyeyi" 
        : "Urubyiruko rugomba kugira umubyeyi";
    }
    
    // Spouse validation - only if marriage is selected
    if (showSpouse && !formData.spouse) {
      errors.spouse = "Ugomba gushyiraho uwo mwashyingiranywe";
    }
    
    if (formData.accessibility !== "alive" && !formData.accessibilityNotes?.trim()) {
      errors.accessibilityNotes = "Andika impamvu y'ihinduka ry'ikimezo";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Build payload - only include fields that have values
      const payload = {
        fullName: formData.fullName.trim(),
        category: formData.category,
        gender: formData.gender,
        subgroup: formData.subgroup,
        accessibility: formData.accessibility,
        isActive: formData.isActive,
      };

      // Only add optional fields if they have values
      if (formData.nationalId?.trim()) {
        payload.nationalId = formData.nationalId.trim();
      }
      
      if (formData.dateOfBirth) {
        payload.dateOfBirth = formData.dateOfBirth;
      }
      
      if (formData.phone?.trim()) {
        payload.phone = formData.phone.trim();
      }
      
      if (formData.sakraments.length > 0) {
        payload.sakraments = formData.sakraments;
      }
      
      if (formData.accessibilityNotes?.trim()) {
        payload.accessibilityNotes = formData.accessibilityNotes.trim();
      }

      // Add parent - ONLY for non-adult categories OR if explicitly selected for adult
      if (formData.category !== "adult" && formData.parent) {
        payload.parent = formData.parent;
      } else if (formData.category === "adult" && formData.parent) {
        // Adults can have parents too, but it's optional
        payload.parent = formData.parent;
      }

      // Add spouse if marriage is selected AND spouse is selected
      if (showSpouse && formData.spouse) {
        payload.spouse = formData.spouse;
      }

      console.log("📤 Submitting payload:", JSON.stringify(payload, null, 2));
      
      const response = await api.post("/members", payload);
      console.log("✅ Member created:", response.data);
      
      setSuccess(true);
      
      setTimeout(() => {
        navigate("/members");
      }, 1500);
      
    } catch (err) {
      console.error("❌ Error creating member:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      
      // Handle specific error messages
      let errorMessage = "Kurema Umukristu byanze. Ongera ugerageze.";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors.map(e => e.msg).join(", ");
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      
      // Handle duplicate national ID
      if (errorMessage.includes("duplicate") || errorMessage.includes("Indangamuntu")) {
        errorMessage = "Indangamuntu isanzwe ikoreshwa n'undi muntu";
      }
      
      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  // Get potential spouses (adults of opposite gender who are alive)
  const getPotentialSpouses = () => {
    if (!formData.gender) return [];
    const oppositeGender = formData.gender === "male" ? "female" : "male";
    return members.filter(m => 
      m.gender === oppositeGender && 
      m.accessibility === "alive" &&
      m.category === "adult"
    );
  };

  // Determine which parents to show
  const getParentOptions = () => {
    if (!formData.category) return [];
    if (formData.category === "child") {
      return allParents;
    } else if (formData.category === "youth") {
      return parents;
    } else if (formData.category === "adult") {
      return allParents;
    }
    return [];
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Turimo gutegura...</p>
        </div>
      </div>
    );
  }

  const parentOptions = getParentOptions();
  const potentialSpouses = getPotentialSpouses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                     mb-3 sm:mb-4 text-sm sm:text-base transition-colors
                     active:opacity-70 px-2 py-2 -ml-2 rounded-lg active:bg-blue-50"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-sm sm:text-base" /> 
          <span className="font-medium">Subira inyuma</span>
        </button>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl 
                      transition-shadow duration-300 overflow-hidden">
          
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
              Andika Umukristu Mushya
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm text-center mt-1">
              Uzuza neza amakuru yose asabwa
            </p>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 
                            rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm sm:text-base font-medium">
                    Umukristu yanditswe neza!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Turongera tujya ku rutonde...
                  </p>
                </div>
              </div>
            )}

            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 
                            rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <FaExclamationCircle className="text-red-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-sm sm:text-base font-medium">
                    Habayemo ikibazo
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" autoComplete="off">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Amazina yose <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 
                                    text-blue-400 text-sm sm:text-base" />
                  <input
                    type="text"
                    name="fullName"
                    placeholder="Andika amazina yose"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base transition-all
                               ${validationErrors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  />
                </div>
                {validationErrors.fullName && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.fullName}</p>
                )}
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Icyiciro <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 
                                    text-blue-400 text-sm sm:text-base" />
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base appearance-none bg-white
                               ${validationErrors.category ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  >
                    <option value="">Hitamo Icyiciro</option>
                    <option value="child">Umwana</option>
                    <option value="youth">Urubyiruko</option>
                    <option value="adult">Umukuru</option>
                  </select>
                </div>
                {validationErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.category}</p>
                )}
              </div>

              {/* Parent */}
              {formData.category && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Umubyeyi 
                    {formData.category !== "adult" && <span className="text-red-500 ml-1">*</span>}
                    {formData.category === "adult" && (
                      <span className="text-xs text-gray-400 ml-2">(Ntayo)</span>
                    )}
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-blue-400 text-sm sm:text-base" />
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={handleChange}
                      required={formData.category !== "adult"}
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.parent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">
                        {formData.category === "adult" 
                          ? "Hitamo Umubyeyi (Ntawe)" 
                          : `Hitamo Umubyeyi w'${formData.category === "child" ? "Umwana" : "Umukristu"}`}
                      </option>
                      {parentOptions.length === 0 ? (
                        <option value="" disabled>Nta babyeyi babonetse</option>
                      ) : (
                        parentOptions.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.fullName} ({p.category === "adult" ? "Umukuru" : "Urubyiruko"})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {validationErrors.parent && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.parent}</p>
                  )}
                </div>
              )}

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Indangamuntu
                  </label>
                  <div className="relative">
                    <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 
                                        text-blue-400 text-sm sm:text-base" />
                    <input
                      type="text"
                      name="nationalId"
                      placeholder="Indangamuntu"
                      value={formData.nationalId}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border border-gray-200 rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Telefoni
                  </label>
                  <div className="relative">
                    <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-blue-400 text-sm sm:text-base" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="0788 123 456"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border border-gray-200 rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Itariki y'Amavuko
                  </label>
                  <div className="relative">
                    <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 
                                            text-blue-400 text-sm sm:text-base" />
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border border-gray-200 rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Igitsina <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 
                                          text-blue-400 text-sm sm:text-base" />
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.gender ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Hitamo Igitsina</option>
                      <option value="male">Gabo</option>
                      <option value="female">Gore</option>
                    </select>
                  </div>
                  {validationErrors.gender && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.gender}</p>
                  )}
                </div>
              </div>

              {/* Subgroup */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Umuryango Remezo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 
                                          text-blue-400 text-sm sm:text-base" />
                  <select
                    name="subgroup"
                    value={formData.subgroup}
                    onChange={handleChange}
                    required
                    className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                               border rounded-lg sm:rounded-xl 
                               focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                               text-sm sm:text-base appearance-none bg-white
                               ${validationErrors.subgroup ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                  >
                    <option value="">Hitamo Umuryango Remezo</option>
                    {subgroups.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                {validationErrors.subgroup && (
                  <p className="text-red-500 text-xs mt-1">{validationErrors.subgroup}</p>
                )}
              </div>

              {/* Spouse Field - Shows when Ugushyingirwa is selected */}
              {showSpouse && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Uwo mwashyingiranywe <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaRing className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-blue-400 text-sm sm:text-base" />
                    <select
                      name="spouse"
                      value={formData.spouse}
                      onChange={handleChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.spouse ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Hitamo uwo mwashyingiranywe</option>
                      {potentialSpouses.length === 0 ? (
                        <option value="" disabled>Nta bashakanye babonetse</option>
                      ) : (
                        potentialSpouses.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.fullName} ({s.category === "adult" ? "Umukuru" : "Urubyiruko"})
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  {validationErrors.spouse && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.spouse}</p>
                  )}
                </div>
              )}

              {/* Accessibility Status */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Ikimezo cy'Umukristu <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "alive", label: "Ariho", icon: <FaHeartbeat />, color: "green" },
                    { value: "dead", label: "Yapfuye", icon: <FaSkull />, color: "gray" },
                    { value: "moved", label: "Yimukiye", icon: <FaTruck />, color: "orange" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleChange({ target: { name: "accessibility", value: option.value } })}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 
                                 transition-all duration-200
                                 ${formData.accessibility === option.value
                                   ? `bg-${option.color}-50 border-${option.color}-500 text-${option.color}-700`
                                   : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                 }`}
                    >
                      <span className="text-lg">{option.icon}</span>
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accessibility Notes */}
              {showNotes && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Impamvu y'ihinduka <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaInfoCircle className={`absolute left-3 top-3 text-sm sm:text-base
                                            ${validationErrors.accessibilityNotes ? 'text-red-400' : 'text-blue-400'}`} />
                    <textarea
                      name="accessibilityNotes"
                      value={formData.accessibilityNotes}
                      onChange={handleChange}
                      placeholder={formData.accessibility === "dead" 
                        ? "Andika igihe n'impamvu y'urupfu..." 
                        : "Andika aho yimukiye n'igihe..."}
                      rows="3"
                      className={`w-full pl-9 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 text-sm sm:text-base transition-all resize-none
                                 ${validationErrors.accessibilityNotes ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    />
                  </div>
                  {validationErrors.accessibilityNotes && (
                    <p className="text-red-500 text-xs mt-1">{validationErrors.accessibilityNotes}</p>
                  )}
                </div>
              )}

              {/* Sakraments */}
              <div className="space-y-2 sm:space-y-3">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Amasakramentu
                </label>
                <div className="flex flex-wrap gap-2">
                  {sakraments.map((s) => (
                    <button
                      type="button"
                      key={s._id}
                      onClick={() => handleSakramentToggle(s._id)}
                      className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full 
                                 border-2 transition-all duration-200 font-medium
                                 ${formData.sakraments.includes(s._id)
                                   ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700'
                                   : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                                 }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4 sm:pt-6">
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                           text-white py-3.5 sm:py-4 rounded-lg sm:rounded-xl 
                           hover:from-blue-700 hover:to-blue-800 
                           transition-all duration-300 transform hover:scale-[1.02]
                           text-sm sm:text-base font-medium
                           disabled:opacity-60 disabled:cursor-not-allowed
                           disabled:hover:scale-100 shadow-md hover:shadow-lg"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 
                                    border-2 border-white border-t-transparent"></div>
                      Turimo kurema...
                    </span>
                  ) : (
                    "Andika Umukristu"
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-4">
                <span className="text-red-500">*</span> Ibyanditswe n'inyuguti zitukura birakenewe
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}