function ApplicationCard({
  schemeName,
  applicationId,
  submittedDate,
  status,
}) {
  const statusStyles = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "Under Verification": "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div>
          <p className="text-sm text-gray-500">
            Current Application
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mt-1">
            {schemeName}
          </h3>
        </div>

        {/* Status */}
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            statusStyles[status] || "bg-gray-100 text-gray-600"
          }`}
        >
          {status}
        </span>

      </div>

      {/* Application Details */}
      <div className="grid sm:grid-cols-2 gap-4 mt-6">

        <div>
          <p className="text-sm text-gray-500">
            Application ID
          </p>

          <p className="font-medium text-gray-800 mt-1">
            {applicationId}
          </p>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Submitted On
          </p>

          <p className="font-medium text-gray-800 mt-1">
            {submittedDate}
          </p>
        </div>

      </div>

      {/* Action */}
      <div className="border-t border-gray-100 mt-6 pt-4">

        <button
          className="text-blue-600 font-medium text-sm hover:text-blue-800 transition"
        >
          View Application →
        </button>

      </div>

    </div>
  );
}

export default ApplicationCard;