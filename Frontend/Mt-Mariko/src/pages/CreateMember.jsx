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
  });

  const [parents, setParents] = useState([]);
  const [subgroups, setSubgroups] = useState([]);
  const [sakraments, setSakraments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, sakRes, parentRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        setSubgroups(subRes.data);
        setSakraments(sakRes.data);

        const adults = parentRes.data.filter(
          (member) => member.category === "adult"
        );
        setParents(adults);
      } catch (err) {
        console.error("Ntibishoboye kubona amakuru:", err);
        setError("Nanone kugerageza kongera");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "category" && value !== "child" ? { parent: "" } : {}),
    }));
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
    if (formData.category === "child" && !formData.parent) {
      errors.parent = "Umubyeyi arafuzwe ku mwana";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        category: formData.category,
        gender: formData.gender,
        ...(formData.nationalId?.trim() ? { nationalId: formData.nationalId.trim() } : {}),
        ...(formData.dateOfBirth ? { dateOfBirth: formData.dateOfBirth } : {}),
        ...(formData.phone?.trim() ? { phone: formData.phone.trim() } : {}),
        ...(formData.category === "child" && formData.parent
          ? { parent: formData.parent }
          : {}),
        ...(formData.subgroup ? { subgroup: formData.subgroup } : {}),
        ...(formData.sakraments.length > 0
          ? { sakraments: formData.sakraments }
          : {}),
      };

      await api.post("/members", payload);
      setSuccess(true);
      
      // Show success message and redirect
      setTimeout(() => {
        navigate("/members");
      }, 1500);
      
    } catch (err) {
      const message =
        err.response?.data?.errors?.map((e) => e.msg).join(", ") ||
        err.response?.data?.message ||
        "Kurema umunyamuryango byanze";

      setError(message);
      
      // Scroll to top to show error
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        
        {/* Back Button - Mobile Optimized */}
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

        {/* Main Form Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl 
                      transition-shadow duration-300 overflow-hidden">
          
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
              Andika Umunyamuryango Mushya
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm text-center mt-1">
              Uzuza neza amakuru yose asabwa
            </p>
          </div>

          {/* Form Container */}
          <div className="p-4 sm:p-6 md:p-8">
            
            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 
                            rounded-lg p-3 sm:p-4 flex items-start gap-3">
                <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm sm:text-base font-medium">
                    Umunyamuryango yanditswe neza!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Turongera tujya ku rutonde...
                  </p>
                </div>
              </div>
            )}

            {/* Error Message */}
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
              
              {/* Full Name - Required */}
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

              {/* Category - Required */}
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

              {/* Parent - Conditional */}
              {formData.category === "child" && (
                <div className="space-y-1">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Umubyeyi <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 
                                      text-blue-400 text-sm sm:text-base" />
                    <select
                      name="parent"
                      value={formData.parent}
                      onChange={handleChange}
                      required
                      className={`w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 
                                 border rounded-lg sm:rounded-xl 
                                 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                 text-sm sm:text-base appearance-none bg-white
                                 ${validationErrors.parent ? 'border-red-500 bg-red-50' : 'border-gray-200'}`}
                    >
                      <option value="">Hitamo Umubyeyi</option>
                      {parents.length === 0 ? (
                        <option value="" disabled>Nta babyeyi babonetse</option>
                      ) : (
                        parents.map((p) => (
                          <option key={p._id} value={p._id}>
                            {p.fullName}
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

              {/* Two Column Layout for larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                
                {/* National ID */}
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

                {/* Phone */}
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

                {/* Date of Birth */}
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

                {/* Gender - Required */}
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

              {/* Subgroup - Required */}
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
                    "Andika Umunyamuryango"
                  )}
                </button>
              </div>

              {/* Required Fields Note */}
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