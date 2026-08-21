import { Link } from "react-router-dom";

function SchemeCard({
  name,
  location,
  units = 0,
  deadline,
  category,
  schemeId,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">

      {/* Top Section */}
      <div className="bg-blue-50 px-5 py-4 border-b border-gray-100">

        <h3 className="text-lg font-semibold text-gray-800">
          {name || "Housing Scheme"}
        </h3>

        <p className="text-sm text-gray-500 mt-1">
          {location || "Location not available"}
        </p>

      </div>


      {/* Details */}
      <div className="p-5">

        <div className="grid grid-cols-2 gap-4">

          {/* Available Units */}
          <div>

            <p className="text-xs text-gray-500">
              Available Units
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {units}
            </p>

          </div>


          {/* Income Category */}
          <div>

            <p className="text-xs text-gray-500">
              Income Category
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {category || "Not specified"}
            </p>

          </div>


          {/* Application Deadline */}
          <div className="col-span-2">

            <p className="text-xs text-gray-500">
              Application Deadline
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {deadline || "-"}
            </p>

          </div>

        </div>


        {/* Actions */}
        <div className="mt-6 flex gap-3">

          {/* View Details */}

          {schemeId ? (
            <Link
              to={`/applicant/scheme/${schemeId}`}
              className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
            >
              View Details
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 border border-gray-300 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              View Details
            </button>
          )}


          {/* Apply */}

          {schemeId ? (
            <Link
              to={`/applicant/apply/${schemeId}`}
              className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Apply Now
            </Link>
          ) : (
            <button
              disabled
              className="flex-1 bg-gray-300 text-gray-500 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              Apply Now
            </button>
          )}

        </div>

      </div>

    </div>
  );
}

export default SchemeCard;