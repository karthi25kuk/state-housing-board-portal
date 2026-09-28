import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaBuilding,
  FaCheckCircle,
  FaClock,
  FaFileAlt,
  FaUser,
  FaSignOutAlt,
} from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

function OfficerDashboard() {
  const { token, user, logout } = useAuth();
  const navigate = useNavigate();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH OFFICER SCHEMES
  // ==========================================

  useEffect(() => {
    const fetchSchemes = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

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
            data.message || "Failed to fetch housing schemes."
          );
        }

        setSchemes(data.schemes || []);
      } catch (error) {
        console.error("Fetch officer schemes error:", error);

        setError(
          error.message || "Failed to fetch housing schemes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, [token]);

  // ==========================================
  // OFFICER CONFIGURATIONS
  // ==========================================

  const configurations = useMemo(() => {
    return schemes.flatMap((scheme) => {
      const schemeConfigurations = Array.isArray(
        scheme.configurations
      )
        ? scheme.configurations
        : [];

      return schemeConfigurations.map((configuration) => ({
        ...configuration,
        scheme,
      }));
    });
  }, [schemes]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalSchemes = schemes.length;

  const totalConfigurations = configurations.length;

  const totalUnits = configurations.reduce(
    (total, configuration) =>
      total + (Number(configuration.totalUnits) || 0),
    0
  );

  const availableUnits = configurations.reduce(
    (total, configuration) =>
      total + (Number(configuration.availableUnits) || 0),
    0
  );

  const configurationsWithUnits = configurations.filter(
    (configuration) =>
      Number(configuration.availableUnits || 0) > 0
  ).length;

  // ==========================================
  // DATE FORMATTER
  // ==========================================

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

  // ==========================================
  // CONFIGURATION STATUS
  // ==========================================

  const getConfigurationStatus = (configuration) => {
    const available = Number(
      configuration.availableUnits || 0
    );

    if (available <= 0) {
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

    if (allotmentDate > new Date()) {
      return {
        label: "Upcoming",
        className: "bg-yellow-100 text-yellow-700",
      };
    }

    return {
      label: "Ready",
      className: "bg-green-100 text-green-700",
    };
  };

  // ==========================================
  // LOGOUT
  // ==========================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            Officer Dashboard
          </h1>

          <p className="text-gray-600 mt-2">
            Welcome back, {user?.name || "Officer"}.
          </p>

          {user?.district && (
            <p className="text-sm text-gray-500 mt-1">
              District: {user.district}
            </p>
          )}
        </div>

        {/* ==========================================
            PROFILE + LOGOUT
        ========================================== */}

        <div className="flex items-center gap-3">

          <Link
            to="/profile"
            className="inline-flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 px-4 py-2.5 rounded-lg hover:bg-gray-50 transition"
          >
            <FaUser />
            Profile
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-lg hover:bg-red-700 transition"
          >
            <FaSignOutAlt />
            Logout
          </button>

          <Link
            to="/officer/schemes"
            className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            <FaBuilding />
            Manage Housing Schemes
          </Link>

        </div>
      </div>

      {/* ==========================================
          ERROR
      ========================================== */}

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* ==========================================
          STATISTICS
      ========================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

        {/* Total Schemes */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Schemes
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : totalSchemes}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaBuilding />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            Common schemes available in your district
          </p>

        </div>

        {/* Configurations */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                District Configurations
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : totalConfigurations}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FaCheckCircle />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            Housing configurations managed by you
          </p>

        </div>

        {/* Total Units */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Total Units
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : totalUnits}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <FaClock />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            Housing units configured in your district
          </p>

        </div>

        {/* Available Units */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">

          <div className="flex items-center justify-between">

            <div>
              <p className="text-sm text-gray-500">
                Available Units
              </p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : availableUnits}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaFileAlt />
            </div>

          </div>

          <p className="text-xs text-gray-500 mt-4">
            {configurationsWithUnits} configurations have available units
          </p>

        </div>

      </div>

      {/* ==========================================
          MY HOUSING CONFIGURATIONS
      ========================================== */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b border-gray-100">

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              My Housing Configurations
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              District-specific housing configurations managed by you.
            </p>
          </div>

          <Link
            to="/officer/schemes"
            className="text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            View All →
          </Link>

        </div>

        {/* Loading */}

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Loading housing configurations...
          </div>
        )}

        {/* No configurations */}

        {!loading && configurations.length === 0 && (
          <div className="p-8 text-center">

            <FaBuilding className="mx-auto text-3xl text-gray-300" />

            <h3 className="text-lg font-semibold text-gray-800 mt-3">
              No configurations found
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              No housing configuration has been created for your district yet.
            </p>

            <Link
              to="/officer/schemes"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Manage Schemes
            </Link>

          </div>
        )}

        {/* Configurations */}

        {!loading && configurations.length > 0 && (
          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50 text-gray-500">

                <tr>

                  <th className="text-left px-6 py-3 font-medium">
                    Scheme
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Location
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Units
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Available
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Allotment Date
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Status
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {configurations
                  .slice(0, 5)
                  .map((configuration) => {

                    const scheme = configuration.scheme;

                    const configurationStatus =
                      getConfigurationStatus(
                        configuration
                      );

                    return (
                      <tr
                        key={`${scheme._id}-${configuration._id}`}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        {/* Scheme */}

                        <td className="px-6 py-4">

                          <p className="font-medium text-gray-800">
                            {scheme.schemeName ||
                              "Housing Scheme"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {scheme.houseModel ||
                              "House model not specified"}
                          </p>

                        </td>

                        {/* Location */}

                        <td className="px-6 py-4 text-gray-600">

                          <p>
                            {configuration.location || "-"}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {configuration.district ||
                              user?.district ||
                              "-"}
                          </p>

                        </td>

                        {/* Total Units */}

                        <td className="px-6 py-4 text-gray-600">
                          {Number(
                            configuration.totalUnits
                          ) || 0}
                        </td>

                        {/* Available Units */}

                        <td className="px-6 py-4 text-gray-600">
                          {Number(
                            configuration.availableUnits
                          ) || 0}
                        </td>

                        {/* Allotment Date */}

                        <td className="px-6 py-4 text-gray-600">
                          {formatDate(
                            configuration.allotmentDate
                          )}
                        </td>

                        {/* Status */}

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${configurationStatus.className}`}
                          >
                            {configurationStatus.label}
                          </span>

                        </td>

                        {/* Action */}

                        <td className="px-6 py-4">

                          <Link
                            to={`/officer/schemes/${scheme._id}`}
                            className="text-blue-600 font-medium hover:text-blue-800"
                          >
                            View
                          </Link>

                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>

          </div>
        )}

      </div>

      {/* ==========================================
          QUICK ACTIONS
      ========================================== */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">

        <Link
          to="/officer/schemes"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">
            Manage Housing Schemes
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            View common schemes and manage your district configurations.
          </p>
        </Link>

        <Link
          to="/officer/applications"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">
            Manage Applications
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Review and verify applications from your district.
          </p>
        </Link>

        <Link
          to="/officer/schemes"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">
            Housing Allotment
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Manage district housing configurations and allotment schedules.
          </p>
        </Link>

      </div>

    </div>
  );
}

export default OfficerDashboard;