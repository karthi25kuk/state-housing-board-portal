import { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateOfficer() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    district: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // HANDLE INPUT
  // ==================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==================================================
  // SUBMIT
  // ==================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // -----------------------------------------------
    // FRONTEND VALIDATION
    // -----------------------------------------------

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.district
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/admin/officers",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create officer."
        );
      }

      // ==================================================
      // SUCCESS → REDIRECT TO ADMIN DASHBOARD
      // ==================================================

      navigate("/admin");

    } catch (error) {
      console.error(
        "Create officer error:",
        error
      );

      setError(
        error.message ||
          "Unable to create officer."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // UI
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}

      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">

          <h1 className="text-xl font-bold text-blue-600">
            State Housing Board
          </h1>

          <p className="text-xs text-gray-500">
            Administration Portal
          </p>

        </div>
      </header>

      {/* MAIN */}

      <main className="max-w-4xl mx-auto px-6 py-8">

        {/* PAGE HEADER */}

        <div className="mb-8">

          {/* BACK BUTTON */}

          <button
            type="button"
            onClick={() => navigate("/admin")}
            className="mb-4 inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </button>

          <h2 className="text-2xl font-bold text-gray-800">
            Create Officer
          </h2>

          <p className="text-gray-500 mt-1">
            Create an officer account and assign
            the officer to a district.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
        >

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* NAME */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Officer Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter officer name"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter officer email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PHONE */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>

              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* DISTRICT */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>

              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                placeholder="Enter assigned district"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm password"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

          </div>

          {/* BUTTONS */}

          <div className="flex justify-end gap-3 mt-8">

            {/* BACK */}

            <button
              type="button"
              onClick={() => navigate("/admin")}
              className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>

            {/* CREATE */}

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading
                ? "Creating Officer..."
                : "Create Officer"}
            </button>

          </div>

        </form>
      </main>
    </div>
  );
}

export default CreateOfficer;