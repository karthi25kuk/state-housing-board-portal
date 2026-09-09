import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

function OfficerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [schemeFilter, setSchemeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/officer/applications",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(
            data.message || "Failed to load applications."
          );
          return;
        }

        setApplications(data.applications || []);
      } catch (error) {
        console.error("Fetch applications error:", error);

        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";

      case "UNDER_VERIFICATION":
        return "bg-yellow-100 text-yellow-700";

      case "ELIGIBLE":
        return "bg-green-100 text-green-700";

      case "INELIGIBLE":
      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "WAITING_LIST":
        return "bg-purple-100 text-purple-700";

      case "ALLOTMENT_OFFERED":
      case "ALLOTTED":
        return "bg-green-100 text-green-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // UNIQUE SCHEMES
  // ==========================================

  const schemes = useMemo(() => {
    const uniqueSchemes = [];

    applications.forEach((application) => {
      const scheme = application.schemeId;

      if (
        scheme?._id &&
        !uniqueSchemes.some(
          (item) => item._id === scheme._id
        )
      ) {
        uniqueSchemes.push(scheme);
      }
    });

    return uniqueSchemes;
  }, [applications]);

  // ==========================================
  // FILTER APPLICATIONS
  // ==========================================

  const filteredApplications = useMemo(() => {
    return applications.filter((application) => {
      const schemeMatch =
        schemeFilter === "ALL" ||
        application.schemeId?._id === schemeFilter;

      const statusMatch =
        statusFilter === "ALL" ||
        application.status === statusFilter;

      return schemeMatch && statusMatch;
    });
  }, [
    applications,
    schemeFilter,
    statusFilter,
  ]);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">
            Loading applications...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-7xl mx-auto">

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mb-8">

          <Link
            to="/officer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Dashboard
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-3">

            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Applications
              </h1>

              <p className="text-gray-500 mt-1">
                Review applications submitted for your housing schemes.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg px-5 py-3">

              <p className="text-xs text-gray-500">
                Showing Applications
              </p>

              <p className="text-2xl font-bold text-blue-600">
                {filteredApplications.length}
              </p>

            </div>

          </div>
        </div>

        {/* ======================================
            ERROR
        ====================================== */}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* ======================================
            FILTERS
        ====================================== */}

        {!error && applications.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">

            <div className="flex flex-col md:flex-row gap-5">

              {/* Scheme Filter */}

              <div className="flex-1">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Housing Scheme
                </label>

                <select
                  value={schemeFilter}
                  onChange={(e) =>
                    setSchemeFilter(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="ALL">
                    All Schemes
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

              </div>

              {/* Status Filter */}

              <div className="flex-1">

                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Status
                </label>

                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
                >

                  <option value="ALL">
                    All Statuses
                  </option>

                  <option value="SUBMITTED">
                    Submitted
                  </option>

                  <option value="UNDER_VERIFICATION">
                    Under Verification
                  </option>

                  <option value="ELIGIBLE">
                    Eligible
                  </option>

                  <option value="INELIGIBLE">
                    Ineligible
                  </option>

                  <option value="WAITING_LIST">
                    Waiting List
                  </option>

                  <option value="ALLOTMENT_OFFERED">
                    Allotment Offered
                  </option>

                  <option value="ALLOTTED">
                    Allotted
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>

                </select>

              </div>

              {/* Reset */}

              <div className="flex items-end">

                <button
                  type="button"
                  onClick={() => {
                    setSchemeFilter("ALL");
                    setStatusFilter("ALL");
                  }}
                  className="px-5 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
                >
                  Reset Filters
                </button>

              </div>

            </div>

          </div>
        )}

        {/* ======================================
            EMPTY
        ====================================== */}

        {!error &&
          applications.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

              <h2 className="text-xl font-semibold text-gray-700">
                No applications found
              </h2>

              <p className="text-gray-500 mt-2">
                Applications submitted for your housing schemes
                will appear here.
              </p>

            </div>
          )}

        {/* ======================================
            NO FILTER RESULTS
        ====================================== */}

        {!error &&
          applications.length > 0 &&
          filteredApplications.length === 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

              <h2 className="text-xl font-semibold text-gray-700">
                No matching applications
              </h2>

              <p className="text-gray-500 mt-2">
                Try changing the selected filters.
              </p>

            </div>
          )}

        {/* ======================================
            APPLICATION TABLE
        ====================================== */}

        {filteredApplications.length > 0 && (

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead className="bg-gray-50 text-gray-500">

                  <tr>

                    <th className="text-left px-6 py-4 font-medium">
                      Application
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Applicant
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Housing Scheme
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Income Category
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Income
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Status
                    </th>

                    <th className="text-left px-6 py-4 font-medium">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredApplications.map(
                    (application) => (

                      <tr
                        key={application._id}
                        className="border-t border-gray-100 hover:bg-gray-50"
                      >

                        {/* Application */}

                        <td className="px-6 py-4">

                          <p className="font-semibold text-gray-800">
                            {application.applicationNumber}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {application.submittedAt
                              ? new Date(
                                  application.submittedAt
                                ).toLocaleDateString(
                                  "en-IN"
                                )
                              : "-"}
                          </p>

                        </td>

                        {/* Applicant */}

                        <td className="px-6 py-4">

                          <p className="font-medium text-gray-800">
                            {application.applicantId?.name ||
                              "Unknown"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {application.applicantId?.email ||
                              "No email"}
                          </p>

                        </td>

                        {/* Scheme */}

                        <td className="px-6 py-4">

                          <p className="font-medium text-gray-800">
                            {application.schemeId?.schemeName ||
                              "Unknown Scheme"}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {application.schemeId?.district ||
                              "-"}
                          </p>

                        </td>

                        {/* Income Category */}

                        <td className="px-6 py-4">

                          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                            {application.incomeCategory}
                          </span>

                        </td>

                        {/* Income */}

                        <td className="px-6 py-4 font-medium text-gray-700">

                          ₹
                          {Number(
                            application.annualIncome
                          ).toLocaleString("en-IN")}

                        </td>

                        {/* Status */}

                        <td className="px-6 py-4">

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(
                              application.status
                            )}`}
                          >
                            {application.status.replaceAll(
                              "_",
                              " "
                            )}
                          </span>

                        </td>

                        {/* Action */}

                        <td className="px-6 py-4">

                          <Link
                            to={`/officer/applications/${application._id}`}
                            className="text-blue-600 hover:text-blue-800 font-medium"
                          >
                            View
                          </Link>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}

export default OfficerApplications;