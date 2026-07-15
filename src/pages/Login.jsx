import React from "react";
import { Link } from "react-router-dom";

export default function LoginPage() {
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

        <div className="w-full lg:w-1/2 flex flex-col justify-between py-6 px-2 sm:px-6 md:px-10 ">
          <div className="hidden lg:block"></div>

          <div className="w-full max-w-md mx-auto">
            <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 tracking-wide">
              Login
            </h1>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 pl-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700 pl-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 outline-none focus:border-gray-300 focus:ring-2 focus:ring-gray-100 transition-all text-gray-700 text-sm"
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

              <button
                type="submit"
                className="w-full bg-gray-500 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors mt-2 text-base tracking-wide"
              >
                Log in
              </button>
              <div className="text-center">
                Don't have an account? {" "}
                <Link to="register" className="text-blue-500 hover:underline">
                  Register
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
