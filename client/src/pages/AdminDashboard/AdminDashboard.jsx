import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  FaUsers,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaBuilding,
  FaUserTie,
  FaPlus,
  FaSyncAlt,
  FaMapMarkerAlt,
  FaSignOutAlt,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();

  // ==================================================
  // STATISTICS
  // ==================================================

  const [statistics, setStatistics] = useState({
    totalApplicants: 0,
    totalOfficers: 0,
    totalApplications: 0,
    pendingVerification: 0,
    housesAllotted: 0,
    totalAllotments: 0,
    activeSchemes: 0,
    totalSchemes: 0,
    upcomingSchemes: 0,
    closedSchemes: 0,
    completedSchemes: 0,
  });

  // ==================================================
  // DATA
  // ==================================================

  const [applications, setApplications] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [applicationStatusCounts, setApplicationStatusCounts] = useState({});

  // ==================================================
  // UI STATE
  // ==================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  // ==================================================
  // FETCH DASHBOARD
  // ==================================================

  const fetchDashboard = async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      setError("");

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please login again.");
      }

      const response = await fetch(
        "http://localhost:5000/api/admin/dashboard",
        {
          method: "GET",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch admin dashboard.");
      }

      // ==================================================
      // STATISTICS
      // ==================================================

      setStatistics({
        totalApplicants: data.statistics?.totalApplicants || 0,

        totalOfficers: data.statistics?.totalOfficers || 0,

        totalApplications: data.statistics?.totalApplications || 0,

        pendingVerification: data.statistics?.pendingVerification || 0,

        housesAllotted: data.statistics?.housesAllotted || 0,

        totalAllotments: data.statistics?.totalAllotments || 0,

        activeSchemes: data.statistics?.activeSchemes || 0,

        totalSchemes: data.statistics?.totalSchemes || 0,

        upcomingSchemes: data.statistics?.upcomingSchemes || 0,

        closedSchemes: data.statistics?.closedSchemes || 0,

        completedSchemes: data.statistics?.completedSchemes || 0,
      });

      // ==================================================
      // APPLICATIONS
      // ==================================================

      setApplications(
        Array.isArray(data.recentApplications) ? data.recentApplications : [],
      );

      // ==================================================
      // SCHEMES
      // ==================================================

      setSchemes(Array.isArray(data.schemes) ? data.schemes : []);

      // ==================================================
      // OFFICERS
      // ==================================================

      setOfficers(Array.isArray(data.officers) ? data.officers : []);

      // ==================================================
      // APPLICATION STATUS
      // ==================================================

      setApplicationStatusCounts(data.applicationStatusCounts || {});
    } catch (error) {
      console.error("Admin dashboard error:", error);

      setError(error.message || "Unable to load admin dashboard.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ==================================================
  // INITIAL LOAD + AUTO REFRESH
  // ==================================================

  useEffect(() => {
    fetchDashboard();

    const interval = setInterval(() => {
      fetchDashboard(false);
    }, 30000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==================================================
  // STATUS FORMAT
  // ==================================================

  const formatStatus = (status) => {
    if (!status) {
      return "-";
    }

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // ==================================================
  // STATUS STYLE
  // ==================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-yellow-100 text-yellow-700";

      case "UNDER_VERIFICATION":
        return "bg-orange-100 text-orange-700";

      case "ELIGIBLE":
        return "bg-blue-100 text-blue-700";

      case "INELIGIBLE":
        return "bg-red-100 text-red-700";

      case "WAITING_LIST":
        return "bg-purple-100 text-purple-700";

      case "ALLOTMENT_OFFERED":
        return "bg-indigo-100 text-indigo-700";

      case "ALLOTTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "WITHDRAWN":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==================================================
  // SCHEME STATUS STYLE
  // ==================================================

  const getSchemeStatusStyle = (status) => {
    switch (status) {
      case "OPEN":
        return "bg-green-100 text-green-700";

      case "UPCOMING":
        return "bg-blue-100 text-blue-700";

      case "CLOSED":
        return "bg-orange-100 text-orange-700";

      case "COMPLETED":
        return "bg-gray-100 text-gray-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // ==================================================
  // DATE
  // ==================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==================================================
  // STATISTICS CARDS
  // ==================================================

  const statisticCards = [
    {
      title: "Total Applicants",
      value: statistics.totalApplicants,
      icon: <FaUsers />,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },

    {
      title: "Total Officers",
      value: statistics.totalOfficers,
      icon: <FaUserTie />,
      iconBg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },

    {
      title: "Total Applications",
      value: statistics.totalApplications,
      icon: <FaFileAlt />,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },

    {
      title: "Pending Verification",
      value: statistics.pendingVerification,
      icon: <FaClock />,
      iconBg: "bg-yellow-50",
      iconColor: "text-yellow-600",
    },

    {
      title: "Houses Allotted",
      value: statistics.housesAllotted,
      icon: <FaCheckCircle />,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },

    {
      title: "Active Schemes",
      value: statistics.activeSchemes,
      icon: <FaBuilding />,
      iconBg: "bg-pink-50",
      iconColor: "text-pink-600",
    },
  ];

  // ------------------------------------------
  // LOGOUT
  // ------------------------------------------

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");

    navigate("/login");
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />

          <p className="text-gray-500">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // ==================================================
  // MAIN
  // ==================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ==================================================
          HEADER
      ================================================== */}

      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-blue-600">
              State Housing Board
            </h1>

            <p className="text-xs text-gray-500">Administration Portal</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => fetchDashboard(false)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <FaSyncAlt className={refreshing ? "animate-spin" : ""} />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
              <FaUserTie />
            </div>

            <div>
              <p className="text-sm font-medium text-gray-800">Admin</p>

              <p className="text-xs text-gray-500">Administrator</p>
            </div>

            {/* =================================
                        LOGOUT
                ================================= */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition"
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* ==================================================
          MAIN
      ================================================== */}

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* HEADING */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>

          <p className="text-gray-500 mt-1">
            Monitor users, officers, applications, schemes and allotments.
          </p>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
          {statisticCards.map((card) => (
            <div
              key={card.title}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-gray-500">{card.title}</p>

                  <h3 className="text-2xl font-bold text-gray-800 mt-2">
                    {card.value}
                  </h3>
                </div>

                <div
                  className={`w-11 h-11 ${card.iconBg} ${card.iconColor} rounded-lg flex items-center justify-center`}
                >
                  {card.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Link
              to="/admin/schemes/create"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-blue-200 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                  <FaBuilding size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Create Housing Scheme
                    </h4>

                    <FaPlus className="text-gray-400 group-hover:text-blue-600" />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Create a new government housing scheme.
                  </p>
                </div>
              </div>
            </Link>

            <Link
              to="/admin/officers/create"
              className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md hover:border-indigo-200 transition group"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                  <FaUserTie size={20} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-gray-800">
                      Create Officer
                    </h4>

                    <FaPlus className="text-gray-400 group-hover:text-indigo-600" />
                  </div>

                  <p className="text-sm text-gray-500 mt-2">
                    Create an officer account and assign a district.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ==================================================
            PORTAL ANALYTICS
        ================================================== */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* APPLICATION STATUS */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Application Status
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current status of all applications.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(applicationStatusCounts).map(
                ([status, count]) => {
                  const total = statistics.totalApplications || 1;

                  const percentage = (count / total) * 100;

                  return (
                    <div key={status}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">
                          {formatStatus(status)}
                        </span>

                        <span className="text-sm font-semibold text-gray-800">
                          {count}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all"
                          style={{
                            width: `${Math.min(percentage, 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          </div>

          {/* SCHEME SUMMARY */}

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800">
                Housing Scheme Overview
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Current scheme distribution.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-xl p-5">
                <p className="text-sm text-gray-600">Total Schemes</p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  {statistics.totalSchemes}
                </p>
              </div>

              <div className="bg-green-50 rounded-xl p-5">
                <p className="text-sm text-gray-600">Open Schemes</p>

                <p className="text-2xl font-bold text-green-700 mt-1">
                  {statistics.activeSchemes}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-5">
                <p className="text-sm text-gray-600">Upcoming</p>

                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  {statistics.upcomingSchemes}
                </p>
              </div>

              <div className="bg-gray-100 rounded-xl p-5">
                <p className="text-sm text-gray-600">Completed</p>

                <p className="text-2xl font-bold text-gray-700 mt-1">
                  {statistics.completedSchemes}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================
            HOUSING SCHEMES
        ================================================== */}

        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Housing Schemes
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                All housing schemes created by the administration.
              </p>
            </div>

            <Link
              to="/admin/schemes/create"
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
            >
              <FaPlus />
              New Scheme
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="text-left px-6 py-3 font-medium">Scheme</th>

                  <th className="text-left px-6 py-3 font-medium">
                    House Model
                  </th>

                  <th className="text-left px-6 py-3 font-medium">Price</th>

                  <th className="text-left px-6 py-3 font-medium">Status</th>

                  <th className="text-left px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {schemes.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No housing schemes found.
                    </td>
                  </tr>
                ) : (
                  schemes.map((scheme) => (
                    <tr
                      key={scheme._id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800">
                          {scheme.schemeName}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {scheme.eligibleIncomeCategories?.join(", ")}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {scheme.houseModel || "-"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        ₹{Number(scheme.price || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getSchemeStatusStyle(
                            scheme.status,
                          )}`}
                        >
                          {scheme.status}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(scheme.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================
            OFFICERS
        ================================================== */}

        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                District Officers
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Officers currently registered in the system.
              </p>
            </div>

            <Link
              to="/admin/officers/create"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              <FaPlus />
              New Officer
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="text-left px-6 py-3 font-medium">Officer</th>

                  <th className="text-left px-6 py-3 font-medium">Phone</th>

                  <th className="text-left px-6 py-3 font-medium">District</th>

                  <th className="text-left px-6 py-3 font-medium">Status</th>

                  <th className="text-left px-6 py-3 font-medium">Created</th>
                </tr>
              </thead>

              <tbody>
                {officers.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No officers found.
                    </td>
                  </tr>
                ) : (
                  officers.map((officer) => (
                    <tr
                      key={officer._id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                            <FaUserTie />
                          </div>

                          <div>
                            <p className="font-medium text-gray-800">
                              {officer.name}
                            </p>

                            <p className="text-xs text-gray-400">
                              {officer.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {officer.phone || "-"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FaMapMarkerAlt className="text-gray-400" />
                          {officer.district || "-"}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            officer.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {officer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(officer.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==================================================
            RECENT APPLICATIONS
        ================================================== */}

        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Recent Applications
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Latest applications submitted to the portal.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-gray-500">
                  <th className="text-left px-6 py-3 font-medium">
                    Application ID
                  </th>

                  <th className="text-left px-6 py-3 font-medium">Applicant</th>

                  <th className="text-left px-6 py-3 font-medium">Scheme</th>

                  <th className="text-left px-6 py-3 font-medium">Date</th>

                  <th className="text-left px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody>
                {applications.length === 0 ? (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-6 py-10 text-center text-gray-500"
                    >
                      No applications found.
                    </td>
                  </tr>
                ) : (
                  applications.map((application) => (
                    <tr
                      key={application._id}
                      className="border-t border-gray-100 hover:bg-gray-50"
                    >
                      <td className="px-6 py-4 font-medium text-gray-800">
                        {application.applicationNumber || application._id}
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-700">
                          {application.applicantId?.name || "Unknown"}
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          {application.applicantId?.email || "-"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {application.schemeId?.schemeName || "Unknown"}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {formatDate(
                          application.createdAt || application.submittedAt,
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                            application.status,
                          )}`}
                        >
                          {formatStatus(application.status)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
