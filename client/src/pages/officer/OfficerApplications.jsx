import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OfficerApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

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

        setError(
          "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
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
                Total Applications
              </p>

              <p className="text-2xl font-bold text-blue-600">
                {applications.length}
              </p>
            </div>

          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && applications.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No applications found
            </h2>

            <p className="text-gray-500 mt-2">
              Applications submitted for your housing schemes will appear here.
            </p>

          </div>
        )}

        {/* Applications */}
        {applications.length > 0 && (
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

                  {applications.map((application) => (

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
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString("en-IN")}
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
                          {application.schemeId?.district}
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

                  ))}

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