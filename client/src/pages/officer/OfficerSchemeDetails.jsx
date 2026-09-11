import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function OfficerSchemeDetails() {
  const { schemeId } = useParams();
  const { token, user } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [configuration, setConfiguration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [location, setLocation] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [allotmentDate, setAllotmentDate] = useState("");

  // ==================================================
  // DATE FORMATTER FOR INPUT
  // ==================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  // ==================================================
  // DISPLAY DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // FIND OFFICER CONFIGURATION
  // ==================================================

  const findConfiguration = (loadedScheme) => {
    const configurations = Array.isArray(
      loadedScheme?.configurations
    )
      ? loadedScheme.configurations
      : [];

    const officerDistrict = user?.district?.trim().toLowerCase();

    if (!officerDistrict) {
      return configurations[0] || null;
    }

    return (
      configurations.find(
        (item) =>
          item.district?.trim().toLowerCase() ===
          officerDistrict
      ) || null
    );
  };

  // ==================================================
  // FETCH SCHEME
  // ==================================================

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        if (!token) {
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        if (!schemeId) {
          setError("Invalid scheme ID.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/schemes/officer/${schemeId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load scheme."
          );
        }

        if (!data.scheme) {
          throw new Error(
            "Scheme data was not returned by the server."
          );
        }

        const loadedScheme = data.scheme;

        setScheme(loadedScheme);

        const officerConfiguration =
          findConfiguration(loadedScheme);

        setConfiguration(officerConfiguration);

        if (officerConfiguration) {
          setLocation(
            officerConfiguration.location || ""
          );

          setTotalUnits(
            officerConfiguration.totalUnits ?? ""
          );

          setAllotmentDate(
            formatDateForInput(
              officerConfiguration.allotmentDate
            )
          );
        } else {
          setLocation("");
          setTotalUnits("");
          setAllotmentDate("");
        }
      } catch (error) {
        console.error(
          "Fetch officer scheme error:",
          error
        );

        setError(
          error.message ||
            "Unable to load scheme details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId, token, user?.district]);

  // ==================================================
  // SAVE DISTRICT CONFIGURATION
  // ==================================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!user?.district) {
        setError(
          "Your officer account does not have a district assigned."
        );
        return;
      }

      if (!location.trim()) {
        setError("Housing location is required.");
        return;
      }

      const units = Number(totalUnits);

      if (!Number.isInteger(units) || units < 1) {
        setError(
          "Total housing units must be a whole number greater than 0."
        );
        return;
      }

      if (!allotmentDate) {
        setError("Allotment date is required.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/schemes/officer/${schemeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            configurationId:
              configuration?._id || undefined,
            location: location.trim(),
            totalUnits: units,
            allotmentDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update housing configuration."
        );
      }

      const updatedScheme = data.scheme;

      setScheme(updatedScheme);

      const updatedConfiguration =
        findConfiguration(updatedScheme);

      setConfiguration(updatedConfiguration);

      if (updatedConfiguration) {
        setLocation(
          updatedConfiguration.location || ""
        );

        setTotalUnits(
          updatedConfiguration.totalUnits ?? ""
        );

        setAllotmentDate(
          formatDateForInput(
            updatedConfiguration.allotmentDate
          )
        );
      }

      setSuccess(
        data.message ||
          "District housing configuration updated successfully."
      );
    } catch (error) {
      console.error(
        "Update housing configuration error:",
        error
      );

      setError(
        error.message ||
          "Unable to update housing configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">
            Loading scheme details...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR WITHOUT SCHEME
  // ==================================================

  if (error && !scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/officer/schemes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Housing Schemes
          </Link>

          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">
            Scheme not found.
          </p>
        </div>
      </div>
    );
  }

  const availableUnits = Number(
    configuration?.availableUnits || 0
  );

  const configuredUnits = Number(
    configuration?.totalUnits || 0
  );

  const isConfigurationCreated = Boolean(configuration);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ==========================================
            BACK
        ========================================== */}

        <Link
          to="/officer/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Housing Schemes
        </Link>

        {/* ==========================================
            ERROR / SUCCESS
        ========================================== */}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <div>
            <p className="text-sm text-gray-500">
              Housing Scheme
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {scheme.schemeName}
            </h1>

            <p className="text-gray-500 mt-2">
              District:{" "}
              {configuration?.district ||
                user?.district ||
                "Not assigned"}
            </p>
          </div>
        </div>

        {/* ==========================================
            COMMON SCHEME INFORMATION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Scheme Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* House Model */}

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel || "-"}
              </p>
            </div>

            {/* House Price */}

            <div>
              <p className="text-sm text-gray-500">
                House Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {Number(
                  scheme.price || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            {/* Maximum Income */}

            <div>
              <p className="text-sm text-gray-500">
                Maximum Annual Income
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {Number(
                  scheme.maximumAnnualIncome || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            DESCRIPTION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Scheme Description
          </h2>

          <p className="text-gray-600 mt-3 leading-relaxed">
            {scheme.description || "No description available."}
          </p>
        </div>

        {/* ==========================================
            ELIGIBILITY
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Eligible Income Categories
          </h2>

          <div className="flex flex-wrap gap-3">
            {scheme.eligibleIncomeCategories?.length > 0 ? (
              scheme.eligibleIncomeCategories.map(
                (category) => (
                  <span
                    key={category}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                  >
                    {category}
                  </span>
                )
              )
            ) : (
              <p className="text-sm text-gray-500">
                No income categories configured.
              </p>
            )}
          </div>
        </div>

        {/* ==========================================
            DISTRICT CONFIGURATION
        ========================================== */}

        <form
          onSubmit={handleSave}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            District Housing Configuration
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Configure housing details for your assigned district.
            These details are specific to your district and do not
            change the common scheme information.
          </p>

          {/* District */}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>

            <input
              type="text"
              value={
                configuration?.district ||
                user?.district ||
                ""
              }
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Location */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Housing Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter housing location"
              />
            </div>

            {/* Total Units */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Housing Units
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={totalUnits}
                onChange={(event) =>
                  setTotalUnits(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total units"
              />
            </div>

            {/* Allotment Date */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allotment Date
              </label>

              <input
                type="date"
                value={allotmentDate}
                onChange={(event) =>
                  setAllotmentDate(event.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                Allotment processing is driven by this
                district configuration date.
              </p>
            </div>
          </div>

          {/* Current Availability */}

          {isConfigurationCreated && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Configured Units
                </p>

                <p className="text-xl font-bold text-gray-800 mt-1">
                  {configuredUnits}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Available Units
                </p>

                <p className="text-xl font-bold text-green-700 mt-1">
                  {availableUnits}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Allotment Date
                </p>

                <p className="text-sm font-semibold text-blue-700 mt-2">
                  {formatDate(
                    configuration?.allotmentDate
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Save */}

          <button
            type="submit"
            disabled={saving}
            className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : isConfigurationCreated
              ? "Update Configuration"
              : "Create District Configuration"}
          </button>
        </form>

        {/* ==========================================
            WORKFLOW INFORMATION
        ========================================== */}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-800">
            Officer Workflow
          </h2>

          <div className="mt-4 space-y-3 text-sm text-blue-900">
            <p>
              <strong>1.</strong> Configure the housing location,
              total units and allotment date for your district.
            </p>

            <p>
              <strong>2.</strong> Verify eligible applications
              submitted by applicants from your district.
            </p>

            <p>
              <strong>3.</strong> Generate and manage the
              district-wise waiting list.
            </p>

            <p>
              <strong>4.</strong> Process housing allotments based
              on the district waiting-list ranking and available
              units.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerSchemeDetails;