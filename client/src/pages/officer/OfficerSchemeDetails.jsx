
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OfficerSchemeDetails() {
  const { schemeId } = useParams();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [totalUnits, setTotalUnits] = useState("");
  const [location, setLocation] = useState("");
  const [applicationStartDate, setApplicationStartDate] =
    useState("");
  const [applicationEndDate, setApplicationEndDate] =
    useState("");

  const [saving, setSaving] = useState(false);

  // ==================================================
  // FETCH ASSIGNED SCHEME
  // ==================================================

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/schemes/officer/${schemeId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load scheme."
          );
        }

        const loadedScheme = data.scheme;

        if (!loadedScheme) {
          throw new Error("Scheme data was not returned by the server.");
        }

        setScheme(loadedScheme);

        setTotalUnits(
          loadedScheme.totalUnits ?? ""
        );

        setLocation(
          loadedScheme.location ?? ""
        );

        setApplicationStartDate(
          loadedScheme.applicationStartDate
            ? new Date(
                loadedScheme.applicationStartDate
              )
                .toISOString()
                .split("T")[0]
            : ""
        );

        setApplicationEndDate(
          loadedScheme.applicationEndDate
            ? new Date(
                loadedScheme.applicationEndDate
              )
                .toISOString()
                .split("T")[0]
            : ""
        );
      } catch (error) {
        console.error(
          "Fetch officer scheme error:",
          error
        );

        setError(
          error.message ||
            "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    if (schemeId) {
      fetchScheme();
    } else {
      setError("Invalid scheme ID.");
      setLoading(false);
    }
  }, [schemeId]);

  // ==================================================
  // SAVE OPERATIONAL DETAILS
  // ==================================================

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
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
            totalUnits: Number(totalUnits),
            location,
            applicationStartDate,
            applicationEndDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update scheme."
        );
      }

      setScheme(data.scheme);

      setTotalUnits(
        data.scheme.totalUnits ?? ""
      );

      setLocation(
        data.scheme.location ?? ""
      );

      setApplicationStartDate(
        data.scheme.applicationStartDate
          ? new Date(
              data.scheme.applicationStartDate
            )
              .toISOString()
              .split("T")[0]
          : ""
      );

      setApplicationEndDate(
        data.scheme.applicationEndDate
          ? new Date(
              data.scheme.applicationEndDate
            )
              .toISOString()
              .split("T")[0]
          : ""
      );

      alert(
        data.message ||
          "Scheme operational details updated successfully."
      );
    } catch (error) {
      console.error(
        "Update scheme error:",
        error
      );

      setError(
        error.message ||
          "Unable to update scheme."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // OPEN SCHEME
  // ==================================================

  const handleOpenScheme = async () => {
    const confirmOpen = window.confirm(
      "Are you sure you want to open this scheme for applications?"
    );

    if (!confirmOpen) {
      return;
    }

    try {
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/schemes/officer/${schemeId}/open`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to open scheme."
        );
      }

      setScheme(data.scheme);

      alert(
        data.message ||
          "Housing scheme is now open for applications."
      );
    } catch (error) {
      console.error(
        "Open scheme error:",
        error
      );

      setError(
        error.message ||
          "Unable to open scheme."
      );
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
  // ERROR
  // ==================================================

  if (error && !scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">

          <Link
            to="/officer/schemes"
            className="text-blue-600 font-medium"
          >
            &larr; Back to My Schemes
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

  const isUpcoming =
    scheme.status === "UPCOMING";

  const canOpen =
    isUpcoming &&
    Number(scheme.totalUnits) >= 1 &&
    Boolean(scheme.location?.trim()) &&
    Boolean(scheme.applicationStartDate) &&
    Boolean(scheme.applicationEndDate);

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/officer/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to My Schemes
        </Link>

        {/* Error */}
        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Housing Scheme
              </p>

              <h1 className="text-3xl font-bold text-gray-800 mt-1">
                {scheme.schemeName}
              </h1>

              <p className="text-gray-500 mt-2">
                {scheme.location ||
                  "Location not configured"}
              </p>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                scheme.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : scheme.status === "UPCOMING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {scheme.status}
            </span>

          </div>

        </div>

        {/* Admin Created Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Scheme Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel}
              </p>
            </div>

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

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800">
            Scheme Description
          </h2>

          <p className="text-gray-600 mt-3 leading-relaxed">
            {scheme.description}
          </p>

        </div>

        {/* Eligibility */}
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

        {/* Officer Configuration */}
        <form
          onSubmit={handleSave}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6"
        >

          <h2 className="text-lg font-semibold text-gray-800">
            Scheme Operational Details
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Configure the details required before opening applications.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Total Units */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Housing Units
              </label>

              <input
                type="number"
                min="1"
                value={totalUnits}
                onChange={(e) =>
                  setTotalUnits(e.target.value)
                }
                disabled={!isUpcoming}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter total units"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Housing Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(e) =>
                  setLocation(e.target.value)
                }
                disabled={!isUpcoming}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                placeholder="Enter housing location"
              />
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Start Date
              </label>

              <input
                type="date"
                value={applicationStartDate}
                onChange={(e) =>
                  setApplicationStartDate(
                    e.target.value
                  )
                }
                disabled={!isUpcoming}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application End Date
              </label>

              <input
                type="date"
                value={applicationEndDate}
                onChange={(e) =>
                  setApplicationEndDate(
                    e.target.value
                  )
                }
                disabled={!isUpcoming}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              />
            </div>

          </div>

          {/* Save */}
          {isUpcoming && (
            <button
              type="submit"
              disabled={saving}
              className="mt-6 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300"
            >
              {saving
                ? "Saving..."
                : "Save Scheme Details"}
            </button>
          )}

        </form>

        {/* Open Applications */}
        {isUpcoming && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

            <h2 className="text-lg font-semibold text-gray-800">
              Publish Scheme
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Once all operational details are configured, you can open the scheme for applicants.
            </p>

            <button
              onClick={handleOpenScheme}
              disabled={!canOpen}
              className="mt-5 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Open Applications
            </button>

            {!canOpen && (
              <p className="text-sm text-red-500 mt-3">
                Complete total units, location, application start date and application end date before opening the scheme.
              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default OfficerSchemeDetails;

