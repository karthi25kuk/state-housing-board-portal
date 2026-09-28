import { Link } from "react-router-dom";
import { FaClock, FaEye } from "react-icons/fa";

function WaitingListCard({
  schemeName,
  position,
  status,
  district,
  lastUpdated,
  applicationId,
  removalReason,
}) {
  const statusStyles = {
    ACTIVE: "bg-blue-100 text-blue-700",
    REMOVED: "bg-red-100 text-red-700",
  };

  const statusLabels = {
    ACTIVE: "Active",
    REMOVED: "Removed",
  };

  const removalReasonLabels = {
    ALLOTMENT_ACCEPTED: "Allotment Accepted",
    ALLOTMENT_REJECTED: "Allotment Rejected",
    ALLOTTED_FROM_OTHER_SCHEME: "Allotted From Other Scheme",
    APPLICATION_REJECTED: "Application Rejected",
    APPLICATION_WITHDRAWN: "Application Withdrawn",
  };

  const hasPosition =
    position !== undefined &&
    position !== null &&
    Number(position) > 0;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FaClock />
          </div>

          <div>
            <p className="text-sm text-gray-500">Waiting List</p>

            <h3 className="text-lg font-semibold text-gray-800">
              {schemeName || "Housing Scheme"}
            </h3>

            {district && (
              <p className="text-sm text-gray-500 mt-1">
                District: {district}
              </p>
            )}
          </div>
        </div>

        {/* Status */}
        {status && (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusStyles[status] || "bg-gray-100 text-gray-600"
            }`}
          >
            {statusLabels[status] || status}
          </span>
        )}
      </div>

      {/* Active Waiting List */}
      {status === "ACTIVE" && hasPosition ? (
        <>
          <div className="mt-7 bg-gray-50 rounded-lg p-5 text-center">
            <p className="text-sm text-gray-500">
              Your District Position
            </p>

            <p className="text-4xl font-bold text-blue-600 mt-2">
              #{position}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              District-wise waiting list position
            </p>
          </div>

          {/* Details */}
          <div className="flex justify-between items-center mt-5 text-sm">
            <div>
              <p className="text-gray-500">Last Updated</p>

              <p className="font-medium text-gray-800 mt-1">
                {lastUpdated || "-"}
              </p>
            </div>

            <Link
              to="/applicant/waiting-list"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaEye />
              View Details
            </Link>
          </div>
        </>
      ) : status === "REMOVED" ? (
        <>
          {/* Removed Waiting List */}
          <div className="mt-7 bg-red-50 rounded-lg p-5">
            <p className="text-sm font-medium text-red-700">
              Waiting List Entry Removed
            </p>

            <p className="text-sm text-gray-600 mt-2">
              {removalReasonLabels[removalReason] ||
                "This waiting list entry is no longer active."}
            </p>
          </div>

          {/* Details */}
          <div className="flex justify-between items-center mt-5 text-sm">
            <div>
              <p className="text-gray-500">Last Updated</p>

              <p className="font-medium text-gray-800 mt-1">
                {lastUpdated || "-"}
              </p>
            </div>

            <Link
              to="/applicant/waiting-list"
              className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
            >
              <FaEye />
              View Details
            </Link>
          </div>
        </>
      ) : (
        /* No Active Waiting List */
        <div className="mt-7 bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500 text-sm">
            You are not currently on an active waiting list.
          </p>

          <Link
            to="/applicant/waiting-list"
            className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            <FaEye />
            View Waiting List
          </Link>
        </div>
      )}

      {/* Application Reference */}
      {applicationId && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Application ID
          </p>

          <p className="text-sm font-medium text-gray-700 mt-1">
            {applicationId}
          </p>
        </div>
      )}
    </div>
  );
}

export default WaitingListCard;