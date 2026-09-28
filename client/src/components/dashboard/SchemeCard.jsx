import { Link } from "react-router-dom";

function SchemeCard({
  name,
  category,
  schemeId,
  alreadyApplied = false,

  // Admin-entered scheme details
  maximumAnnualIncome,
  houseModel,
  price,
  description,
}) {
  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") {
      return "-";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      return value;
    }

    return `₹${number.toLocaleString("en-IN")}`;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 px-5 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800">
          {name || "Housing Scheme"}
        </h3>
      </div>

      {/* Details */}
      <div className="p-5">
        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
            {description}
          </p>
        )}

        <div className="grid grid-cols-2 gap-4">
          {/* Income Category */}
          <div>
            <p className="text-xs text-gray-500">
              Income Category
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {category || "Not specified"}
            </p>
          </div>

          {/* House Model */}
          <div>
            <p className="text-xs text-gray-500">
              House Model
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {houseModel || "Not specified"}
            </p>
          </div>

          {/* Maximum Annual Income */}
          <div>
            <p className="text-xs text-gray-500">
              Maximum Annual Income
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {formatAmount(maximumAnnualIncome)}
            </p>
          </div>

          {/* House Price */}
          <div>
            <p className="text-xs text-gray-500">
              House Price
            </p>

            <p className="font-semibold text-gray-800 mt-1">
              {formatAmount(price)}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          {/* View Details */}
          {schemeId ? (
            <Link
              to={`/applicant/schemes/${schemeId}`}
              className="flex-1 text-center border border-blue-600 text-blue-600 py-2 rounded-lg text-sm font-medium hover:bg-blue-50 transition"
            >
              View Details
            </Link>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 border border-gray-300 text-gray-400 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              View Details
            </button>
          )}

          {/* Apply */}
          {alreadyApplied ? (
            <button
              type="button"
              disabled
              className="flex-1 bg-green-100 text-green-700 py-2 rounded-lg text-sm font-medium cursor-not-allowed"
            >
              ✓ Already Applied
            </button>
          ) : schemeId ? (
            <Link
              to={`/applicant/apply/${schemeId}`}
              className="flex-1 text-center bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
            >
              Apply Now
            </Link>
          ) : (
            <button
              type="button"
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