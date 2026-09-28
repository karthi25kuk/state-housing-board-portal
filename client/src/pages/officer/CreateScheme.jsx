import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function CreateScheme() {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState("");

  const [formData, setFormData] = useState({
    location: "",
    totalUnits: "",
    allotmentDate: "",
  });

  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =========================================================
  // FETCH EXISTING COMMON SCHEMES
  // =========================================================

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoadingSchemes(true);
        setError("");

        const authToken = token || localStorage.getItem("token");

        if (!authToken) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/admin/schemes",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to fetch housing schemes."
          );
        }

        setSchemes(data.schemes || []);
      } catch (error) {
        console.error("Fetch schemes error:", error);

        setError(
          error.message ||
            "Unable to load housing schemes. Please try again."
        );
      } finally {
        setLoadingSchemes(false);
      }
    };

    fetchSchemes();
  }, [token]);

  // =========================================================
  // HANDLE INPUT
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // HANDLE SCHEME SELECTION
  // =========================================================

  const handleSchemeChange = (e) => {
    const schemeId = e.target.value;

    setSelectedSchemeId(schemeId);
    setError("");
    setSuccess("");

    const selectedScheme = schemes.find(
      (scheme) => scheme._id === schemeId
    );

    if (!selectedScheme) {
      setFormData({
        location: "",
        totalUnits: "",
        allotmentDate: "",
      });

      return;
    }

    setFormData({
      location: "",
      totalUnits: "",
      allotmentDate: "",
    });
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedSchemeId) {
      setError("Please select a housing scheme.");
      return;
    }

    if (!formData.location.trim()) {
      setError("Please enter the housing location.");
      return;
    }

    if (
      !formData.totalUnits ||
      Number(formData.totalUnits) < 1
    ) {
      setError("Total units must be at least 1.");
      return;
    }

    if (!formData.allotmentDate) {
      setError("Please select an allotment date.");
      return;
    }

    try {
      setLoading(true);

      const authToken = token || localStorage.getItem("token");

      if (!authToken) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const requestBody = {
        location: formData.location.trim(),

        totalUnits: Number(formData.totalUnits),

        allotmentDate: formData.allotmentDate,
      };

      const response = await fetch(
        `http://localhost:5000/api/schemes/officer/${selectedSchemeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to save district housing configuration."
        );
        return;
      }

      setSuccess(
        "Housing scheme configuration created successfully."
      );

      setTimeout(() => {
        navigate("/officer/schemes");
      }, 1200);
    } catch (error) {
      console.error(
        "Save district configuration error:",
        error
      );

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SELECTED SCHEME
  // =========================================================

  const selectedScheme = schemes.find(
    (scheme) => scheme._id === selectedSchemeId
  );

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link
          to="/officer"
          className="text-blue-600 hover:text-blue-800 font-medium inline-block mb-6"
        >
          &larr; Back to Dashboard
        </Link>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Configure Housing Scheme
            </h1>

            <p className="text-gray-500 mt-2">
              Configure an existing housing scheme for your
              district.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* ================================================= */}
            {/* DISTRICT */}
            {/* ================================================= */}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">
                  District:
                </span>{" "}
                {user?.district || "Your registered district"}
              </p>

              <p className="text-xs text-blue-700 mt-1">
                This configuration will automatically belong to
                your registered district.
              </p>
            </div>

            {/* ================================================= */}
            {/* SCHEME SELECTION */}
            {/* ================================================= */}

            <div>
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Select Housing Scheme
              </h2>

              {loadingSchemes ? (
                <div className="border border-gray-200 rounded-lg p-4 text-gray-500">
                  Loading housing schemes...
                </div>
              ) : schemes.length === 0 ? (
                <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-4 text-yellow-800">
                  No housing schemes are currently available.
                  Please ask the administrator to create a
                  scheme first.
                </div>
              ) : (
                <select
                  value={selectedSchemeId}
                  onChange={handleSchemeChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">
                    Select a housing scheme
                  </option>

                  {schemes.map((scheme) => (
                    <option
                      key={scheme._id}
                      value={scheme._id}
                    >
                      {scheme.schemeName}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* ================================================= */}
            {/* COMMON SCHEME INFORMATION */}
            {/* ================================================= */}

            {selectedScheme && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">

                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  Scheme Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Scheme Name
                    </p>

                    <p className="font-medium text-gray-800">
                      {selectedScheme.schemeName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      House Model
                    </p>

                    <p className="font-medium text-gray-800">
                      {selectedScheme.houseModel || "N/A"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      House Price
                    </p>

                    <p className="font-medium text-gray-800">
                      ₹
                      {Number(
                        selectedScheme.price || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Maximum Annual Income
                    </p>

                    <p className="font-medium text-gray-800">
                      ₹
                      {Number(
                        selectedScheme.maximumAnnualIncome || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">
                      Eligible Income Categories
                    </p>

                    <p className="font-medium text-gray-800">
                      {(
                        selectedScheme
                          .eligibleIncomeCategories || []
                      ).join(", ") || "N/A"}
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* DISTRICT CONFIGURATION */}
            {/* ================================================= */}

            {selectedScheme && (
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  District Configuration
                </h2>

                <div className="space-y-5">

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Housing Location
                    </label>

                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter housing project location"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  {/* Total Units */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Housing Units
                    </label>

                    <input
                      type="number"
                      name="totalUnits"
                      value={formData.totalUnits}
                      onChange={handleChange}
                      placeholder="Enter number of housing units"
                      min="1"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      Number of houses available in your
                      district for this scheme.
                    </p>
                  </div>

                  {/* Allotment Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allotment Date
                    </label>

                    <input
                      type="date"
                      name="allotmentDate"
                      value={formData.allotmentDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />

                    <p className="text-xs text-gray-500 mt-1">
                      Allotment processing for this district
                      will be based on this date.
                    </p>
                  </div>

                </div>
              </div>
            )}

            {/* ================================================= */}
            {/* WORKFLOW INFORMATION */}
            {/* ================================================= */}

            {selectedScheme && (
              <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">
                  Officer Workflow
                </h3>

                <ul className="text-sm text-green-700 space-y-1">
                  <li>
                    • Configure the housing location and
                    available units.
                  </li>

                  <li>
                    • Verify applications from your district.
                  </li>

                  <li>
                    • Generate and manage the district waiting
                    list.
                  </li>

                  <li>
                    • Process housing allotments according to
                    the district ranking.
                  </li>
                </ul>
              </div>
            )}

            {/* ================================================= */}
            {/* BUTTONS */}
            {/* ================================================= */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate("/officer")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  loading ||
                  loadingSchemes ||
                  !selectedSchemeId
                }
                className={`w-full sm:w-auto px-6 py-3 text-white rounded-lg font-medium ${
                  loading ||
                  loadingSchemes ||
                  !selectedSchemeId
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Saving Configuration..."
                  : "Save Configuration"}
              </button>

            </div>

          </form>
        </div>
      </div>
    </section>
  );
}

export default CreateScheme;