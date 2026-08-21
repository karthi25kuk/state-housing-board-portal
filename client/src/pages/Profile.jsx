import { useState } from "react";
import { FaUserCircle, FaEdit, FaSave } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

function Profile() {
  const { user } = useAuth();

  const [editing, setEditing] = useState(false);

  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const role = user?.role || "USER";

  const handleSave = () => {
    // We will connect this to the backend later.
    setEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* Header */}

        <div className="mb-6">

          <h1 className="text-2xl font-bold text-gray-800">
            My Profile
          </h1>

          <p className="text-gray-500 mt-1">
            View and manage your account information.
          </p>

        </div>


        {/* Profile Card */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

          {/* Top Section */}

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


          {/* Details */}

          <div className="p-6">

            <div className="flex items-center justify-between mb-5">

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
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
                >
                  <FaEdit />
                  Edit
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSave}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                >
                  <FaSave />
                  Save
                </button>
              )}

            </div>


            {/* Name */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={!editing}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Email */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={!editing}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Phone */}

            <div className="mb-5">

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={!editing}
                placeholder="Not provided"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none disabled:bg-gray-50 disabled:text-gray-600 focus:ring-2 focus:ring-blue-500"
              />

            </div>


            {/* Role */}

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


        {/* Account Information */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h3 className="text-lg font-semibold text-gray-800">
            Account Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">

            <div>

              <p className="text-xs text-gray-500">
                User ID
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {user?._id || user?.id || "-"}
              </p>

            </div>


            <div>

              <p className="text-xs text-gray-500">
                Account Role
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {role}
              </p>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Profile;