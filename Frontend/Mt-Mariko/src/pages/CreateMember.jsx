import { useState, useEffect } from "react";
import {
  FaUser,
  FaUsers,
  FaArrowLeft,
  FaArrowRight,
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
  FaChurch,
  FaChild,
  FaUserGraduate,
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";

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
  const [showSpouse, setShowSpouse] = useState(false);
  const [marriageSakramentId, setMarriageSakramentId] = useState(null);
  const [step, setStep] = useState(0);

  const steps = [
    { id: "personal", title: "Amakuru bwite", icon: <FaUser className="text-xs" /> },
    { id: "family", title: "Umuryango", icon: <FaUsers className="text-xs" /> },
    { id: "extra", title: "Amakuru y'inyongera", icon: <FaInfoCircle className="text-xs" /> },
    { id: "sakraments", title: "Amasakramentu", icon: <FaChurch className="text-xs" /> },
  ];
  const lastStep = steps.length - 1;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subRes, sakRes, membersRes] = await Promise.all([
          api.get("/subgroups"),
          api.get("/sakraments"),
          api.get("/members"),
        ]);

        const subgroupsData = Array.isArray(subRes.data)
          ? subRes.data
          : subRes.data.subgroups || subRes.data.members || [];

        const sakramentsData = Array.isArray(sakRes.data)
          ? sakRes.data
          : sakRes.data.sakraments || sakRes.data.members || [];

        let membersData = [];
        if (Array.isArray(membersRes.data)) {
          membersData = membersRes.data;
        } else if (membersRes.data.members && Array.isArray(membersRes.data.members)) {
          membersData = membersRes.data.members;
        } else if (membersRes.data.data && Array.isArray(membersRes.data.data)) {
          membersData = membersRes.data.data;
        }

        setSubgroups(subgroupsData);
        setSakraments(sakramentsData);
        setMembers(membersData);

        const marriage = sakramentsData.find((s) => s.name === "Ugushyingirwa");
        if (marriage) setMarriageSakramentId(marriage._id);

        setAllParents(
          membersData.filter(
            (member) => member.category === "adult" || member.category === "youth",
          ),
        );
        setParents(membersData.filter((member) => member.category === "adult"));
      } catch (err) {
        setError(
          "Failed to load form data: " +
            (err.response?.data?.message || err.message),
        );
      } finally {
        setFetchLoading(false);
      }
    };

    fetchData();
  }, []);

  const isMarriageSakramentSelected = () =>
    marriageSakramentId && formData.sakraments.includes(marriageSakramentId);

  // Keep spouse field visibility in sync with selected sacraments
  useEffect(() => {
    setShowSpouse(isMarriageSakramentSelected());
    if (!isMarriageSakramentSelected() && formData.spouse) {
      setFormData((prev) => ({ ...prev, spouse: "" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.sakraments, marriageSakramentId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      if (name === "category") {
        updated.parent = "";
        if (updated.accessibility === "alive") updated.isActive = true;
      }

      if (name === "accessibility") {
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

  // Validate only the fields belonging to a given step
  const validateStep = (stepIndex) => {
    const errors = {};

    if (stepIndex === 0) {
      if (!formData.fullName?.trim()) errors.fullName = "Amazina yose arakenewe";
      if (!formData.category) errors.category = "Icyiciro kirakenewe";
      if (!formData.gender) errors.gender = "Igitsina kirakenewe";
    }

    if (stepIndex === 1) {
      if (formData.category && formData.category !== "adult" && !formData.parent) {
        errors.parent =
          formData.category === "child"
            ? "Umwana agomba kugira umubyeyi"
            : "Urubyiruko rugomba kugira umubyeyi";
      }
      if (showSpouse && !formData.spouse) {
        errors.spouse = "Ugomba gushyiraho uwo mwashyingiranywe";
      }
    }

    if (stepIndex === 2) {
      if (formData.accessibility !== "alive" && !formData.accessibilityNotes?.trim()) {
        errors.accessibilityNotes = "Andika impamvu y'ihinduka ry'Icyemezo";
      }
      if (formData.nationalId?.trim() && !/^[0-9]{16}$/.test(formData.nationalId.trim())) {
        errors.nationalId = "Indangamuntu igomba kuba imibare 16";
      }
      if (
        formData.phone?.trim() &&
        !/^(\+2507|07)[0-9]{8}$/.test(formData.phone.trim())
      ) {
        errors.phone =
          "Telefoni igomba kuba iy'u Rwanda (ex: 0788123456 cyangwa +250788123456)";
      }
    }

    return errors;
  };

  const validateAll = () =>
    [0, 1, 2].reduce((acc, s) => ({ ...acc, ...validateStep(s) }), {});

  const handleNext = () => {
    const errors = validateStep(step);
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors({});
    setStep((s) => Math.min(s + 1, lastStep));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBack = () => {
    setValidationErrors({});
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToStep = (index) => {
    setValidationErrors({});
    setStep(index);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateAll();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      // Jump to the first step that has an error
      const firstErrorStep =
        errors.fullName || errors.category || errors.gender
          ? 0
          : errors.parent || errors.spouse
            ? 1
            : 2;
      setStep(firstErrorStep);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const payload = {
        fullName: formData.fullName.trim(),
        category: formData.category,
        gender: formData.gender,
        accessibility: formData.accessibility,
        isActive: formData.isActive,
      };

      if (formData.subgroup) payload.subgroup = formData.subgroup;
      if (formData.nationalId?.trim()) payload.nationalId = formData.nationalId.trim();
      if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
      if (formData.phone?.trim()) payload.phone = formData.phone.trim();
      if (formData.sakraments.length > 0) payload.sakraments = formData.sakraments;
      if (formData.accessibilityNotes?.trim())
        payload.accessibilityNotes = formData.accessibilityNotes.trim();
      if (formData.category !== "adult" && formData.parent) payload.parent = formData.parent;
      if (showSpouse && formData.spouse) payload.spouse = formData.spouse;

      await api.post("/members", payload);

      setSuccess(true);
      setTimeout(() => navigate("/members"), 1500);
    } catch (err) {
      let errorMessage = "Kurema Umukristu byanze. Ongera ugerageze.";

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        errorMessage = err.response.data.errors
          .map((e) => e.msg || e.message)
          .join(", ");
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }

      if (
        errorMessage.toLowerCase().includes("duplicate") ||
        errorMessage.includes("Indangamuntu")
      ) {
        errorMessage = "Indangamuntu isanzwe ikoreshwa n'undi muntu";
      }

      setError(errorMessage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const getParentOptions = () => {
    if (formData.category === "child") return allParents;
    if (formData.category === "youth") return parents;
    if (formData.category === "adult") return allParents;
    return [];
  };

  const getPotentialSpouses = () => {
    if (!formData.gender) return [];
    const oppositeGender = formData.gender === "male" ? "female" : "male";
    return members.filter(
      (m) =>
        m.gender === oppositeGender &&
        m.accessibility === "alive" &&
        m.category === "adult" &&
        !m.spouse,
    );
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

  const inputClass = (hasError) =>
    `w-full pl-9 sm:pl-10 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all ${
      hasError ? "border-red-500 bg-red-50" : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-4 sm:py-6 md:py-10 px-3 sm:px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-3 sm:mb-4 text-sm sm:text-base transition-colors active:opacity-70 px-2 py-2 -ml-2 rounded-lg active:bg-blue-50"
          aria-label="Go back"
        >
          <FaArrowLeft className="text-sm sm:text-base" />
          <span className="font-medium">Subira inyuma</span>
        </button>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 sm:px-6 md:px-8 py-4 sm:py-5">
            <div className="flex items-center justify-center gap-2 mb-2">
              <FaChurch className="text-white text-2xl sm:text-3xl" />
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-white text-center">
                Andika Umukristu Mushya
              </h1>
            </div>
            <p className="text-blue-100 text-xs sm:text-sm text-center">
              Uzuza amakuru mu ntambwe nkeyi
            </p>
          </div>

          {/* Stepper */}
          <div className="px-4 sm:px-8 pt-5 sm:pt-6">
            <Stepper steps={steps} currentStep={step} onStepClick={goToStep} />
          </div>

          {/* Form Body */}
          <div className="p-4 sm:p-6 md:p-8">
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 animate-fade-in">
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
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4 flex items-start gap-3 animate-fade-in">
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
              {/* STEP 1 — Personal */}
              {step === 0 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Amazina yose <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Andika amazina yose"
                        value={formData.fullName}
                        onChange={handleChange}
                        className={inputClass(validationErrors.fullName)}
                      />
                    </div>
                    {validationErrors.fullName && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" /> {validationErrors.fullName}
                      </p>
                    )}
                  </div>

                  {/* Category as cards */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Icyiciro <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { value: "child", label: "Umwana", icon: <FaChild /> },
                        { value: "youth", label: "Urubyiruko", icon: <FaUserGraduate /> },
                        { value: "adult", label: "Umukuru", icon: <FaUsers /> },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() =>
                            handleChange({ target: { name: "category", value: opt.value } })
                          }
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.category === opt.value
                              ? "bg-blue-50 border-blue-500 text-blue-700"
                              : validationErrors.category
                                ? "bg-white border-red-300 text-gray-600"
                                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300"
                          }`}
                        >
                          <span className="text-lg">{opt.icon}</span>
                          <span className="text-xs font-medium">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                    {validationErrors.category && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" /> {validationErrors.category}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Igitsina <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                      <select
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                        className={`${inputClass(validationErrors.gender)} appearance-none bg-white`}
                      >
                        <option value="">Hitamo Igitsina</option>
                        <option value="male">Gabo</option>
                        <option value="female">Gore</option>
                      </select>
                    </div>
                    {validationErrors.gender && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" /> {validationErrors.gender}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 2 — Family */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Umubyeyi
                      {formData.category && formData.category !== "adult" && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                      {formData.category === "adult" && (
                        <span className="text-xs text-gray-400 ml-2">(Ntayo)</span>
                      )}
                    </label>
                    <div className="relative">
                      <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                      <select
                        name="parent"
                        value={formData.parent}
                        onChange={handleChange}
                        className={`${inputClass(validationErrors.parent)} appearance-none bg-white`}
                      >
                        <option value="">
                          {formData.category === "adult"
                            ? "Hitamo Umubyeyi (Ntawe)"
                            : `Hitamo Umubyeyi w'${formData.category === "child" ? "Umwana" : "Umukristu"}`}
                        </option>
                        {parentOptions.length === 0 ? (
                          <option value="" disabled>
                            Nta babyeyi babonetse
                          </option>
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
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" /> {validationErrors.parent}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Umuryango Remezo <span className="text-gray-400 text-xs">(Ntayo)</span>
                    </label>
                    <div className="relative">
                      <FaLayerGroup className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                      <select
                        name="subgroup"
                        value={formData.subgroup}
                        onChange={handleChange}
                        className={`${inputClass(false)} appearance-none bg-white`}
                      >
                        <option value="">Hitamo Umuryango Remezo (Ntayo)</option>
                        {subgroups.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {showSpouse && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Uwo mwashyingiranywe <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaRing className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <select
                          name="spouse"
                          value={formData.spouse}
                          onChange={handleChange}
                          className={`${inputClass(validationErrors.spouse)} appearance-none bg-white`}
                        >
                          <option value="">Hitamo uwo mwashyingiranywe</option>
                          {potentialSpouses.length === 0 ? (
                            <option value="" disabled>
                              Nta bashakanye babonetse
                            </option>
                          ) : (
                            potentialSpouses.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.fullName} ({s.gender === "male" ? "Gabo" : "Gore"})
                              </option>
                            ))
                          )}
                        </select>
                      </div>
                      {validationErrors.spouse && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" /> {validationErrors.spouse}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 3 — Extra details */}
              {step === 2 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Indangamuntu
                      </label>
                      <div className="relative">
                        <FaIdBadge className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <input
                          type="text"
                          name="nationalId"
                          placeholder="Indangamuntu (imibare 16)"
                          value={formData.nationalId}
                          onChange={handleChange}
                          maxLength="16"
                          className={inputClass(validationErrors.nationalId)}
                        />
                      </div>
                      {validationErrors.nationalId && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.nationalId}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Telefoni
                      </label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 text-sm sm:text-base" />
                        <input
                          type="tel"
                          name="phone"
                          placeholder="0788 123 456"
                          value={formData.phone}
                          onChange={handleChange}
                          className={inputClass(validationErrors.phone)}
                        />
                      </div>
                      {validationErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{validationErrors.phone}</p>
                      )}
                    </div>
                  </div>

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
                        className={inputClass(false)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Icyemezo cy'Umukristu <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { value: "alive", label: "Ariho", icon: <FaHeartbeat />, bgColor: "bg-green-50", borderColor: "border-green-500", textColor: "text-green-700" },
                        { value: "dead", label: "Yitabye Imana", icon: <FaSkull />, bgColor: "bg-gray-50", borderColor: "border-gray-500", textColor: "text-gray-700" },
                        { value: "moved", label: "Yimukiye ahandi", icon: <FaTruck />, bgColor: "bg-orange-50", borderColor: "border-orange-500", textColor: "text-orange-700" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            handleChange({ target: { name: "accessibility", value: option.value } })
                          }
                          className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200 ${
                            formData.accessibility === option.value
                              ? `${option.bgColor} ${option.borderColor} ${option.textColor}`
                              : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                          }`}
                        >
                          <span className="text-lg">{option.icon}</span>
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {formData.accessibility !== "alive" && (
                    <div className="space-y-1 animate-fade-in">
                      <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                        Impamvu y'ihinduka <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FaInfoCircle
                          className={`absolute left-3 top-3 text-sm sm:text-base ${
                            validationErrors.accessibilityNotes ? "text-red-400" : "text-blue-400"
                          }`}
                        />
                        <textarea
                          name="accessibilityNotes"
                          value={formData.accessibilityNotes}
                          onChange={handleChange}
                          placeholder={
                            formData.accessibility === "dead"
                              ? "Andika igihe n'impamvu y'urupfu..."
                              : "Andika aho Yimukiye ahandi n'igihe..."
                          }
                          rows="3"
                          className={`w-full pl-9 pr-4 py-3 sm:py-3.5 border rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base transition-all resize-none ${
                            validationErrors.accessibilityNotes
                              ? "border-red-500 bg-red-50"
                              : "border-gray-200"
                          }`}
                        />
                      </div>
                      {validationErrors.accessibilityNotes && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />{" "}
                          {validationErrors.accessibilityNotes}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 4 — Sacraments */}
              {step === 3 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
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
                          className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-full border-2 transition-all duration-200 font-medium ${
                            formData.sakraments.includes(s._id)
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                              : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                          }`}
                        >
                          {s.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-gray-400 text-xs">Hitamo amasakramentu yakiriye</p>
                  </div>

                  {/* Summary */}
                  <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-sm">
                    <p className="font-semibold text-blue-700 mb-2">Incamake</p>
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-gray-700">
                      <div className="flex justify-between sm:block">
                        <dt className="text-gray-500">Amazina:</dt>
                        <dd className="font-medium">{formData.fullName || "-"}</dd>
                      </div>
                      <div className="flex justify-between sm:block">
                        <dt className="text-gray-500">Icyiciro:</dt>
                        <dd className="font-medium">
                          {formData.category === "child"
                            ? "Umwana"
                            : formData.category === "youth"
                              ? "Urubyiruko"
                              : formData.category === "adult"
                                ? "Umukuru"
                                : "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between sm:block">
                        <dt className="text-gray-500">Igitsina:</dt>
                        <dd className="font-medium">
                          {formData.gender === "male"
                            ? "Gabo"
                            : formData.gender === "female"
                              ? "Gore"
                              : "-"}
                        </dd>
                      </div>
                      <div className="flex justify-between sm:block">
                        <dt className="text-gray-500">Amasakramentu:</dt>
                        <dd className="font-medium">{formData.sakraments.length}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center gap-3 pt-2 sm:pt-4">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={loading}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg sm:rounded-xl border-2 border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-60"
                  >
                    <FaArrowLeft className="text-xs" /> Inyuma
                  </button>
                )}

                {step < lastStep ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                  >
                    Komeza <FaArrowRight className="text-xs" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || success}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent"></div>
                        Turimo kwandika...
                      </>
                    ) : (
                      <>
                        <FaChurch className="text-white" /> Andika Umukristu
                      </>
                    )}
                  </button>
                )}
              </div>

              <p className="text-xs text-gray-500 text-center">
                <span className="text-red-500">*</span> Ibyanditswe n'inyuguti zitukura birakenewe
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
