import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBuilding,
  FaMapMarkerAlt,
  FaHome,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaSyncAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

function OfficerSchemes() {
  const { token, user } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const officerDistrict = user?.district?.trim();

  // ==================================================
  // GET OFFICER DISTRICT CONFIGURATION
  // ==================================================

  const getDistrictConfiguration = (scheme) => {
    if (!scheme?.configurations?.length || !officerDistrict) {
      return null;
    }

    return (
      scheme.configurations.find(
        (configuration) =>
          configuration?.district?.trim().toLowerCase() ===
          officerDistrict.toLowerCase()
      ) || null
    );
  };

  // ==================================================
  // FETCH SCHEMES
  // ==================================================

  const fetchSchemes = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/schemes/officer",
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
          data.message || "Failed to load housing schemes."
        );
      }

      setSchemes(data.schemes || []);
    } catch (error) {
      console.error(
        "Fetch officer schemes error:",
        error
      );

      setError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // INITIAL FETCH
  // ==================================================

  useEffect(() => {
    if (token) {
      fetchSchemes();
    } else {
      setLoading(false);
    }
  }, [token]);

  // ==================================================
  // FORMAT DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not configured";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "Invalid date";
    }

    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // FORMAT PRICE
  // ==================================================

  const formatPrice = (price) => {
    if (
      price === undefined ||
      price === null ||
      price === ""
    ) {
      return "-";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "-";
    }

    return `₹${numericPrice.toLocaleString("en-IN")}`;
  };

  // ==================================================
  // CONFIGURATION STATUS
  // ==================================================

  const getConfigurationStatus = (configuration) => {
    if (!configuration) {
      return {
        label: "Not Configured",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    const totalUnits = Number(
      configuration.totalUnits || 0
    );

    const availableUnits = Number(
      configuration.availableUnits || 0
    );

    if (totalUnits < 1 || !configuration.location) {
      return {
        label: "Incomplete",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    if (availableUnits <= 0) {
      return {
        label: "Fully Allocated",
        className: "bg-red-100 text-red-700",
      };
    }

    if (!configuration.allotmentDate) {
      return {
        label: "Not Scheduled",
        className: "bg-gray-100 text-gray-700",
      };
    }

    const allotmentDate = new Date(
      configuration.allotmentDate
    );

    if (
      !Number.isNaN(allotmentDate.getTime()) &&
      allotmentDate > new Date()
    ) {
      return {
        label: "Upcoming",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Active",
      className: "bg-green-100 text-green-700",
    };
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center shadow-sm">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

            <p className="text-gray-500">
              Loading housing schemes...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <Link
              to="/officer"
              className="inline-flex items-center text-blue-600 text-sm font-medium hover:text-blue-800"
            >
              &larr; Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mt-3">
              Housing Schemes
            </h1>

            <p className="text-gray-500 mt-1">
              View common housing schemes and manage
              your district-specific configurations.
            </p>

            {officerDistrict && (
              <div className="inline-flex items-center gap-2 mt-3 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
                <FaMapMarkerAlt />

                <span>
                  Assigned District:
                  <strong className="ml-1">
                    {officerDistrict}
                  </strong>
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => fetchSchemes(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            <FaSyncAlt
              className={
                refreshing ? "animate-spin" : ""
              }
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ==================================================
            NO DISTRICT
        ================================================== */}

        {!officerDistrict && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mb-6">
            Your officer account does not have a district
            assigned. Please contact the administrator.
          </div>
        )}

        {/* ==================================================
            EMPTY
        ================================================== */}

        {!error && schemes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-12 text-center shadow-sm">
            <FaBuilding className="mx-auto text-4xl text-gray-300" />

            <h2 className="text-xl font-semibold text-gray-700 mt-4">
              No housing schemes available
            </h2>

            <p className="text-gray-500 mt-2">
              No common housing schemes have been
              created by the administration yet.
            </p>
          </div>
        )}

        {/* ==================================================
            SCHEME CARDS
        ================================================== */}

        {schemes.length > 0 && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {schemes.map((scheme) => {
              const configuration =
                getDistrictConfiguration(scheme);

              const totalUnits = Number(
                configuration?.totalUnits || 0
              );

              const availableUnits = Number(
                configuration?.availableUnits || 0
              );

              const status =
                getConfigurationStatus(configuration);

              return (
                <div
                  key={scheme._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >
                  {/* ==================================================
                      SCHEME HEADER
                  ================================================== */}

                  <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                          <FaBuilding />
                        </div>

                        <div>
                          <h2 className="text-xl font-semibold text-gray-800">
                            {scheme.schemeName ||
                              "Housing Scheme"}
                          </h2>

                          <p className="text-sm text-gray-500 mt-1">
                            {scheme.houseModel ||
                              "House model not specified"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 leading-6">
                      {scheme.description ||
                        "No description available."}
                    </p>
                  </div>

                  {/* ==================================================
                      COMMON SCHEME DETAILS
                  ================================================== */}

                  <div className="p-6">
                    <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                      Scheme Details
                    </h3>

                    <div className="grid grid-cols-2 gap-5 mt-4">
                      {/* House Model */}

                      <div>
                        <p className="text-xs text-gray-500">
                          House Model
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                          {scheme.houseModel || "-"}
                        </p>
                      </div>

                      {/* Price */}

                      <div>
                        <p className="text-xs text-gray-500">
                          House Price
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                          {formatPrice(scheme.price)}
                        </p>
                      </div>

                      {/* Eligible Categories */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Eligible Categories
                        </p>

                        <div className="flex flex-wrap gap-1 mt-1">
                          {scheme.eligibleIncomeCategories
                            ?.length ? (
                            scheme.eligibleIncomeCategories.map(
                              (category) => (
                                <span
                                  key={category}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                                >
                                  {category}
                                </span>
                              )
                            )
                          ) : (
                            <span className="text-gray-500">
                              -
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Maximum Income */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Maximum Annual Income
                        </p>

                        <p className="font-medium text-gray-800 mt-1">
                          {formatPrice(
                            scheme.maximumAnnualIncome
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      DISTRICT OPERATIONS
                  ================================================== */}

                  <div className="px-6 pb-6">
                    <div className="border-t border-gray-100 pt-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
                            {officerDistrict
                              ? `${officerDistrict} District`
                              : "District"}{" "}
                            Operations
                          </h3>

                          <p className="text-xs text-gray-500 mt-1">
                            Housing configuration managed
                            by the district officer.
                          </p>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.className}`}
                        >
                          {status.label ===
                          "Active" ? (
                            <FaCheckCircle />
                          ) : (
                            <FaClock />
                          )}

                          {status.label}
                        </span>
                      </div>

                      {!configuration && (
                        <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                          <p className="text-sm font-medium text-yellow-800">
                            District configuration not
                            created
                          </p>

                          <p className="text-xs text-yellow-700 mt-1">
                            Configure the housing location,
                            total units and allotment date
                            for your district.
                          </p>
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                        {/* Location */}

                        <div className="bg-gray-50 rounded-lg p-3">
                          <FaMapMarkerAlt className="text-blue-600 mb-2" />

                          <p className="text-xs text-gray-500">
                            Location
                          </p>

                          <p className="text-sm font-medium text-gray-800 mt-1 wrap-break-word">
                            {configuration?.location ||
                              "Not configured"}
                          </p>
                        </div>

                        {/* Total Units */}

                        <div className="bg-gray-50 rounded-lg p-3">
                          <FaHome className="text-blue-600 mb-2" />

                          <p className="text-xs text-gray-500">
                            Total Houses
                          </p>

                          <p className="text-sm font-medium text-gray-800 mt-1">
                            {configuration
                              ? totalUnits
                              : "-"}
                          </p>
                        </div>

                        {/* Available Units */}

                        <div className="bg-gray-50 rounded-lg p-3">
                          <FaCheckCircle className="text-green-600 mb-2" />

                          <p className="text-xs text-gray-500">
                            Available
                          </p>

                          <p className="text-sm font-medium text-green-700 mt-1">
                            {configuration
                              ? availableUnits
                              : "-"}
                          </p>
                        </div>

                        {/* Allotment Date */}

                        <div className="bg-gray-50 rounded-lg p-3">
                          <FaCalendarAlt className="text-purple-600 mb-2" />

                          <p className="text-xs text-gray-500">
                            Allotment Date
                          </p>

                          <p className="text-xs font-medium text-gray-800 mt-1">
                            {formatDate(
                              configuration?.allotmentDate
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ==================================================
                      ACTIONS
                  ================================================== */}

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/officer/schemes/${scheme._id}`}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white text-sm font-medium transition"
                      >
                        View Details
                      </Link>

                      <Link
                        to={`/officer/schemes/${scheme._id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition"
                      >
                        {configuration
                          ? "Edit Configuration"
                          : "Configure District"}
                      </Link>

                      <Link
                        to="/officer/applications"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                      >
                        Applications
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default OfficerSchemes;