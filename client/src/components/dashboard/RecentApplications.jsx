import { Link } from "react-router-dom";
import { FaEye } from "react-icons/fa";

function RecentApplications({ applications = [] }) {
  // ==========================================
  // APPLICATION STATUS STYLES
  // ==========================================

  const statusStyles = {
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    UNDER_VERIFICATION: "bg-blue-100 text-blue-700",
    ELIGIBLE: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    WITHDRAWN: "bg-gray-100 text-gray-600",
  };

  // ==========================================
  // APPLICATION STATUS LABELS
  // ==========================================

  const statusLabels = {
    SUBMITTED: "Submitted",
    UNDER_VERIFICATION: "Under Verification",
    ELIGIBLE: "Eligible",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
  };

  // ==========================================
  // SHOW LATEST 5 APPLICATIONS
  // ==========================================

  const recentApplications = applications.slice(0, 5);

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
  // RENDER
  // ==========================================

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">
      {/* HEADER */}

      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Applications
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Overview of your recently submitted applications.
          </p>
        </div>

        <Link
          to="/applicant/applications"
          className="text-sm text-blue-600 font-medium hover:text-blue-800"
        >
          View All
        </Link>
      </div>

      {/* EMPTY STATE */}

      {recentApplications.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-gray-500">
            You have not submitted any housing applications yet.
          </p>

          <Link
            to="/applicant/schemes"
            className="inline-block mt-4 text-sm text-blue-600 font-medium hover:text-blue-800"
          >
            Explore Housing Schemes →
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="text-left px-6 py-3 font-medium">
                  Application ID
                </th>

                <th className="text-left px-6 py-3 font-medium">
                  Housing Scheme
                </th>

                <th className="text-left px-6 py-3 font-medium">
                  Submitted
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
              {recentApplications.map((application) => {
                const applicationId =
                  application.applicationNumber ||
                  application._id;

                const schemeName =
                  application.schemeId?.schemeName ||
                  "Housing Scheme";

                const submittedDate =
                  application.submittedAt ||
                  application.createdAt;

                const status =
                  application.status || "SUBMITTED";

                const statusLabel =
                  statusLabels[status] || status;

                return (
                  <tr
                    key={
                      application._id ||
                      application.applicationNumber
                    }
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >
                    {/* APPLICATION ID */}

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {applicationId}
                    </td>

                    {/* HOUSING SCHEME */}

                    <td className="px-6 py-4 text-gray-600">
                      {schemeName}
                    </td>

                    {/* SUBMITTED DATE */}

                    <td className="px-6 py-4 text-gray-600">
                      {formatDate(submittedDate)}
                    </td>

                    {/* STATUS */}

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusStyles[status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabel}
                      </span>
                    </td>

                    {/* ACTION */}

                    <td className="px-6 py-4">
                      <Link
                        to={`/applicant/applications/${application._id}`}
                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <FaEye />
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
  );
}

export default RecentApplications;