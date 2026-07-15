import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    email: "",
    password: "",
  });

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

        console.log("Token received at login step:", token); // 👈 Add this temporary debugger

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
          JSON.stringify(error.response?.data) ||
          error.message;

        alert(serverErrorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans bg-gray-50">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-12 min-h-150 justify-center">
        {/* Banner Graphic Sidepanel */}
        <div className="hidden lg:flex lg:w-1/2 bg-gray-200 rounded-2xl items-center justify-center overflow-hidden relative p-4">
          <img
            src="https://img.magnific.com/premium-photo/3d-doctor-medical-consultation-avatar-online-healthcare-pharmacist-expert-icon-smiling-therapist-cartoon-male-cardiologist-vector-character-stethoscope-shield-young-man-3d-doctor-portrait_1254992-276909.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Character Illustration"
            className="w-full h-full object-cover rounded-xl select-none pointer-events-none"
          />
        </div>

        {/* Dynamic Form Control Track */}
        <div className="w-full lg:w-1/2 flex flex-col justify-between py-6 px-2 sm:px-6 md:px-10">
          <div className="hidden lg:block"></div>

          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 tracking-wide text-gray-800">
              Login
            </h1>

            <form onSubmit={login} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 pl-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={userData.email}
                  onChange={handleInputChange}
                  placeholder="name@example.com"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={userData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  disabled={isLoading}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-400 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                  required
                />
                <div className="text-right">
                  <a
                    href="#forgot"
                    className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
                  >
                    forgot password?
                  </a>
                </div>
              </div>

              {/* Action Submit Button matching Register's styling & loading spinner */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors mt-2 text-base tracking-wide flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <span>Logging in...</span>
                  </>
                ) : (
                  "Log in"
                )}
              </button>

              <div className="text-center text-sm text-gray-600 pt-1">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className={`text-blue-500 hover:underline font-medium ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Register
                </Link>
              </div>
            </form>
          </div>

          {/* Footer branding identity panel */}
          <div className="mt-8 flex justify-center lg:justify-end">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100 text-xs text-gray-800 font-bold">
              <span>presented by</span>
              <div className="flex items-center gap-0.5">
                <span className="text-[#3b82f6] font-black italic text-sm">
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
