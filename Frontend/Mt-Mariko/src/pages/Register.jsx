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
  FaInfoCircle
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    userphonenumber: "",
    useremail: "",
    userpassword: "",
    confirmPassword: "",
  });
  
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
      setValidationErrors(prev => ({ ...prev, [name]: "" }));
    }
    
    // Clear general error when user starts typing
    if (error) setError("");
  };

  const handleBlur = (field) => {
    setTouchedFields(prev => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const errors = { ...validationErrors };
    
    switch(field) {
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
        } else if (!/^(\+250|0)7[0-9]{8}$/.test(value.replace(/\s/g, ''))) {
          errors.userphonenumber = "Telefone igomba gutangira na 07 cyangwa +2507";
        }
        break;
        
      case "userpassword":
        if (!value) {
          errors.userpassword = "Ijambobanga ni ngombwa";
        } else if (value.length < 6) {
          errors.userpassword = "Ijambobanga rigomba kuba byibura 6";
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
          errors.userpassword = "Ijambobanga rigomba kuba rifite inyuguti nini, nto, n'imibare";
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

  const validateForm = () => {
    const fields = ["username", "useremail", "userphonenumber", "userpassword", "confirmPassword"];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => allTouched[key] = true);
    setTouchedFields(allTouched);
    
    // Validate all fields
    if (!validateForm()) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4 py-6 sm:px-6">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 
                   mb-4 sm:mb-6 text-sm sm:text-base transition-colors
                   active:opacity-70 px-2 py-2 -ml-2 rounded-lg active:bg-blue-50
                   hover:underline group"
        >
          <FaArrowLeft className="text-sm sm:text-base group-hover:-translate-x-1 transition-transform" /> 
          <span className="font-medium">Subira Inyuma</span>
        </button>

        {/* Signup Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6 sm:py-8 text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                          flex items-center justify-center mx-auto mb-4">
              <FaUser className="text-white text-2xl sm:text-3xl" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
            Guhanga Konti
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Uzuza amakuru yawe kugirango ukomeze
            </p>
          </div>

          {/* Form Container */}
          <div className="p-5 sm:p-6 md:p-8">
            
            {/* Success Message */}
            {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 
                            rounded-xl p-3 sm:p-4 flex items-start gap-3">
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

            {/* Error Message */}
            {error && (
              <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 
                            rounded-xl p-3 sm:p-4 flex items-start gap-3 animate-shake">
                <FaExclamationCircle className="text-red-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-700 text-xs sm:text-sm font-medium">
                    Habayemo ikibazo
                  </p>
                  <p className="text-red-600 text-xs sm:text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" autoComplete="off">
              
              {/* Username Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Amazina yombi <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaUser className={`text-base sm:text-lg ${
                      touchedFields.username && validationErrors.username 
                        ? 'text-red-400' 
                        : touchedFields.username && formData.username 
                        ? 'text-green-500'
                        : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type="text"
                    name="username"
                    placeholder="Andika amazina yawe"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={() => handleBlur("username")}
                    required
                    className={`w-full pl-10 pr-4 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${touchedFields.username && validationErrors.username 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : touchedFields.username && formData.username && !validationErrors.username
                                 ? 'border-green-300 bg-green-50'
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  {touchedFields.username && formData.username && !validationErrors.username && (
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

              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`text-base sm:text-lg ${
                      touchedFields.useremail && validationErrors.useremail 
                        ? 'text-red-400' 
                        : touchedFields.useremail && formData.useremail 
                        ? 'text-green-500'
                        : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="useremail"
                    placeholder="andika@email.com"
                    value={formData.useremail}
                    onChange={handleChange}
                    onBlur={() => handleBlur("useremail")}
                    required
                    className={`w-full pl-10 pr-4 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${touchedFields.useremail && validationErrors.useremail 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : touchedFields.useremail && formData.useremail && !validationErrors.useremail
                                 ? 'border-green-300 bg-green-50'
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  {touchedFields.useremail && formData.useremail && !validationErrors.useremail && (
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

              {/* Phone Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Telefone <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaPhone className={`text-base sm:text-lg ${
                      touchedFields.userphonenumber && validationErrors.userphonenumber 
                        ? 'text-red-400' 
                        : touchedFields.userphonenumber && formData.userphonenumber 
                        ? 'text-green-500'
                        : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type="tel"
                    name="userphonenumber"
                    placeholder="07XXXXXXXX"
                    value={formData.userphonenumber}
                    onChange={handleChange}
                    onBlur={() => handleBlur("userphonenumber")}
                    required
                    className={`w-full pl-10 pr-4 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${touchedFields.userphonenumber && validationErrors.userphonenumber 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : touchedFields.userphonenumber && formData.userphonenumber && !validationErrors.userphonenumber
                                 ? 'border-green-300 bg-green-50'
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  {touchedFields.userphonenumber && formData.userphonenumber && !validationErrors.userphonenumber && (
                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                  )}
                </div>
                {touchedFields.userphonenumber && validationErrors.userphonenumber && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle className="text-xs" />
                    {validationErrors.userphonenumber}
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-1">
                  Urugero: 0788123456 cyangwa +250788123456
                </p>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Ijambobanga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`text-base sm:text-lg ${
                      touchedFields.userpassword && validationErrors.userpassword 
                        ? 'text-red-400' 
                        : touchedFields.userpassword && formData.userpassword 
                        ? 'text-green-500'
                        : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="userpassword"
                    placeholder="••••••••"
                    value={formData.userpassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("userpassword")}
                    required
                    className={`w-full pl-10 pr-12 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${touchedFields.userpassword && validationErrors.userpassword 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : touchedFields.userpassword && formData.userpassword && !validationErrors.userpassword
                                 ? 'border-green-300 bg-green-50'
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-400 hover:text-blue-600 transition-colors
                             p-1 rounded-lg hover:bg-gray-100"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                  </button>
                </div>
                
                {/* Password Strength Meter */}
                {formData.userpassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <div className="flex gap-1 flex-1">
                        <div className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength > 0 ? getPasswordStrengthColor() : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength > 25 ? getPasswordStrengthColor() : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength > 50 ? getPasswordStrengthColor() : 'bg-gray-200'
                        }`}></div>
                        <div className={`h-1 flex-1 rounded-full transition-all ${
                          passwordStrength > 75 ? getPasswordStrengthColor() : 'bg-gray-200'
                        }`}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <FaInfoCircle className="text-gray-400" />
                      Ijambobanga rigomba kuba rifite inyuguti nini, nto, n'imibare
                    </p>
                  </div>
                )}
                
                {touchedFields.userpassword && validationErrors.userpassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle className="text-xs" />
                    {validationErrors.userpassword}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Emeza Ijambobanga <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`text-base sm:text-lg ${
                      touchedFields.confirmPassword && validationErrors.confirmPassword 
                        ? 'text-red-400' 
                        : touchedFields.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.userpassword
                        ? 'text-green-500'
                        : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={() => handleBlur("confirmPassword")}
                    required
                    className={`w-full pl-10 pr-12 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${touchedFields.confirmPassword && validationErrors.confirmPassword 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : touchedFields.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.userpassword
                                 ? 'border-green-300 bg-green-50'
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-400 hover:text-blue-600 transition-colors
                             p-1 rounded-lg hover:bg-gray-100"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                  </button>
                </div>
                {touchedFields.confirmPassword && validationErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle className="text-xs" />
                    {validationErrors.confirmPassword}
                  </p>
                )}
                {touchedFields.confirmPassword && formData.confirmPassword && formData.confirmPassword === formData.userpassword && (
                  <p className="text-green-500 text-xs mt-1 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    Ijambobanga rirahwanye
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || success}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                         text-white py-3 sm:py-4 rounded-xl
                         hover:from-blue-700 hover:to-blue-800 
                         transition-all duration-300 transform hover:scale-[1.02]
                         text-sm sm:text-base font-medium
                         disabled:opacity-60 disabled:cursor-not-allowed
                         disabled:hover:scale-100 shadow-md hover:shadow-lg
                         flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 
                                  border-2 border-white border-t-transparent"></div>
                    <span>Konti iri gukorwa...</span>
                  </>
                ) : (
                  <>
                    <FaUser className="text-sm sm:text-base" />
                    <span>Hanga Konti</span>
                  </>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className="px-3 bg-white text-gray-500">Cyangwa</span>
              </div>
            </div>

            {/* Login Link */}
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Ufite konti?{" "}
              <button
                onClick={() => navigate("/")}
                className="text-blue-600 hover:text-blue-800 font-medium 
                         hover:underline transition-colors"
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

        {/* Footer Links */}
        <div className="mt-4 sm:mt-6 text-center text-xs text-gray-400">
          <a href="#" className="hover:text-blue-600 transition-colors">Amategeko</a>
          <span className="mx-2">•</span>
          <a href="#" className="hover:text-blue-600 transition-colors">Ubujyanama</a>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
          20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}