import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import SchemeCard from "../../components/dashboard/SchemeCard";
import { getOpenSchemes } from "../../services/schemeService";
import { getMyApplications } from "../../services/applicationService";

function ApplicantSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH DATA
  // ==========================================

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        // ==========================================
        // FETCH ALL COMMON SCHEMES + MY APPLICATIONS
        // ==========================================

        const [schemesData, applicationsData] = await Promise.all([
          getOpenSchemes(token),
          getMyApplications(token),
        ]);

        setSchemes(schemesData || []);
        setApplications(applicationsData || []);
      } catch (error) {
        console.error("Fetch housing schemes error:", error);

        setError(
          error.message || "Unable to load housing schemes."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ==========================================
  // CHECK WHETHER APPLICANT ALREADY APPLIED
  // ==========================================

  const hasApplied = (schemeId) => {
    return applications.some((application) => {
      const appliedSchemeId =
        application.schemeId?._id ||
        application.schemeId ||
        application.scheme?._id ||
        application.scheme?.id;

      return String(appliedSchemeId) === String(schemeId);
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">
            Loading housing schemes...
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
            to="/applicant"
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

        {/* ==========================================
            HEADER
        ========================================== */}

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
            View and apply for housing schemes created by the
            State Housing Board.
          </p>

          {schemes.length > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              Showing {schemes.length}{" "}
              {schemes.length === 1 ? "scheme" : "schemes"}.
            </p>
          )}
        </div>

        {/* ==========================================
            EMPTY STATE
        ========================================== */}

        {schemes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No Housing Schemes Available
            </h2>

            <p className="text-gray-500 mt-2">
              There are currently no housing schemes created
              by the State Housing Board.
            </p>
          </div>
        )}

        {/* ==========================================
            SCHEME CARDS
        ========================================== */}

        {schemes.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {schemes.map((scheme) => {
              return (
                <SchemeCard
                  key={scheme._id}
                  name={scheme.schemeName}
                  category={
                    scheme.eligibleIncomeCategories?.length > 0
                      ? scheme.eligibleIncomeCategories.join(", ")
                      : "Not specified"
                  }

                  schemeId={scheme._id}

                  alreadyApplied={hasApplied(scheme._id)}
                  maximumAnnualIncome={
                    scheme.maximumAnnualIncome
                  }

                  houseModel={scheme.houseModel}

                  price={scheme.price}

                  description={scheme.description}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantSchemes;