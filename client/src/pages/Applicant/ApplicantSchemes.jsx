import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "../../components/dashboard/SchemeCard";
import { getOpenSchemes } from "../../services/schemeService";

function ApplicantSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const data = await getOpenSchemes(token);

        setSchemes(data || []);
      } catch (error) {
        console.error("Fetch schemes error:", error);
        setError(
          error.message || "Unable to load housing schemes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchemes();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">
            Loading available housing schemes...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">

          <Link
            to="/dashboard"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Dashboard
          </Link>

          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-5 rounded-xl">
            {error}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* ==================================
            HEADER
        ================================== */}

        <div className="mb-8">

          <Link
            to="/applicant"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mt-3">
            Housing Schemes
          </h1>

          <p className="text-gray-500 mt-2">
            View housing schemes currently open for applications.
          </p>

        </div>


        {/* ==================================
            EMPTY STATE
        ================================== */}

        {schemes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No Open Schemes
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no housing schemes open for applications.
            </p>

          </div>
        )}


        {/* ==================================
            SCHEME CARDS
        ================================== */}

        {schemes.length > 0 && (
          <>
            <div className="mb-5">
              <p className="text-sm text-gray-500">
                {schemes.length}{" "}
                {schemes.length === 1 ? "scheme" : "schemes"} available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {schemes.map((scheme) => (
                <SchemeCard
                  key={scheme._id}
                  name={scheme.schemeName}
                  location={`${scheme.location}, ${scheme.district}`}
                  units={scheme.availableUnits}
                  deadline={
                    scheme.applicationEndDate
                      ? new Date(
                          scheme.applicationEndDate
                        ).toLocaleDateString("en-IN")
                      : "-"
                  }
                  category={
                    scheme.eligibleIncomeCategories?.length > 0
                      ? scheme.eligibleIncomeCategories.join(", ")
                      : "Not specified"
                  }
                  schemeId={scheme._id}
                />
              ))}

            </div>
          </>
        )}

      </div>

    </div>
  );
}

export default ApplicantSchemes;