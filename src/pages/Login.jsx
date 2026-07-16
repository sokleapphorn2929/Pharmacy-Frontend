import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    
    window.dispatchEvent(new Event("theme-changed"));
  }, [isDarkMode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function login(e) {
    e.preventDefault();
    setIsLoading(true);

    axios
      .post(
        "https://pharmacy-system-backend-j77b.onrender.com/api/users/login",
        userData,
      )
      .then((rsp) => {
        alert("Login Successful!");
        const token = rsp.data.token || rsp.data.data?.token;

        console.log("Token received at login step:", token); 

        if (token) {
          localStorage.setItem("authToken", token);
        }
        navigate("/verify-code", { state: { email: userData.email } });
      })
      .catch((error) => {
        console.error("Full Error Object:", error);

        const serverErrorMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data ||
          error.message;

        alert(typeof serverErrorMessage === "object" ? JSON.stringify(serverErrorMessage) : serverErrorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700/60 rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-12 min-h-150 justify-center transition-colors duration-300 relative">
        
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          type="button"
          className="absolute top-6 right-6 p-2 rounded-xl bg-slate-50 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-600 hover:text-slate-800 dark:hover:text-white transition-all outline-none z-10"
          aria-label="Toggle Theme"
        >
          {isDarkMode ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>

        <div className="hidden lg:flex lg:w-1/2 bg-slate-100 dark:bg-slate-900 rounded-2xl items-center justify-center overflow-hidden relative p-4 transition-colors">
          <img
            src="https://img.magnific.com/premium-photo/3d-doctor-medical-consultation-avatar-online-healthcare-pharmacist-expert-icon-smiling-therapist-cartoon-male-cardiologist-vector-character-stethoscope-shield-young-man-3d-doctor-portrait_1254992-276909.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Character Illustration"
            className="w-full h-full object-cover rounded-xl select-none pointer-events-none dark:opacity-80 dark:grayscale-10"
            loading="lazy"
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between py-6 px-2 sm:px-6 md:px-10">
          <div className="hidden lg:block"></div>

          <div className="w-full max-w-md mx-auto mt-8 lg:mt-0">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 tracking-wide text-slate-800 dark:text-white">
              Login
            </h1>

            <form onSubmit={login} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 pl-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all text-slate-800 dark:text-white text-sm disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-950/50 transition-all text-slate-800 dark:text-white text-sm disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400"
                  required
                />
                <div className="text-right">
                  <a
                    href="#forgot"
                    className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline transition-colors"
                  >
                    forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-lg transition-all mt-2 text-base tracking-wide flex items-center justify-center gap-2 disabled:bg-slate-400 dark:disabled:bg-slate-700 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Log in"
                )}
              </button>

              <div className="text-center text-sm text-slate-600 dark:text-slate-400 pt-1">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className={`text-blue-500 dark:text-blue-400 hover:underline font-medium ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Register
                </Link>
              </div>
            </form>
          </div>

          <div className="mt-8 flex justify-center lg:justify-end">
            <div className="inline-flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800/80 text-xs text-slate-800 dark:text-slate-300 font-bold transition-colors">
              <span>presented by</span>
              <div className="flex items-center gap-0.5">
                <span className="text-blue-500 dark:text-blue-400 font-black italic text-sm">
                  SOKLEAP
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}