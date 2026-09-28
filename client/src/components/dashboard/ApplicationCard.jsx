import { Link } from "react-router-dom";

function ApplicationCard({
  schemeName,
  applicationId,
  submittedDate,
  status,
  applicationMongoId,
}) {
  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    "Under Verification": "bg-blue-100 text-blue-700",
    Eligible: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
    Withdrawn: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* HEADER */}

      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-gray-500">
            Current Application
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-1 truncate">
            {schemeName || "Housing Scheme"}
          </h3>
        </div>

        {/* STATUS */}

        <span
          className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            statusStyles[status] ||
            "bg-gray-100 text-gray-600"
          }`}
        >
          {status || "Unknown"}
        </span>
      </div>

      {/* APPLICATION DETAILS */}

      <div className="grid sm:grid-cols-2 gap-4 mt-6">
        <div>
          <p className="text-sm text-gray-500">
            Application ID
          </p>

          <p className="font-medium text-gray-800 mt-1 break-all">
            {applicationId || "-"}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Submitted On
          </p>

          <p className="font-medium text-gray-800 mt-1">
            {submittedDate || "-"}
          </p>
        </div>
      </div>

      {/* ACTION */}

      <div className="border-t border-gray-100 mt-6 pt-4">
        {applicationMongoId ? (
          <Link
            to={`/applicant/applications/${applicationMongoId}`}
            className="text-blue-600 font-medium text-sm hover:text-blue-800 transition"
          >
            View Application →
          </Link>
        ) : (
          <span className="text-gray-400 text-sm">
            Application details unavailable
          </span>
        )}
      </div>
    </div>
  );
}

export default ApplicationCard;