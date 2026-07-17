import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../Api/api";

export default function Profile() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const isLoggedIn = !!localStorage.getItem("authToken");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    avatar: "",
    joined_date: "",
  });

  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    address: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [deleteVerificationCode, setDeleteVerificationCode] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);

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
    setDeleteVerificationCode("");
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }

    async function fetchProfileData() {
      try {
        const token = localStorage.getItem("authToken");

        const response = await API.get(
          "https://pharmacy-system-backend-j77b.onrender.com/api/users",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const responseData = response.data?.data;
        const userData = Array.isArray(responseData)
          ? responseData[0]
          : responseData;

        if (!userData) {
          showStatus("Error", "No user profile data found.", "error");
          return;
        }

        setUserId(userData.id || userData._id);

        const mappedData = {
          name: userData.username || "Guest User",
          email: userData.email || "",
          phone: userData.phone || "Not specified",
          address: userData.address || "Not specified",
          avatar: userData.profile_pic || "",
          joined_date: userData.created_at
            ? new Date(userData.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })
            : "Active Member",
        };

        setProfile(mappedData);
        setEditForm({
          name: mappedData.name,
          phone: mappedData.phone === "Not specified" ? "" : mappedData.phone,
          address:
            mappedData.address === "Not specified" ? "" : mappedData.address,
        });
      } catch (error) {
        console.error("Error fetching profile details:", error);
        showStatus(
          "Error",
          "Could not load user profile details. Please try again.",
          "error",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [isLoggedIn]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showStatus(
        "Invalid File",
        "Please select a valid image file format (PNG, JPG).",
        "error",
      );
      return;
    }

    const formData = new FormData();
    formData.append("profile_pic", file);
    formData.append("_method", "PUT");

    setUploadingPic(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await API.post(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/${userId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const updatedData = response.data?.data || response.data || {};

      setProfile((prev) => ({
        ...prev,
        avatar: updatedData.profile_pic || prev.avatar,
      }));

      showStatus(
        "Avatar Updated",
        "Your profile picture has been successfully uploaded.",
        "success",
      );
    } catch (error) {
      console.error("Image upload failed:", error);
      const errMsg =
        error.response?.data?.message ||
        "Could not process image update framework.";
      showStatus("Upload Failed", errMsg, "error");
    } finally {
      setUploadingPic(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!userId) {
      showStatus("Update Error", "User identifier parameter missing.", "error");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");

      const response = await API.put(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/${userId}`,
        {
          username: editForm.name,
          phone: editForm.phone,
          address: editForm.address,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      const updatedData = response.data?.data || response.data || {};

      setProfile((prev) => ({
        ...prev,
        name: updatedData.username || editForm.name,
        phone: updatedData.phone || editForm.phone || "Not specified",
        address: updatedData.address || editForm.address || "Not specified",
      }));

      setIsEditing(false);
      showStatus(
        "Profile Updated",
        "Your personal dashboard information has been successfully saved.",
        "success",
      );
    } catch (error) {
      console.error("Failed to update profile:", error);
      const errMsg =
        error.response?.data?.message ||
        "Could not update your profile dashboard info.";
      showStatus("Update Failed", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!userId) return;

    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      showStatus(
        "Password Mismatch",
        "Your new password confirmation values do not match.",
        "error",
      );
      return;
    }

    setUpdatingPassword(true);
    try {
      const token = localStorage.getItem("authToken");
      await API.put(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/password-with-oldpw/${userId}`,
        {
          old_password: passwordForm.old_password,
          password: passwordForm.new_password,
          password_confirmation: passwordForm.new_password_confirmation,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        },
      );

      setPasswordForm({
        old_password: "",
        new_password: "",
        new_password_confirmation: "",
      });
      setIsPasswordModalOpen(false);
      showStatus(
        "Security Updated",
        "Your account security credentials have been changed successfully.",
        "success",
      );
    } catch (error) {
      console.error("Failed to update password:", error);
      const errMsg =
        error.response?.data?.message ||
        "Invalid current password credential supplied.";
      showStatus("Security Error", errMsg, "error");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const handleInitiateDeletion = async () => {
    if (!userId) return;
    setSubmitting(true);

    try {
      const token = localStorage.getItem("authToken");
      await API.post(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/delete-request/${userId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      showStatus(
        "Security Token Sent",
        `We have dispatched a 6-digit confirmation key to ${profile.email}. Please input it to confirm profile removal.`,
        "confirmDelete",
      );
    } catch (error) {
      console.error("Failed to request removal verification string:", error);
      const errMsg =
        error.response?.data?.message ||
        "Could not dispatch verification parameters.";
      showStatus("Request Failed", errMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const executeAccountTermination = async () => {
    if (!userId) return;
    if (!deleteVerificationCode.trim()) {
      showStatus(
        "Missing Code",
        "Please input the 6-digit confirmation token code sent to your email.",
        "confirmDelete",
      );
      return;
    }

    closeStatusModal();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      await API.delete(
        `https://pharmacy-system-backend-j77b.onrender.com/api/users/confirm-delete/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          data: {
            code: deleteVerificationCode.trim(),
          },
        },
      );

      localStorage.removeItem("authToken");
      window.dispatchEvent(new Event("cart-updated"));

      setTimeout(() => {
        navigate("/");
      }, 500);
    } catch (error) {
      console.error("Account destruction process collapsed:", error);
      const errMsg =
        error.response?.data?.message ||
        "Invalid verification code or platform teardown timeout error.";
      setLoading(false);
      showStatus("Termination Failed", errMsg, "error");
    }
  };


  const handleLogout = () => {
    localStorage.removeItem("authToken");
    window.dispatchEvent(new Event("cart-updated"));
    showStatus(
      "Logged Out",
      "You have successfully signed out of your account.",
      "info",
    );
    setTimeout(() => {
      navigate("/");
    }, 1500);
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center px-4 transition-colors duration-300">
        <div className="text-5xl mb-4">🔒</div>
        <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-wider">
          Access Restrict
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-2 text-center max-w-xs leading-relaxed">
          Please log in to your registered customer account to manage your
          profile dashboard.
        </p>
        <Link
          to="/login"
          className="mt-6 inline-flex items-center justify-center px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm rounded-2xl shadow-md transition-all duration-150"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Loading user profile index...
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white transition-colors duration-300 py-12 pt-20 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="border-b border-slate-200 dark:border-slate-800/80 pb-5">
          <h2 className="font-extrabold text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight">
            My Account
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal contact details, location delivery routes, and
            application sessions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 shadow-sm flex flex-col items-center text-center relative overflow-hidden transition-all duration-300">
            <div className="absolute top-0 inset-x-0 h-24 bg-linear-to-r from-blue-500/10 to-indigo-500/10 dark:from-blue-950/20 dark:to-indigo-950/20" />

            <div
              onClick={() => !uploadingPic && fileInputRef.current.click()}
              className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 bg-slate-100 dark:bg-slate-900 overflow-hidden relative z-10 shadow-sm mt-4 group cursor-pointer"
              title="Change avatar image file"
            >
              {uploadingPic ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150 text-white text-xs font-semibold">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
                    />
                  </svg>
                </div>
              )}

              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full object-cover select-none"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 uppercase select-none">
                  {profile.name.charAt(0)}
                </div>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleAvatarChange}
              accept="image/*"
              className="hidden"
            />

            <h3 className="font-black text-xl text-slate-850 dark:text-white mt-4 uppercase tracking-tight">
              {profile.name}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mt-0.5">
              {profile.email}
            </p>

            <span className="mt-4 px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-extrabold text-[10px] tracking-wider uppercase rounded-full">
              Verified Client
            </span>

            <div className="w-full border-t border-slate-50 dark:border-slate-700/40 my-6 pt-5 space-y-4 text-xs text-left">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  Joined Platform
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {profile.joined_date}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500 font-medium">
                  Active Status
                </span>
                <span className="font-bold text-emerald-500 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />{" "}
                  Online
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-3 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                />
              </svg>
              Sign Out
            </button>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/30">
                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                  Personal Dashboard
                </h3>
                <div className="flex items-center gap-2">
                  {!isEditing && (
                    <>
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-sm"
                      >
                        Edit Profile
                      </button>
                    </>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                        Full Name
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                        {profile.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                        Email Address
                      </span>
                      <span className="text-sm font-bold text-slate-850 dark:text-slate-200 mt-1 block">
                        {profile.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                        Contact Number
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                        {profile.phone}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block">
                        Saved Delivery Address
                      </span>
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block leading-relaxed">
                        {profile.address}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={editForm.phone}
                        onChange={(e) =>
                          setEditForm({ ...editForm, phone: e.target.value })
                        }
                        className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                        Saved Delivery Address
                      </label>
                      <textarea
                        rows="3"
                        value={editForm.address}
                        onChange={(e) =>
                          setEditForm({ ...editForm, address: e.target.value })
                        }
                        className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/30">
                    <button
                      type="button"
                      onClick={() => {
                        setEditForm({
                          name: profile.name,
                          phone:
                            profile.phone === "Not specified"
                              ? ""
                              : profile.phone,
                          address:
                            profile.address === "Not specified"
                              ? ""
                              : profile.address,
                        });
                        setIsEditing(false);
                      }}
                      className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
                    >
                      {submitting ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="bg-red-50/40 dark:bg-rose-950/10 border border-red-100 dark:border-rose-900/30 rounded-3xl p-6 md:p-8 shadow-sm transition-all duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                    Danger Zone
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Permanently delete your profile workspace, active medical
                    tracking files, and server database records. This process
                    requires email confirmation.
                  </p>
                </div>
                <div>
                  <button
                    onClick={() =>
                      showStatus(
                        "Terminate Profile?",
                        "Deactivating your account requires authorization. Press below to generate a secure cancellation pin directly to your Gmail.",
                        "requestDelete",
                      )
                    }
                    className="w-full md:w-auto px-5 py-3 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all whitespace-nowrap"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 w-full max-w-md rounded-3xl p-6 shadow-2xl">
            <div className="text-center mb-6 pb-4 border-b border-slate-50 dark:border-slate-700/30 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-wider">
                Modify Security Credentials
              </h3>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.old_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      old_password: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                  New Secure Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.new_password}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password: e.target.value,
                    })
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
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      new_password_confirmation: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 text-sm text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-blue-500 dark:focus:border-blue-400 outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-50 dark:border-slate-700/30">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 uppercase tracking-wider"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updatingPassword}
                  className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  {updatingPassword && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
              {(statusModal.type === "requestDelete" ||
                statusModal.type === "confirmDelete") && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-500 rounded-2xl">
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
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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

            {statusModal.type === "requestDelete" && (
              <div className="mt-6 flex gap-3">
                <button
                  onClick={closeStatusModal}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInitiateDeletion}
                  className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-1"
                >
                  {submitting && (
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  )}
                  Send Email Code
                </button>
              </div>
            )}

            {statusModal.type === "confirmDelete" && (
              <div className="mt-4 space-y-4 text-left">
                <div>
                  <label className="text-[9px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider block mb-1">
                    Enter Verification Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={deleteVerificationCode}
                    onChange={(e) => setDeleteVerificationCode(e.target.value)}
                    className="w-full px-4 py-2 text-center text-sm font-mono font-bold text-slate-800 dark:text-white bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                    placeholder="939394"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={closeStatusModal}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeAccountTermination}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
                  >
                    Confirm Drop
                  </button>
                </div>
              </div>
            )}

            {statusModal.type !== "requestDelete" &&
              statusModal.type !== "confirmDelete" && (
                <button
                  onClick={closeStatusModal}
                  className="mt-6 w-full py-2.5 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  Dismiss
                </button>
              )}
          </div>
        </div>
      )}
    </div>
  );
}
