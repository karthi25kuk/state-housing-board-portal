import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { FaBuilding, FaCheckCircle, FaClock, FaFileAlt } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

function OfficerDashboard() {
  const { token, user } = useAuth();

  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH OFFICER SCHEMES
  // ==========================================

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "http://localhost:5000/api/schemes/officer",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch schemes.");
        }

        setSchemes(data.schemes || []);
      } catch (error) {
        console.error("Fetch officer schemes error:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchSchemes();
    }
  }, [token]);

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalSchemes = schemes.length;

  const openSchemes = schemes.filter(
    (scheme) => scheme.status === "OPEN",
  ).length;

  const upcomingSchemes = schemes.filter(
    (scheme) => scheme.status === "UPCOMING",
  ).length;

  const totalUnits = schemes.reduce(
    (total, scheme) => total + (Number(scheme.totalUnits) || 0),
    0,
  );

  const availableUnits = schemes.reduce(
    (total, scheme) => total + (Number(scheme.availableUnits) || 0),
    0,
  );

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";

      case "UPCOMING":
        return "bg-yellow-100 text-yellow-700";

      case "CLOSED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* ==========================================
          HEADER
      ========================================== */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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

        <Link
          to="/officer/create-scheme"
          className="inline-flex items-center justify-center bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          + Create Housing Scheme
        </Link>
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
              <p className="text-sm text-gray-500">Total Schemes</p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : totalSchemes}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FaBuilding />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Schemes created in your district
          </p>
        </div>

        {/* Open Schemes */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Schemes</p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : openSchemes}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
              <FaCheckCircle />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Currently accepting applications
          </p>
        </div>

        {/* Upcoming Schemes */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Schemes</p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : upcomingSchemes}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center">
              <FaClock />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Schemes awaiting publication
          </p>
        </div>

        {/* Available Units */}

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Available Units</p>

              <h2 className="text-2xl font-bold text-gray-800 mt-1">
                {loading ? "..." : availableUnits}
              </h2>
            </div>

            <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <FaFileAlt />
            </div>
          </div>

          <p className="text-xs text-gray-500 mt-4">
            {totalUnits} total housing units
          </p>
        </div>
      </div>

      {/* ==========================================
          MY SCHEMES
      ========================================== */}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              My Housing Schemes
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Housing schemes created by you.
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
            Loading housing schemes...
          </div>
        )}

        {/* No schemes */}

        {!loading && schemes.length === 0 && (
          <div className="p-8 text-center">
            <FaBuilding className="mx-auto text-3xl text-gray-300" />

            <h3 className="text-lg font-semibold text-gray-800 mt-3">
              No schemes created yet
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Create your first housing scheme to get started.
            </p>

            <Link
              to="/officer/create-scheme"
              className="inline-block mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Create Scheme
            </Link>
          </div>
        )}

        {/* Schemes */}

        {!loading && schemes.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="text-left px-6 py-3 font-medium">Scheme</th>

                  <th className="text-left px-6 py-3 font-medium">Location</th>

                  <th className="text-left px-6 py-3 font-medium">Units</th>

                  <th className="text-left px-6 py-3 font-medium">Available</th>

                  <th className="text-left px-6 py-3 font-medium">Deadline</th>

                  <th className="text-left px-6 py-3 font-medium">Status</th>

                  <th className="text-left px-6 py-3 font-medium">Action</th>
                </tr>
              </thead>

              <tbody>
                {schemes.slice(0, 5).map((scheme) => (
                  <tr
                    key={scheme._id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-800">
                        {scheme.schemeName}
                      </p>

                      <p className="text-xs text-gray-500 mt-1">
                        {scheme.houseModel}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {scheme.location}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {scheme.totalUnits}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {scheme.availableUnits}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(scheme.applicationEndDate)}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                          scheme.status,
                        )}`}
                      >
                        {scheme.status}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Link
                        to={`/officer/scheme/${scheme._id}`}
                        className="text-blue-600 font-medium hover:text-blue-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
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
          to="/officer/create-scheme"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">Create Housing Scheme</h3>

          <p className="text-sm text-gray-500 mt-1">
            Create and publish a new housing scheme.
          </p>
        </Link>

        <Link
          to="/officer/schemes"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">Manage Schemes</h3>

          <p className="text-sm text-gray-500 mt-1">
            View and manage your housing schemes.
          </p>
        </Link>

        <Link
          to="/officer/applications"
          className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition"
        >
          <h3 className="font-semibold text-gray-800">Manage Applications</h3>

          <p className="text-sm text-gray-500 mt-1">
            Review applicant housing applications.
          </p>
        </Link>

      </div>
    </div>
  );
}

export default OfficerDashboard;
