import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [code, setCode] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (code[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    const pasteData = e.clipboardData.getData("text").trim();
    if (pasteData.length === 6 && /^\d+$/.test(pasteData)) {
      const pasteArray = pasteData.split("");
      setCode(pasteArray);
      inputRefs.current[5].focus();
    }
    e.preventDefault();
  };

  function handleVerify(e) {
    e.preventDefault();
    setIsLoading(true);

    const fullCode = code.join("");

    axios
      .post(
        "https://pharmacy-system-backend-j77b.onrender.com/api/users/verify-otp",
        {
          email: location.state?.email,
          code: fullCode,
        },
      )
      .then((rsp) => {
        // 1. Log the full response to check where your backend puts the token
        console.log("Full Verification API Response:", rsp.data);

        // 2. Comprehensive check covering common Laravel/API formats
        const finalToken =
          rsp.data.token ||
          rsp.data.data?.token ||
          rsp.data.access_token ||
          rsp.data.data; // fallback if data is the token string itself

        if (finalToken && typeof finalToken === "string") {
          localStorage.setItem("authToken", finalToken);
          alert("Verification Successful!");
          navigate("/home");
        } else {
          // If a token wasn't found in expected paths, throw an error to catch it below
          throw new Error(
            "Verification succeeded, but no token was returned by the server.",
          );
        }
      })
      .catch((err) => {
        console.error("Verification error details:", err);
        const serverErrorMessage =
          err.response?.data?.message ||
          err.message ||
          "Invalid verification code. Please try again.";
        alert(serverErrorMessage);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-4xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] border border-gray-100 max-w-lg w-full p-10 md:p-12 text-center">
        <h1 className="text-3xl font-extrabold text-[#0f172a] mb-2 tracking-wide">
          Verification Code
        </h1>

        <p className="text-sm text-slate-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          We sent a 6-digit code to your device.
          {email && (
            <span className="block text-slate-500 font-semibold mt-1">
              {email}
            </span>
          )}
        </p>

        <form onSubmit={handleVerify} className="space-y-10">
          <div
            className="flex justify-center gap-3 md:gap-4"
            onPaste={handlePaste}
          >
            {code.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                ref={(el) => (inputRefs.current[index] = el)}
                value={data}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isLoading}
                className="w-12 h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-slate-800 bg-[#f8fafc] border-2 border-[#e2e8f0] rounded-2xl outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all duration-150 disabled:opacity-60"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.some((digit) => digit === "")}
            className="w-full bg-[#0f172a] hover:bg-[#1e293b] text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all text-base tracking-wide flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
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
                <span>Verifying...</span>
              </>
            ) : (
              "Verify Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-sm">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-slate-400 hover:text-slate-600 transition-colors mr-6"
          >
            ← Back
          </button>
          <button
            type="button"
            onClick={() => alert("Code resent!")}
            className="text-blue-500 hover:text-blue-600 font-semibold hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
