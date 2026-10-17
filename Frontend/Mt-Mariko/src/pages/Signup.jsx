import { useState, useEffect } from "react";
import {
  FaUser,
  FaPhone,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaCheckCircle,
  FaExclamationCircle,
  FaArrowLeft,
  FaShieldAlt,
  FaInfoCircle,
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import Stepper from "../components/Stepper";

export default function Signup() {
  const navigate = useNavigate();

  const steps = [
    { id: "info", title: "Amakuru yawe" },
    { id: "security", title: "Umutekano" },
  ];

  const [formData, setFormData] = useState({
    username: "",
    userphonenumber: "",
    useremail: "",
    userpassword: "",
    confirmPassword: "",
  });

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touchedFields, setTouchedFields] = useState({});

  // Password strength checker
  useEffect(() => {
    const password = formData.userpassword;
    let strength = 0;

    if (password.length >= 8) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 15;
    if (password.match(/[^a-zA-Z0-9]/)) strength += 10;

    setPasswordStrength(Math.min(strength, 100));
  }, [formData.userpassword]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Clear general error when user starts typing
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };

    switch (field) {
      case "username":
        if (!value.trim()) {
          errors.username = "Amazina ni ngombwa";
        } else if (value.trim().length < 3) {
          errors.username = "Amazina agomba kuba byibura 3";
        }
        break;

      case "useremail":
        if (!value.trim()) {
          errors.useremail = "Email ni ngombwa";
        } else if (!/\S+@\S+\.\S+/.test(value)) {
          errors.useremail = "Email itari mu buryo bukwiriye";
        }
        break;

      case "userphonenumber":
        if (!value.trim()) {
          errors.userphonenumber = "Telefone ni ngombwa";
        } else if (!/^(\+250|0)7[0-9]{8}$/.test(value.replace(/\s/g, ""))) {
          errors.userphonenumber =
            "Telefone igomba gutangira na 07 cyangwa +2507";
        }
        break;

      case "userpassword":
        if (!value) {
          errors.userpassword = "Ijambobanga ni ngombwa";
        } else if (value.length < 6) {
          errors.userpassword = "Ijambobanga rigomba kuba byibura 6";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.userpassword =
            "Ijambobanga rigomba kuba rifite inyuguti nini, nto, n'imibare";
        }
        break;

      case "confirmPassword":
        if (value !== formData.userpassword) {
          errors.confirmPassword = "Ijambobanga ntirihwanye";
        }
        break;

      default:
        break;
    }

    setValidationErrors(errors);
    return !errors[field];
  };

  const validateStep = (stepIndex) => {
    const fields =
      stepIndex === 0
        ? ["username", "useremail", "userphonenumber"]
        : ["userpassword", "confirmPassword"];

    const touched = {};
    let isValid = true;

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

  const handleNext = () => {
    if (validateStep(step)) {
      goToStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) goToStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach((key) => (allTouched[key] = true));
    setTouchedFields(allTouched);

    // Validate every step
    if (!validateStep(0) || !validateStep(1)) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      await api.post("/users/register", {
        username: formData.username,
        userphonenumber: formData.userphonenumber,
        useremail: formData.useremail,
        userpassword: formData.userpassword,
      });

      setSuccess(true);

      // Clear form
      setFormData({
        username: "",
        userphonenumber: "",
        useremail: "",
        userpassword: "",
        confirmPassword: "",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      if (err.response?.data?.errors) {
        const messages = err.response.data.errors.map((e) => e.msg).join(", ");
        setError(messages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Ntibyashoboye guhanga konti. Ongera ugerageze.");
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 40) return "bg-red-500";
    if (passwordStrength < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 40) return "Ijambobanga rike";
    if (passwordStrength < 70) return "Ijambobanga ririmo";
    return "Ijambobanga rikomeye";
  };

  const inputClass = (field, isValid) =>
    `w-full pl-10 pr-4 py-3 sm:py-4 border-2 rounded-xl text-sm sm:text-base
     focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200
     ${
       touchedFields[field] && validationErrors[field]
         ? "border-red-300 bg-red-50 focus:ring-red-500"
         : touchedFields[field] && isValid && !validationErrors[field]
           ? "border-green-300 bg-green-50"
           : "border-gray-200 focus:border-blue-500"
     }`;

  const iconClass = (field, filled) =>
    `text-base sm:text-lg ${
      touchedFields[field] && validationErrors[field]
        ? "text-red-400"
        : touchedFields[field] && filled
          ? "text-green-500"
          : "text-blue-400"
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-200/40 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-green-200/40 rounded-full blur-3xl animate-blob animation-delay-2000" />
      </div>

      <div className="relative w-full max-w-xl">
        {/* Back */}
        <button
          type="button"
          onClick={() => (step > 0 ? handleBack() : navigate(-1))}
          className="mb-4 sm:mb-6 inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors text-sm sm:text-base font-medium"
        >
          <FaArrowLeft className="text-xs sm:text-sm" />
          {step > 0 ? "Inyuma" : "Subira Inyuma"}
        </button>

        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-blue-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6 sm:py-8 text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-white text-2xl sm:text-3xl" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Guhanga Konti
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Uzuza amakuru yawe kugirango ukomeze
            </p>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            {/* Success */}
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-fade-in">
                <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-sm sm:text-base font-medium">
                    Konti yawe yagenze neza!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Turongera tujya kwinjira...
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
              <Stepper steps={steps} currentStep={step} />
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
              autoComplete="off"
            >
              {/* STEP 1 — Personal info */}
              {step === 0 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  {/* Username */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Amazina yombi <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser
                          className={iconClass("username", formData.username)}
                        />
                      </div>
                      <input
                        type="text"
                        name="username"
                        placeholder="Andika amazina yawe"
                        value={formData.username}
                        onChange={handleChange}
                        onBlur={() => handleBlur("username")}
                        required
                        className={inputClass("username", formData.username)}
                      />
                      {touchedFields.username &&
                        formData.username &&
                        !validationErrors.username && (
                          <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                        )}
                    </div>
                    {touchedFields.username && validationErrors.username && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" />
                        {validationErrors.username}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope
                          className={iconClass("useremail", formData.useremail)}
                        />
                      </div>
                      <input
                        type="email"
                        name="useremail"
                        placeholder="andika@email.com"
                        value={formData.useremail}
                        onChange={handleChange}
                        onBlur={() => handleBlur("useremail")}
                        required
                        className={inputClass("useremail", formData.useremail)}
                      />
                      {touchedFields.useremail &&
                        formData.useremail &&
                        !validationErrors.useremail && (
                          <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                        )}
                    </div>
                    {touchedFields.useremail && validationErrors.useremail && (
                      <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                        <FaExclamationCircle className="text-xs" />
                        {validationErrors.useremail}
                      </p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Telefone <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone
                          className={iconClass(
                            "userphonenumber",
                            formData.userphonenumber,
                          )}
                        />
                      </div>
                      <input
                        type="tel"
                        name="userphonenumber"
                        placeholder="07XXXXXXXX"
                        value={formData.userphonenumber}
                        onChange={handleChange}
                        onBlur={() => handleBlur("userphonenumber")}
                        required
                        className={inputClass(
                          "userphonenumber",
                          formData.userphonenumber,
                        )}
                      />
                      {touchedFields.userphonenumber &&
                        formData.userphonenumber &&
                        !validationErrors.userphonenumber && (
                          <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                        )}
                    </div>
                    {touchedFields.userphonenumber &&
                      validationErrors.userphonenumber && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.userphonenumber}
                        </p>
                      )}
                    <p className="text-xs text-gray-400 mt-1">
                      Urugero: 0788123456 cyangwa +250788123456
                    </p>
                  </div>

                  {/* Next */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:scale-[1.02] text-sm sm:text-base font-medium shadow-md hover:shadow-lg mt-2"
                  >
                    Komeza
                  </button>
                </div>
              )}

              {/* STEP 2 — Security */}
              {step === 1 && (
                <div className="space-y-4 sm:space-y-5 animate-fade-in">
                  {/* Password */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Ijambobanga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock
                          className={iconClass(
                            "userpassword",
                            formData.userpassword,
                          )}
                        />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="userpassword"
                        placeholder="••••••••"
                        value={formData.userpassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur("userpassword")}
                        required
                        className={`${inputClass(
                          "userpassword",
                          formData.userpassword,
                        )} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        aria-label={showPassword ? "Hisha" : "Erekana"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>

                    {formData.userpassword && (
                      <div className="space-y-1 pt-1">
                        <div className="flex gap-1">
                          {[0, 25, 50, 75].map((threshold) => (
                            <div
                              key={threshold}
                              className={`h-1 flex-1 rounded-full transition-all ${
                                passwordStrength > threshold
                                  ? getPasswordStrengthColor()
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <FaInfoCircle />
                            Ijambobanga rigomba kuba rifite inyuguti nini, nto,
                            n'imibare
                          </p>
                          <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                            {getPasswordStrengthText()}
                          </span>
                        </div>
                      </div>
                    )}

                    {touchedFields.userpassword &&
                      validationErrors.userpassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.userpassword}
                        </p>
                      )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                      Emeza Ijambobanga <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaLock
                          className={iconClass(
                            "confirmPassword",
                            formData.confirmPassword,
                          )}
                        />
                      </div>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={() => handleBlur("confirmPassword")}
                        required
                        className={`${inputClass(
                          "confirmPassword",
                          formData.confirmPassword,
                        )} pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                        aria-label={showConfirmPassword ? "Hisha" : "Erekana"}
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    {touchedFields.confirmPassword &&
                      validationErrors.confirmPassword && (
                        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                          <FaExclamationCircle className="text-xs" />
                          {validationErrors.confirmPassword}
                        </p>
                      )}
                    {touchedFields.confirmPassword &&
                      formData.confirmPassword &&
                      formData.confirmPassword === formData.userpassword && (
                        <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                          <FaCheckCircle className="text-xs" />
                          Ijambobanga rirahwanye
                        </p>
                      )}
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleBack}
                      disabled={loading}
                      className="flex-1 bg-gray-100 text-gray-700 py-3 sm:py-4 rounded-xl hover:bg-gray-200 transition-colors text-sm sm:text-base font-medium disabled:opacity-60"
                    >
                      Inyuma
                    </button>
                    <button
                      type="submit"
                      disabled={loading || success}
                      className="flex-[2] bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 sm:py-4 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm sm:text-base font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white border-t-transparent" />
                          <span>Konti iri gukorwa...</span>
                        </>
                      ) : (
                        "Hanga Konti"
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 bg-white text-gray-500">Cyangwa</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Ufite konti?{" "}
              <button
                type="button"
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Injira hano
              </button>
            </p>

            {/* Security Note */}
            <div className="mt-4 sm:mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <FaShieldAlt className="text-gray-400 text-xs" />
                Amakuru yawe ari mu mutekano
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
