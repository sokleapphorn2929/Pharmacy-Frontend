import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [code, setCode] = useState(new Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return (
      localStorage.getItem("theme") === "dark" ||
      (!localStorage.getItem("theme") &&
        window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
  });

  useEffect(() => {
    const handleThemeEvent = () => {
      const currentTheme = localStorage.getItem("theme") === "dark";
      setIsDarkMode(currentTheme);
    };

    window.addEventListener("theme-changed", handleThemeEvent);
    window.addEventListener("storage", handleThemeEvent);

    return () => {
      window.removeEventListener("theme-changed", handleThemeEvent);
      window.removeEventListener("storage", handleThemeEvent);
    };
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

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
        console.log("Full Verification API Response:", rsp.data);

        const finalToken =
          rsp.data.token ||
          rsp.data.data?.token ||
          rsp.data.access_token ||
          rsp.data.data;

        if (finalToken && typeof finalToken === "string") {
          localStorage.setItem("authToken", finalToken);
          // alert("Verification Successful!");
          navigate("/kh/home");
        } else {
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
    <div className="min-h-screen flex items-center justify-center p-4 font-sans bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <div className="bg-white dark:bg-slate-800 rounded-4xl shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] border border-gray-100 dark:border-slate-700/50 max-w-lg w-full p-10 md:p-12 text-center transition-colors duration-300">
        <h1 className="text-3xl font-extrabold text-[#0f172a] dark:text-white mb-2 tracking-wide">
          Verification Code
        </h1>

        <p className="text-sm text-slate-400 dark:text-slate-400 font-medium mb-10 max-w-sm mx-auto leading-relaxed">
          We sent a 6-digit code to your device.
          {email && (
            <span className="block text-slate-500 dark:text-slate-300 font-semibold mt-1">
              {email}
            </span>
          )}
        </p>

        <form onSubmit={handleVerify} className="space-y-10">
          <div
            className="flex justify-center gap-2 sm:gap-3 md:gap-4"
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
                className="w-10 h-12 sm:w-12 sm:h-14 md:w-14 md:h-16 text-center text-2xl font-bold text-slate-800 dark:text-white bg-[#f8fafc] dark:bg-slate-700 border-2 border-[#e2e8f0] dark:border-slate-600 rounded-2xl outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-blue-100/50 dark:focus:ring-blue-950/50 transition-all duration-150 disabled:opacity-60"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.some((digit) => digit === "")}
            className="w-full bg-[#0f172a] dark:bg-blue-600 hover:bg-[#1e293b] dark:hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all text-base tracking-wide flex items-center justify-center gap-2 disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              "Verify Account"
            )}
          </button>
        </form>

        <div className="mt-8 text-sm flex justify-center items-center gap-6">
          <Link
            to="/"
            onClick={() => navigate(-1)}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            &larr; Back
          </Link>
          <button
            type="button"
            onClick={() => alert("Code resent!")}
            className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 font-semibold hover:underline"
          >
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
}
