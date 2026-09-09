import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OfficerSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchemes = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/schemes/officer",
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
          data.message || "Failed to load schemes."
        );
      }

      setSchemes(data.schemes || []);
    } catch (error) {
      console.error("Fetch officer schemes error:", error);
      setError(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  // ==================================================
  // OPEN SCHEME
  // ==================================================

  const handleOpenScheme = async (schemeId) => {
    const confirmOpen = window.confirm(
      "Are you sure you want to open this scheme for applications?"
    );

    if (!confirmOpen) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

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
        alert(data.message || "Unable to open scheme.");
        return;
      }

      alert(
        data.message ||
          "Scheme is now open for applications."
      );

      fetchSchemes();
    } catch (error) {
      console.error("Open scheme error:", error);
      alert("Unable to connect to the server.");
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">
            Loading schemes...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <Link
              to="/officer"
              className="text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              &larr; Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              My Housing Schemes
            </h1>

            <p className="text-gray-500 mt-1">
              Housing schemes assigned to you by the administration.
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && schemes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No schemes assigned
            </h2>

            <p className="text-gray-500 mt-2">
              No housing schemes have been assigned to you by the administrator.
            </p>

          </div>
        )}

        {/* Scheme Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {schemes.map((scheme) => (

            <div
              key={scheme._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >

              {/* Header */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {scheme.schemeName}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {scheme.location || "Location not configured"}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    scheme.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : scheme.status === "UPCOMING"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {scheme.status}
                </span>

              </div>

              {/* Description */}
              <p className="text-gray-600 mt-4 text-sm">
                {scheme.description}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mt-6">

                <div>
                  <p className="text-xs text-gray-500">
                    House Model
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {scheme.houseModel}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Price
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    ₹
                    {Number(
                      scheme.price || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Total Houses
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {scheme.totalUnits ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Available Houses
                  </p>

                  <p className="font-medium text-green-600 mt-1">
                    {scheme.availableUnits ?? "-"}
                  </p>
                </div>

              </div>

              {/* Dates */}
              <div className="border-t border-gray-100 mt-6 pt-5">

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Applications Open
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {scheme.applicationStartDate
                        ? new Date(
                            scheme.applicationStartDate
                          ).toLocaleDateString("en-IN")
                        : "Not configured"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Applications Close
                    </p>

                    <p className="text-sm font-medium text-gray-700 mt-1">
                      {scheme.applicationEndDate
                        ? new Date(
                            scheme.applicationEndDate
                          ).toLocaleDateString("en-IN")
                        : "Not configured"}
                    </p>
                  </div>

                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">

                <Link
                  to={`/officer/schemes/${scheme._id}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  View Details
                </Link>

                {scheme.status === "UPCOMING" && (
                  <Link
                    to={`/officer/schemes/${scheme._id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Configure Scheme
                  </Link>
                )}

                {scheme.status === "UPCOMING" &&
                  scheme.totalUnits &&
                  scheme.location &&
                  scheme.applicationStartDate &&
                  scheme.applicationEndDate && (
                    <button
                      onClick={() =>
                        handleOpenScheme(scheme._id)
                      }
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      Open Applications
                    </button>
                  )}

              </div>

            </div>

          ))}

        </div>

      </div>
    </div>
  );
}

export default OfficerSchemes;