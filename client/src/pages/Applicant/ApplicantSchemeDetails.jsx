import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSchemeById } from "../../services/schemeService";

function ApplicantSchemeDetails() {
  const { schemeId } = useParams();
  const navigate = useNavigate();
  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token || !schemeId) {
          throw new Error("Unable to load housing scheme details.");
        }

        setScheme(await getSchemeById(token, schemeId));
      } catch (fetchError) {
        setError(
          fetchError.message ||
            "Unable to load housing scheme details."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  const formatAmount = (value) => {
    if (value === undefined || value === null) {
      return "-";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <p className="max-w-4xl mx-auto text-gray-600">
          Loading scheme details...
        </p>
      </div>
    );
  }

  if (error || !scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/applicant/schemes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Housing Schemes
          </Link>
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-6">
            {error || "Housing scheme not found."}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/applicant/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Housing Schemes
        </Link>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8 mt-5">
          <p className="text-sm text-blue-600 font-medium">
            Housing Scheme
          </p>
          <h1 className="text-3xl font-bold text-gray-800 mt-1">
            {scheme.schemeName}
          </h1>
          <p className="text-gray-600 mt-4 leading-relaxed">
            {scheme.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
            <div>
              <p className="text-sm text-gray-500">
                Eligible Income Categories
              </p>
              <p className="font-semibold text-gray-800 mt-1">
                {scheme.eligibleIncomeCategories?.join(", ") || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                Maximum Annual Income
              </p>
              <p className="font-semibold text-gray-800 mt-1">
                {formatAmount(scheme.maximumAnnualIncome)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">House Model</p>
              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel || "-"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="font-semibold text-gray-800 mt-1">
                {formatAmount(scheme.price)}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-8">
            <button
              type="button"
              onClick={() => navigate(`/applicant/apply/${scheme._id}`)}
              className="bg-blue-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Apply Now
            </button>
            <Link
              to="/applicant/schemes"
              className="border border-gray-300 text-gray-700 px-5 py-3 rounded-lg font-medium text-center hover:bg-gray-50 transition"
            >
              Back to Schemes
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ApplicantSchemeDetails;
