import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaPhone,
  FaCalendarAlt,
  FaArrowLeft,
  FaIdCard,
  FaVenusMars,
  FaUsers,
  FaLayerGroup,
  FaCross,
  FaCheckCircle,
  FaExclamationCircle,
  FaSave,
  FaTimes,
  FaInfoCircle,
  FaUserCheck,
  FaHeartbeat,
  FaSkull,
  FaTruck,
  FaRing,
} from "react-icons/fa";
import api from "../api/axios";
import Stepper from "../components/Stepper";

export default function UpdateMember() {
  const { id } = useParams();
  const navigate = useNavigate();

  const steps = [
    { id: "personal", title: "Amakuru bwite" },
    { id: "family", title: "Umuryango" },
    { id: "status", title: "Ikimezo" },
    { id: "sakraments", title: "Amasakramentu" },
  ];
  const lastStep = steps.length - 1;

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
  const [marriageSakramentId, setMarriageSakramentId] = useState(null);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const [showAccessibilityNotes, setShowAccessibilityNotes] = useState(false);
  const [showSpouse, setShowSpouse] = useState(false);

  const accessibilityOptions = [
    {
      value: "alive",
      label: "Ariho",
      icon: <FaHeartbeat />,
      active: "bg-green-50 border-green-500 text-green-700",
    },
    {
      value: "dead",
      label: "Yitabye Imana",
      icon: <FaSkull />,
      active: "bg-gray-100 border-gray-500 text-gray-700",
    },
    {
      value: "moved",
      label: "Yimukiye ahandi",
      icon: <FaTruck />,
      active: "bg-orange-50 border-orange-500 text-orange-700",
    },
  ];

  // ================= FETCH =================
  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetchLoading(true);

        const [memberRes, subRes, sakRes, membersRes] = await Promise.all([
          api.get(`/members/${id}`),
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        const m = memberRes.data;

        // Find marriage sakrament ID
        const marriageSak = sakRes.data.find((s) => s.name === "Ugushyingirwa");
        if (marriageSak) {
          setMarriageSakramentId(marriageSak._id);
        }

        const loadedSakraments = Array.isArray(m.sakraments)
          ? m.sakraments.map((s) => s._id || s)
          : [];

        setFormData({
          fullName: m.fullName || "",
          category: m.category || "",
          nationalId: m.nationalId || "",
          dateOfBirth: m.dateOfBirth ? m.dateOfBirth.split("T")[0] : "",
          phone: m.phone || "",
          parent: m.parent?._id || m.parent || "",
          gender: m.gender || "",
          subgroup: m.subgroup?._id || m.subgroup || "",
          sakraments: loadedSakraments,
          spouse: m.spouse?._id || m.spouse || "",
          accessibility: m.accessibility || "alive",
          accessibilityNotes: m.accessibilityNotes || "",
          isActive: m.isActive !== undefined ? m.isActive : true,
        });

        // Spouse field visibility
        const hasMarriageSakrament = loadedSakraments.includes(
          marriageSak?._id,
        );
        setShowSpouse(hasMarriageSakrament || Boolean(m.spouse?._id || m.spouse));

        // Show notes field if accessibility is not "alive"
        if (m.accessibility && m.accessibility !== "alive") {
          setShowAccessibilityNotes(true);
        }

        setSubgroups(subRes.data);
        setSakraments(sakRes.data);
        setMembers(membersRes.data);

        // Potential parents (adult + youth), excluding self
        const potentialParents = membersRes.data.filter(
          (p) =>
            (p.category === "adult" || p.category === "youth") && p._id !== id,
        );
        setAllParents(potentialParents);

        const adultParents = membersRes.data.filter(
          (p) => p.category === "adult" && p._id !== id,
        );

        // If member is child and parent not in adultParents, add it
        if (m.category === "child" && m.parent) {
          const existingParentId = m.parent?._id || m.parent;
          if (!adultParents.find((p) => p._id === existingParentId)) {
            adultParents.push({
              _id: existingParentId,
              fullName: m.parent.fullName || "Current Parent",
              category: m.parent.category || "adult",
            });
          }
        }

        setParents(adultParents);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Ntibyashoboye gupakira amakuru y'umunyamuryango");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // ================= INPUT =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Reset parent when category changes
      if (name === "category") {
        updated.parent = "";
      }

      // Handle accessibility change
      if (name === "accessibility") {
        setShowAccessibilityNotes(value !== "alive");

        if (value === "dead" || value === "moved") {
          updated.isActive = false;
        } else if (value === "alive") {
          updated.isActive = true;
        }
      }

      return updated;
    });
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case "fullName":
        if (!value?.trim()) {
          errors.fullName = "Amazina ni ngombwa";
        } else if (value.trim().length < 3) {
          errors.fullName = "Amazina agomba kuba byibura 3";
        }
        break;

      case "category":
        if (!value) {
          errors.category = "Icyiciro ni ngombwa";
        }
        break;

      case "gender":
        if (!value) {
          errors.gender = "Igitsina ni ngombwa";
        }
        break;

      case "phone":
        if (value && !/^(\+250|0)7[0-9]{8}$/.test(value.replace(/\s/g, ""))) {
          errors.phone = "Telefone igomba gutangira na 07 cyangwa +2507";
        }
        break;

      case "parent":
        if (
          (formData.category === "child" || formData.category === "youth") &&
          !value
        ) {
          errors.parent =
            formData.category === "child"
              ? "Umwana agomba kugira umubyeyi"
              : "Urubyiruko rugomba kugira umubyeyi";
        }
        break;

      case "spouse": {
        const hasMarriage = formData.sakraments.includes(marriageSakramentId);
        if (hasMarriage && !value) {
          errors.spouse = "Ugomba gushyiraho uwo mwashyingiranywe";
        }
        if (value === id) {
          errors.spouse = "Ntushobora kwishyingira";
        }
        break;
      }

      case "accessibilityNotes":
        if (formData.accessibility !== "alive" && !value?.trim()) {
          errors.accessibilityNotes = "Andika impamvu y'ihinduka ry'ikimezo";
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return !errors[field];
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName?.trim()) {
      errors.fullName = "Amazina ni ngombwa";
    }
    if (!formData.category) {
      errors.category = "Icyiciro ni ngombwa";
    }
    if (!formData.gender) {
      errors.gender = "Igitsina ni ngombwa";
    }

    if (
      (formData.category === "child" || formData.category === "youth") &&
      !formData.parent
    ) {
      errors.parent =
        formData.category === "child"
          ? "Umwana agomba kugira umubyeyi"
          : "Urubyiruko rugomba kugira umubyeyi";
    }

    const hasMarriage = formData.sakraments.includes(marriageSakramentId);
    if (hasMarriage && !formData.spouse) {
      errors.spouse = "Ugomba gushyiraho uwo mwashyingiranywe";
    }
    if (formData.spouse === id) {
      errors.spouse = "Ntushobora kwishyingira";
    }

    if (
      formData.accessibility !== "alive" &&
      !formData.accessibilityNotes?.trim()
    ) {
      errors.accessibilityNotes = "Andika impamvu y'ihinduka ry'ikimezo";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep = (stepIndex) => {
    const stepFields = {
      0: ["fullName", "category", "gender", "phone"],
      1: ["parent", ...(showSpouse ? ["spouse"] : [])],
      2: formData.accessibility !== "alive" ? ["accessibilityNotes"] : [],
      3: [],
    };

    const fields = stepFields[stepIndex] || [];
    const touched = {};
    let isValid = true;

    stepFields[0] && stepIndex === 0 && (touched.fullName = true);
    fields.forEach((field) => {
      touched[field] = true;
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });

    setTouchedFields((prev) => ({ ...prev, ...touched }));
    return isValid;
  };

  const goToStep = (index) => {
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((s) => s - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleSakramentToggle = (sakId) => {
    setFormData((prev) => {
      const newSakraments = prev.sakraments.includes(sakId)
        ? prev.sakraments.filter((s) => s !== sakId)
        : [...prev.sakraments, sakId];

      const hasMarriage = newSakraments.includes(marriageSakramentId);
      setShowSpouse(hasMarriage);

      if (!hasMarriage) {
        return { ...prev, sakraments: newSakraments, spouse: "" };
      }

      return { ...prev, sakraments: newSakraments };
    });
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouchedFields(allTouched);

    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const cleanedData = { ...formData };

      Object.keys(cleanedData).forEach((key) => {
        if (
          cleanedData[key] === "" ||
          cleanedData[key] === null ||
          cleanedData[key] === undefined
        ) {
          if (key === "parent") {
            cleanedData[key] = null;
          } else {
            delete cleanedData[key];
          }
        }
      });

      if (cleanedData.spouse === "" || !cleanedData.spouse) {
        cleanedData.spouse = null;
      }

      await api.put(`/members/${id}`, cleanedData);

      setSuccess(true);

      setTimeout(() => {
        navigate(`/members/${id}`);
      }, 1500);
    } catch (err) {
      console.error(err);

      if (
        err.response?.data?.code === 11000 ||
        err.response?.data?.message?.includes("duplicate")
      ) {
        setError("Indangamuntu isanzwe ikoreshwa n'undi munyamuryango");
      } else {
        setError(
          err.response?.data?.message || "Ntibyashoboye guhindura amakuru",
        );
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(-1);

  const getParentOptions = () => {
    if (formData.category === "child") {
      return allParents;
    } else if (formData.category === "youth") {
      return parents;
    } else if (formData.category === "adult") {
      return allParents;
    }
    return [];
  };

  const getPotentialSpouses = () => {
    const oppositeGender = formData.gender === "male" ? "female" : "male";
    return members.filter(
      (m) =>
        m.gender === oppositeGender &&
        m.accessibility === "alive" &&
        m._id !== id &&
        (m.category === "adult" || m.category === "youth"),
    );
  };

  // Shared input styling helper
  const inputClass = (field, filled, extra = "") =>
    `w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border-2 rounded-xl text-sm sm:text-base
     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${extra}
     ${
       touchedFields[field] && validationErrors[field]
         ? "border-red-300 bg-red-50 focus:ring-red-500"
         : touchedFields[field] && filled && !validationErrors[field]
           ? "border-green-300 bg-green-50"
           : "border-gray-200 focus:border-blue-500"
     }`;

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 sm:h-20 sm:w-20 border-4 border-blue-200 border-t-blue-600 mx-auto" />
            <FaUser className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-600 text-lg sm:text-xl" />
          </div>
          <p className="text-gray-600 text-sm sm:text-base mt-4">
            Birimo gupakira amakuru y'umunyamuryango...
          </p>
        </div>
      </div>
    );
  }

  const parentOptions = getParentOptions();
  const potentialSpouses = getPotentialSpouses();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 px-3 sm:px-4 md:px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors active:opacity-70 px-2 py-2 -ml-2 rounded-lg active:bg-blue-50 group"
          >
            <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm sm:text-base">
              Subira Inyuma
            </span>
          </button>

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Hindura Umunyamuryango
          </h1>

          <div className="w-16 sm:w-20" />
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
          {/* Gradient header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <FaUserCheck className="text-white text-lg sm:text-xl" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-white">
                  Hindura amakuru ya {formData.fullName || "Umunyamuryango"}
                </h2>
                <p className="text-blue-100 text-xs sm:text-sm mt-1">
                  Uzuza neza amakuru yose ukeneye guhindura
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            {/* Success */}
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-fade-in">
                <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm sm:text-base font-medium">
                    Amakuru yahinduwe neza!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Turiguhindura amakuru ku rutonde...
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-shake">
                <FaExclamationCircle className="text-red-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-xs sm:text-sm font-medium">
                    Habayemo ikibazo
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Stepper */}
            <div className="mb-6 sm:mb-8">
              <Stepper
                steps={steps}
                currentStep={step}
                onStepClick={goToStep}
              />
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
              {/* STEP 1 — Personal */}
              {step === 0 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Amazina yose <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaUser
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.fullName && validationErrors.fullName
                              ? "text-red-400"
                              : touchedFields.fullName && formData.fullName
                                ? "text-green-500"
                                : "text-blue-400"
                          }`}
                        />
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          onBlur={() => handleBlur("fullName")}
                          placeholder="Andika amazina yose"
                          className={inputClass("fullName", formData.fullName)}
                        />
                        {touchedFields.fullName &&
                          formData.fullName &&
                          !validationErrors.fullName && (
                            <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm" />
                          )}
                      </div>
                      {touchedFields.fullName && validationErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.fullName}
                        </p>
                      )}
                    </div>

                    {/* National ID */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Indangamuntu
                      </label>
                      <div className="relative">
                        <FaIdCard className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <input
                          type="text"
                          name="nationalId"
                          value={formData.nationalId}
                          onChange={handleChange}
                          placeholder="Indangamuntu"
                          className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Icyiciro <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaUsers
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.category && validationErrors.category
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          onBlur={() => handleBlur("category")}
                          className={`${inputClass("category", formData.category)} appearance-none bg-white`}
                        >
                          <option value="">Hitamo Icyiciro</option>
                          <option value="child">Umwana</option>
                          <option value="youth">Urubyiruko</option>
                          <option value="adult">Umukuru</option>
                        </select>
                      </div>
                      {touchedFields.category && validationErrors.category && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.category}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Igitsina <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaVenusMars
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.gender && validationErrors.gender
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          onBlur={() => handleBlur("gender")}
                          className={`${inputClass("gender", formData.gender)} appearance-none bg-white`}
                        >
                          <option value="">Hitamo Igitsina</option>
                          <option value="male">Gabo</option>
                          <option value="female">Gore</option>
                        </select>
                      </div>
                      {touchedFields.gender && validationErrors.gender && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.gender}
                        </p>
                      )}
                    </div>

                    {/* Date of Birth */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Itariki y'Amavuko
                      </label>
                      <div className="relative">
                        <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <input
                          type="date"
                          name="dateOfBirth"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                        />
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Telefone
                      </label>
                      <div className="relative">
                        <FaPhone
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.phone && validationErrors.phone
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          onBlur={() => handleBlur("phone")}
                          placeholder="07XXXXXXXX"
                          className={inputClass("phone", formData.phone)}
                        />
                      </div>
                      {touchedFields.phone && validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Subgroup */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Umuryango remezo
                    </label>
                    <div className="relative">
                      <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                      <select
                        name="subgroup"
                        value={formData.subgroup}
                        onChange={handleChange}
                        className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                      >
                        <option value="">Hitamo Umuryango remezo</option>
                        {subgroups.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep(0)) {
                          setStep(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="px-6 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm sm:text-base font-medium shadow-md"
                    >
                      Komeza
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 — Family */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  {/* Parent */}
                  {formData.category && formData.category !== "adult" && (
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        {formData.category === "child"
                          ? "Umubyeyi"
                          : "Umubyeyi (urubyiruko)"}{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaUser
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.parent && validationErrors.parent
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <select
                          name="parent"
                          value={formData.parent}
                          onChange={handleChange}
                          onBlur={() => handleBlur("parent")}
                          className={`${inputClass("parent", formData.parent)} appearance-none bg-white`}
                        >
                          <option value="">Hitamo Umubyeyi</option>
                          {parentOptions.length === 0 ? (
                            <option value="" disabled>
                              Nta babyeyi babonetse
                            </option>
                          ) : (
                            parentOptions.map((p) => (
                              <option key={p._id} value={p._id}>
                                {p.fullName} (
                                {p.category === "adult" ? "Umukuru" : "Urubyiruko"}
                                )
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      {touchedFields.parent && validationErrors.parent && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.parent}
                        </p>
                      )}
                    </div>
                  )}

                  {formData.category === "adult" && (
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Umubyeyi{" "}
                        <span className="text-xs text-gray-400 ml-2">
                          (Ntayo)
                        </span>
                      </label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <select
                          name="parent"
                          value={formData.parent}
                          onChange={handleChange}
                          className="w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border-2 border-gray-200 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none bg-white"
                        >
                          <option value="">Hitamo Umubyeyi (Ntawe)</option>
                          {getParentOptions().map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.fullName} (
                              {p.category === "adult" ? "Umukuru" : "Urubyiruko"})
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        Umukuru ashobora kugira umubyeyi cyangwa ntamugire
                      </p>
                    </div>
                  )}

                  {/* Spouse */}
                  {showSpouse && (
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Uwo mwashyingiranywe{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaRing
                          className={`absolute left-3 top-1/2 -translate-y-1/2 text-sm sm:text-base ${
                            touchedFields.spouse && validationErrors.spouse
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <select
                          name="spouse"
                          value={formData.spouse}
                          onChange={handleChange}
                          onBlur={() => handleBlur("spouse")}
                          className={`${inputClass("spouse", formData.spouse)} appearance-none bg-white`}
                        >
                          <option value="">Hitamo uwo mwashyingiranywe</option>
                          {potentialSpouses.length === 0 ? (
                            <option value="" disabled>
                              Nta bashakanye babonetse
                            </option>
                          ) : (
                            potentialSpouses.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.fullName} (
                                {s.category === "adult"
                                  ? "Umukuru"
                                  : "Urubyiruko"}
                                )
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      {touchedFields.spouse && validationErrors.spouse && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.spouse}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        Hitamo uwo mwashyingiranywe (gusa abakuru n'urubyiruko)
                      </p>
                    </div>
                  )}

                  {!showSpouse && formData.category === "adult" && (
                    <p className="text-sm text-gray-500">
                      Nta makuru y'umuryango y'inyongera akenewe.
                    </p>
                  )}

                  {/* Nav */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      Inyuma
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const fields = ["parent"];
                        if (showSpouse) fields.push("spouse");
                        const ok = fields.reduce(
                          (acc, f) => validateField(f, formData[f]) && acc,
                          true,
                        );
                        setTouchedFields((prev) => ({
                          ...prev,
                          ...Object.fromEntries(fields.map((f) => [f, true])),
                        }));
                        if (ok) {
                          setStep(2);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm sm:text-base font-medium shadow-md"
                    >
                      Komeza
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 — Status */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Ikimezo cy'umunyamuryango{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {accessibilityOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleChange({
                              target: {
                                name: "accessibility",
                                value: option.value,
                              },
                            })
                          }
                          className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                            formData.accessibility === option.value
                              ? option.active
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          <span className="text-2xl">{option.icon}</span>
                          <span className="text-sm font-medium">
                            {option.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {showAccessibilityNotes && (
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Impamvu y'ihinduka{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaInfoCircle
                          className={`absolute left-3 top-3 text-sm sm:text-base ${
                            touchedFields.accessibilityNotes &&
                            validationErrors.accessibilityNotes
                              ? "text-red-400"
                              : "text-blue-400"
                          }`}
                        />
                        <textarea
                          name="accessibilityNotes"
                          value={formData.accessibilityNotes}
                          onChange={handleChange}
                          onBlur={() => handleBlur("accessibilityNotes")}
                          placeholder={
                            formData.accessibility === "dead"
                              ? "Andika igihe n'impamvu y'urupfu (urugero: Yapfuye ku ya 15/03/2026)"
                              : "Andika aho yimukiye n'igihe (urugero: Yimukiye i Musanze ku ya 10/01/2026)"
                          }
                          rows="3"
                          className={`w-full pl-9 pr-4 py-3 sm:py-3.5 border-2 rounded-xl text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 resize-none ${
                            touchedFields.accessibilityNotes &&
                            validationErrors.accessibilityNotes
                              ? "border-red-300 bg-red-50 focus:ring-red-500"
                              : touchedFields.accessibilityNotes &&
                                  formData.accessibilityNotes
                                ? "border-green-300 bg-green-50"
                                : "border-gray-200 focus:border-blue-500"
                          }`}
                        />
                      </div>
                      {touchedFields.accessibilityNotes &&
                        validationErrors.accessibilityNotes && (
                          <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                            <FaExclamationCircle className="text-xs" />
                            {validationErrors.accessibilityNotes}
                          </p>
                        )}
                    </div>
                  )}

                  {/* isActive */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Ikimezo cy'akazi
                    </label>
                    <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive === true}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, isActive: true }))
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Arakora</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="radio"
                          name="isActive"
                          checked={formData.isActive === false}
                          onChange={() =>
                            setFormData((prev) => ({ ...prev, isActive: false }))
                          }
                          className="w-4 h-4 text-blue-600"
                        />
                        <span className="text-sm">Ntakora</span>
                      </label>
                      <span className="text-xs text-gray-500 ml-auto">
                        {formData.accessibility === "alive"
                          ? "Ariho - ashobora gukora"
                          : "Ntabwo ashobora gukora"}
                      </span>
                    </div>
                  </div>

                  {/* Nav */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 py-3 sm:py-3.5 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium"
                    >
                      Inyuma
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (validateStep(2)) {
                          setStep(3);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }
                      }}
                      className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-3.5 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all text-sm sm:text-base font-medium shadow-md"
                    >
                      Komeza
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4 — Sakraments */}
              {step === lastStep && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="border-2 border-gray-100 rounded-xl p-4 sm:p-5 bg-gray-50">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <FaCross className="text-blue-600" />
                      Amasakramentu
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
                      {sakraments.map((s) => (
                        <button
                          type="button"
                          key={s._id}
                          onClick={() => handleSakramentToggle(s._id)}
                          className={`px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-200 border-2 ${
                            formData.sakraments.includes(s._id)
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm">
                    <h3 className="font-semibold text-gray-700 mb-2">
                      Incamake
                    </h3>
                    <ul className="space-y-1 text-gray-600">
                      <li>
                        <span className="text-gray-400">Amazina:</span>{" "}
                        {formData.fullName || "—"}
                      </li>
                      <li>
                        <span className="text-gray-400">Icyiciro:</span>{" "}
                        {formData.category
                          ? {
                              child: "Umwana",
                              youth: "Urubyiruko",
                              adult: "Umukuru",
                            }[formData.category]
                          : "—"}
                      </li>
                      <li>
                        <span className="text-gray-400">Ikimezo:</span>{" "}
                        {accessibilityOptions.find(
                          (o) => o.value === formData.accessibility,
                        )?.label || "—"}
                      </li>
                      <li>
                        <span className="text-gray-400">Amasakramentu:</span>{" "}
                        {formData.sakraments.length}
                      </li>
                    </ul>
                  </div>

                  {/* Nav */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 py-3 sm:py-4 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base font-medium disabled:opacity-60"
                    >
                      Inyuma
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm sm:text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-md flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                          <span>Birimo guhindurwa...</span>
                        </>
                      ) : (
                        <>
                          <FaSave className="text-sm sm:text-base" />
                          <span>Hindura Umukristu</span>
                        </>
                      )}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleCancel}
                    className="w-full py-3 rounded-xl text-sm sm:text-base font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <FaTimes className="text-sm" />
                    Kurekera aho
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
