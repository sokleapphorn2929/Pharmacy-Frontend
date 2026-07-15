import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [profilePreview, setProfilePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState({
    username: "",
    email: "",
    phone: "",
    address: "",
    password: "",
    profile_pic: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePreview(URL.createObjectURL(file));
      setUserData((prev) => ({
        ...prev,
        profile_pic: file,
      }));
    }
  };

  function register(e) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData();
    formData.append("username", userData.username);
    formData.append("email", userData.email);
    formData.append("phone", userData.phone);
    formData.append("address", userData.address);
    formData.append("password", userData.password);

    if (userData.profile_pic) {
      formData.append("profile_pic", userData.profile_pic);
    }

    axios
      .post(
        "https://pharmacy-system-backend-j77b.onrender.com/api/users",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      )
      .then((rsp) => {
        alert("Register Successful");
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
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-10 font-sans">
      <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden max-w-5xl w-full flex flex-col lg:flex-row p-4 lg:p-6 gap-6 lg:gap-12 min-h-150 justify-center">
        <div className="hidden lg:flex lg:w-1/2 bg-gray-200 rounded-2xl items-center justify-center overflow-hidden relative p-4">
          <img
            src="https://img.magnific.com/premium-photo/3d-doctor-medical-consultation-avatar-online-healthcare-pharmacist-expert-icon-smiling-therapist-cartoon-male-cardiologist-vector-character-stethoscope-shield-young-man-3d-doctor-portrait_1254992-276909.jpg?semt=ais_hybrid&w=740&q=80"
            alt="Character Illustration"
            className="w-full h-full object-cover rounded-xl"
          />
        </div>

        <div className="w-full lg:w-1/2 flex flex-col justify-between py-6 px-2 sm:px-6 md:px-10">
          <div className="hidden lg:block"></div>

          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-6 tracking-wide">
              Register
            </h1>

            <form onSubmit={register} className="space-y-4">
              <div className="flex flex-col items-center justify-center gap-2 mb-2">
                <label className="text-sm font-semibold text-gray-700">
                  Profile Picture
                </label>
                <div className="relative group w-20 h-20 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden hover:border-gray-400 transition-colors bg-gray-50 cursor-pointer">
                  {profilePreview ? (
                    <img
                      src={profilePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <svg
                      className="w-6 h-6 text-gray-400 group-hover:text-gray-600 transition-colors"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isLoading}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 pl-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    placeholder="johndoe"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>

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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-gray-700 pl-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    placeholder="+1 (555) 000-0000"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
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
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label className="text-sm font-semibold text-gray-700 pl-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main St, New York, NY"
                    disabled={isLoading}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm disabled:bg-gray-50 disabled:text-gray-400"
                    required
                  />
                </div>
              </div>

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
                    <span>Registering...</span>
                  </>
                ) : (
                  "Register"
                )}
              </button>

              <div className="text-center text-sm text-gray-600 pt-1">
                Already have an account?{" "}
                <Link
                  to="/"
                  className={`text-blue-500 hover:underline ${
                    isLoading ? "pointer-events-none opacity-50" : ""
                  }`}
                >
                  Login
                </Link>
              </div>
            </form>
          </div>

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
