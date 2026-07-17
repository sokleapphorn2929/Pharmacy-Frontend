import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function ForgetPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState("request");

  const [emailInput, setEmailInput] = useState("");
  const [targetUserId, setTargetUserId] = useState(null);

  const [resetForm, setResetForm] = useState({
    code: "",
    password: "",
    password_confirmation: "",
  });

  const [submitting, setSubmitting] = useState(false);

  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    type: "success",
  });

  const showStatus = (title, message, type = "success") => {
    setStatusModal({ isOpen: true, title, message, type });
  };

  const closeStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleRequestVerificationCode = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const checkResponse = await axios.post(
        "https://pharmacy-system-backend-j77b.onrender.com/api/users/find-id",
        {
          email: emailInput.trim(),
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      const userId = checkResponse.data?.id || checkResponse.data?.data?.id;

      if (!userId) {
        showStatus(
          "Account Error",
          "Could not parse identification strings from backend response.",
          "error",
        );
        setSubmitting(false);
        return;
      }

      setTargetUserId(userId);

      await axios.post(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/password-request/${userId}`,
        {},
        {
          headers: {
            Accept: "application/json",
          },
        },
      );

      setStep("confirm");
      showStatus(
        "Code Dispatched",
        `A 6-digit verification code has been successfully transmitted to your email entry.`,
        "success",
      );
    } catch (error) {
      console.error(
        "Account lookup or code transmission sequence failed:",
        error,
      );
      const errMsg =
        error.response?.data?.message ||
        "Account not found or failed to transmit secure code request sequence.";
      showStatus("Request Failed", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPasswordReset = async (e) => {
    e.preventDefault();

    if (resetForm.password !== resetForm.password_confirmation) {
      showStatus(
        "Password Mismatch",
        "Your confirmation string inputs must match identically.",
        "error",
      );
      return;
    }

    setSubmitting(true);

    try {
      await axios.post(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/password-confirm/${targetUserId}`,
        {
          code: resetForm.code,
          password: resetForm.password,
          password_confirmation: resetForm.password_confirmation,
        },
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        },
      );

      showStatus(
        "Password Reset Complete",
        "Your security credentials have been updated successfully. Redirecting to login...",
        "success",
      );

      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Password verification error:", error);
      const errMsg =
        error.response?.data?.message ||
        "Invalid validation token code or process timeout.";
      showStatus("Reset Failed", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center px-4 py-12 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-xl transition-all duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl text-2xl mb-3 shadow-sm select-none">
            {step === "request" ? "✉️" : "🛡️"}
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
            {step === "request" ? "Recover Password" : "Reset Verification"}
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5 px-4 leading-relaxed">
            {step === "request"
              ? "Provide your account login email registry below to receive a dynamic code directly to your Gmail."
              : "Complete the transactional layout parameters by updating your secret credentials."}
          </p>
        </div>

        {step === "request" && (
          <form onSubmit={handleRequestVerificationCode} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Account Email Address
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                placeholder="name@gmail.com"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              {submitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Send Verification Code"
              )}
            </button>
          </form>
        )}

        {step === "confirm" && (
          <form onSubmit={handleConfirmPasswordReset} className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Verification Token Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={resetForm.code}
                onChange={(e) =>
                  setResetForm({ ...resetForm, code: e.target.value })
                }
                className="w-full px-4 py-3 text-sm text-center font-mono font-black tracking-widest text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                placeholder="939394"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                New Secure Password
              </label>
              <input
                type="password"
                required
                value={resetForm.password}
                onChange={(e) =>
                  setResetForm({ ...resetForm, password: e.target.value })
                }
                className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={resetForm.password_confirmation}
                onChange={(e) =>
                  setResetForm({
                    ...resetForm,
                    password_confirmation: e.target.value,
                  })
                }
                className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                placeholder="••••••••"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  "Update Identity Credentials"
                )}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-700/30 text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-slate-400 dark:text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
          >
            &larr; Remember credentials? Return to Login
          </Link>
        </div>
      </div>

      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-2xl mb-4">
              {statusModal.type === "success" && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-2xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
              )}
              {statusModal.type === "error" && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-2xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
              {statusModal.type === "info" && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                </div>
              )}
            </div>

            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {statusModal.title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
              {statusModal.message}
            </p>

            <button
              onClick={closeStatusModal}
              className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
