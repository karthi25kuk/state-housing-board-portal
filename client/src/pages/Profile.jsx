import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaEdit,
  FaSave,
  FaTimes,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user, updateUser } = useAuth();

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [district, setDistrict] = useState(user?.district || "");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const role = user?.role || "USER";

  // ==========================================
  // SYNC USER DATA
  // ==========================================

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setDistrict(user?.district || "");
  }, [user]);

  // ==========================================
  // BACK DASHBOARD
  // ==========================================

  const dashboardPath =
    role === "APPLICANT"
      ? "/applicant"
      : role === "OFFICER"
        ? "/officer"
        : "/admin";

  // ==========================================
  // VALIDATE
  // ==========================================

  const validateForm = () => {
    if (!name.trim()) {
      return "Full name is required.";
    }

    if (!email.trim()) {
      return "Email address is required.";
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (phone.trim()) {
      const phonePattern = /^[6-9]\d{9}$/;

      if (!phonePattern.test(phone.trim())) {
        return "Please enter a valid 10-digit Indian mobile number.";
      }
    }

    if (role === "OFFICER" && !district.trim()) {
      return "District is required for an officer.";
    }

    return "";
  };

  // ==========================================
  // SAVE
  // ==========================================

  const handleSave = () => {
    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    updateUser({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      district: district.trim(),
    });

    setEditing(false);
    setSuccess(
      "Profile information updated for this session."
    );
  };

  // ==========================================
  // CANCEL
  // ==========================================

  const handleCancel = () => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
    setDistrict(user?.district || "");

    setError("");
    setSuccess("");
    setEditing(false);
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* BACK */}

        <Link
          to={dashboardPath}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Dashboard
        </Link>

        {/* HEADER */}

        <div className="mt-5 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage your account information.
          </p>
        </div>

        {/* SUCCESS */}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        {/* ERROR */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* PROFILE */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {/* PROFILE HEADER */}

          <div className="bg-blue-50 border-b border-gray-100 p-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
              <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                <FaUserCircle className="text-6xl" />
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {user?.name || "User"}
                </h2>

                <p className="text-gray-500 mt-1">
                  {user?.email || "-"}
                </p>

                <span className="inline-block mt-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {role}
                </span>
              </div>
            </div>
          </div>

          {/* PERSONAL INFORMATION */}

          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Personal Information
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Your registered account details.
                </p>
              </div>

              {!editing ? (
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setSuccess("");
                    setEditing(true);
                  }}
                  className="flex items-center justify-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50"
                >
                  <FaEdit />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <FaTimes />
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSave}
                    className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    <FaSave />
                    Save
                  </button>
                </div>
              )}
            </div>

            {/* NAME */}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                disabled={!editing}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* EMAIL */}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                disabled={!editing}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* PHONE */}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(event) =>
                  setPhone(event.target.value.replace(/\D/g, ""))
                }
                disabled={!editing}
                maxLength={10}
                placeholder="Not provided"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />
            </div>

            {/* DISTRICT */}

            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>

              <input
                type="text"
                value={district}
                onChange={(event) =>
                  setDistrict(event.target.value)
                }
                disabled={!editing}
                placeholder="Not provided"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-600"
              />

              {role === "APPLICANT" && (
                <p className="text-xs text-gray-500 mt-2">
                  Your district is used to determine the housing
                  schemes and district waiting lists available
                  to you.
                </p>
              )}
            </div>

            {/* ROLE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Role
              </label>

              <input
                type="text"
                value={role}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-600"
              />
            </div>
          </div>
        </div>

        {/* ACCOUNT INFORMATION */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            {/* USER ID */}

            <div>
              <p className="text-xs text-gray-500">
                User ID
              </p>

              <p className="font-medium text-gray-800 mt-1 break-all">
                {user?._id || user?.id || "-"}
              </p>
            </div>

            {/* ROLE */}

            <div>
              <p className="text-xs text-gray-500">
                Account Role
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {role}
              </p>
            </div>

            {/* HOUSING STATUS */}

            <div>
              <p className="text-xs text-gray-500">
                Housing Status
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user?.housingStatus || "-"}
              </p>
            </div>

            {/* DISTRICT */}

            <div>
              <p className="text-xs text-gray-500">
                District
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user?.district || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* NOTE */}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            Profile changes are currently stored in your
            authenticated session. Permanent profile updates
            require a backend profile-update endpoint.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Profile;