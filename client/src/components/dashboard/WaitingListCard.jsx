import { FaClock } from "react-icons/fa";

function WaitingListCard({
  schemeName,
  position,
  totalApplicants,
  status,
  lastUpdated,
}) {
  const statusStyles = {
    Active: "bg-blue-100 text-blue-700",
    Selected: "bg-green-100 text-green-700",
    "On Hold": "bg-yellow-100 text-yellow-700",
    Removed: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FaClock />
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Waiting List
            </p>

            <h3 className="text-lg font-semibold text-gray-800">
              {schemeName}
            </h3>
          </div>

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

      {/* Position */}
      <div className="mt-7 bg-gray-50 rounded-lg p-5 text-center">

        <p className="text-sm text-gray-500">
          Your Current Position
        </p>

        <p className="text-4xl font-bold text-blue-600 mt-2">
          #{position}
        </p>

        <p className="text-sm text-gray-500 mt-2">
          out of {totalApplicants} applicants
        </p>

      </div>

      {/* Details */}
      <div className="flex justify-between items-center mt-5 text-sm">

        <div>
          <p className="text-gray-500">
            Last Updated
          </p>

          <p className="font-medium text-gray-800 mt-1">
            {lastUpdated}
          </p>
        </div>

        <button className="text-blue-600 font-medium hover:text-blue-800">
          View Details →
        </button>

      </div>

    </div>
  );
}

export default WaitingListCard;