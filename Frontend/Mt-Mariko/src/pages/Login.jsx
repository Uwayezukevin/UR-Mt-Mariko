import { useState, useEffect } from "react";
import { 
  FaUser, 
  FaLock, 
  FaArrowLeft,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaShieldAlt,
  FaCheckCircle,
  FaExclamationCircle
} from "react-icons/fa";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    useremail: "",
    userpassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  // Check for saved email on component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail) {
      setFormData(prev => ({ ...prev, useremail: savedEmail }));
      setRememberMe(true);
    }
  }, []);

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

  const validateForm = () => {
    const errors = {};
    
    if (!formData.useremail.trim()) {
      errors.useremail = "Email ni ngombwa";
    } else if (!/\S+@\S+\.\S+/.test(formData.useremail)) {
      errors.useremail = "Email itari mu buryo bukwiriye";
    }
    
    if (!formData.userpassword) {
      errors.userpassword = "Ijambobanga ni ngombwa";
    } else if (formData.userpassword.length < 6) {
      errors.userpassword = "Ijambobanga rigomba kuba byibura 6";
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
      const res = await api.post("/users/login", {
        useremail: formData.useremail,
        userpassword: formData.userpassword,
      });

      // Save token
      localStorage.setItem("token", res.data.token);
      
      // Save email if remember me is checked
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", formData.useremail);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      // Show success message and redirect
      setError(""); // Clear any errors
      
      // Add a small delay for better UX
      setTimeout(() => {
        navigate("/dashboard");
      }, 500);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Kwinjira byanze. Ongera ugerageze.";
      setError(errorMessage);
      
      // Clear password field on error for security
      setFormData(prev => ({ ...prev, userpassword: "" }));
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
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

        {/* Login Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header with Gradient */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 sm:px-8 py-6 sm:py-8 text-center">
            <div className="bg-white/20 rounded-full w-16 h-16 sm:w-20 sm:h-20 
                          flex items-center justify-center mx-auto mb-4">
              <FaShieldAlt className="text-white text-2xl sm:text-3xl" />
            </div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-2">
              Murakaza Neza
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm">
              Injira muri konti yawe kugirango ukomeze
            </p>
          </div>

          {/* Form Container */}
          <div className="p-5 sm:p-6 md:p-8">
            
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

            {/* Success Message Example - Uncomment if needed */}
            {/* {success && (
              <div className="mb-4 sm:mb-6 bg-green-50 border border-green-200 
                            rounded-xl p-3 sm:p-4 flex items-start gap-3">
                <FaCheckCircle className="text-green-500 text-lg sm:text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-green-700 text-xs sm:text-sm font-medium">
                    Kwinjira byagenze neza!
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm mt-1">
                    Turongera tujya kuri dashboard...
                  </p>
                </div>
              </div>
            )} */}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" autoComplete="off">
              
              {/* Email Field */}
              <div className="space-y-1">
                <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaEnvelope className={`text-base sm:text-lg ${
                      validationErrors.useremail ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type="email"
                    name="useremail"
                    placeholder="andika@email.com"
                    value={formData.useremail}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${validationErrors.useremail 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  {formData.useremail && !validationErrors.useremail && (
                    <FaCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-base" />
                  )}
                </div>
                {validationErrors.useremail && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle className="text-xs" />
                    {validationErrors.useremail}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-medium text-gray-700 block">
                    Ijambobanga
                  </label>
                  <button
                    type="button"
                    onClick={() => navigate("/forgot-password")}
                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    Wibagiwe?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaLock className={`text-base sm:text-lg ${
                      validationErrors.userpassword ? 'text-red-400' : 'text-blue-400'
                    }`} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="userpassword"
                    placeholder="••••••••"
                    value={formData.userpassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-12 py-3 sm:py-4 
                               border-2 rounded-xl text-sm sm:text-base
                               focus:outline-none focus:ring-2 focus:ring-blue-500
                               transition-all duration-200
                               ${validationErrors.userpassword 
                                 ? 'border-red-300 bg-red-50 focus:ring-red-500' 
                                 : 'border-gray-200 focus:border-blue-500'
                               }`}
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 -translate-y-1/2 
                             text-gray-400 hover:text-blue-600 transition-colors
                             p-1 rounded-lg hover:bg-gray-100"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash className="text-base" /> : <FaEye className="text-base" />}
                  </button>
                </div>
                {validationErrors.userpassword && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <FaExclamationCircle className="text-xs" />
                    {validationErrors.userpassword}
                  </p>
                )}
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded 
                             focus:ring-blue-500 cursor-pointer"
                  />
                  <span className="text-xs sm:text-sm text-gray-600 group-hover:text-blue-600 
                                 transition-colors">
                    Munyibuke
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 
                         text-white py-3 sm:py-4 rounded-xl
                         hover:from-blue-700 hover:to-blue-800 
                         transition-all duration-300 transform hover:scale-[1.02]
                         text-sm sm:text-base font-medium
                         disabled:opacity-60 disabled:cursor-not-allowed
                         disabled:hover:scale-100 shadow-md hover:shadow-lg
                         flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 
                                  border-2 border-white border-t-transparent"></div>
                    <span>Kwinjira...</span>
                  </>
                ) : (
                  <>
                    <FaUser className="text-sm sm:text-base" />
                    <span>Injira</span>
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

            {/* Sign Up Link */}
            <p className="text-center text-xs sm:text-sm text-gray-500">
              Nta konti ufite?{" "}
              <button
                onClick={() => navigate("/signup")}
                className="text-blue-600 hover:text-blue-800 font-medium 
                         hover:underline transition-colors"
              >
                Hanga konti
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

      {/* Add animation styles */}
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