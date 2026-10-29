
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import API_BASE_URL from "../../api";

const API_URL = `${API_BASE_URL}/api`;

function OfficerAllotment() {
  const { schemeId, configurationId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [scheme, setScheme] = useState(null);
  const [configuration, setConfiguration] = useState(null);
  const [applicants, setApplicants] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submittingApplicantId, setSubmittingApplicantId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ======================================================
  // FORMATTERS
  // ======================================================

  const formatCurrency = (amount) =>
    `₹${Number(amount || 0).toLocaleString("en-IN")}`;

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

  // ======================================================
  // FETCH ELIGIBLE APPLICANTS
  // ======================================================

  const fetchApplicants = useCallback(async () => {
    if (!token) {
      throw new Error("Your session has expired. Please log in again.");
    }

    if (!schemeId || !configurationId) {
      throw new Error("Invalid scheme or configuration ID.");
    }

    const response = await fetch(
      `${API_URL}/allotments/configurations/${configurationId}/applicants`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Failed to fetch eligible applicants."
      );
    }

    setScheme(data.scheme || null);
    setConfiguration(data.configuration || null);
    setApplicants(
      Array.isArray(data.applicants) ? data.applicants : []
    );
  }, [token, schemeId, configurationId]);

  useEffect(() => {
    let active = true;

    const loadPage = async () => {
      setLoading(true);
      setError("");

      try {
        await fetchApplicants();
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load applicants.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPage();

    return () => {
      active = false;
    };
  }, [fetchApplicants]);

  // ======================================================
  // CREATE OFFER FOR THE SELECTED APPLICANT
  // ======================================================

  const handleAllot = async (applicantEntry) => {
    const applicantId = applicantEntry?.applicant?._id;

    if (!applicantId || !configurationId) {
      setError("Invalid applicant or configuration.");
      return;
    }

    if (Number(configuration?.availableUnits || 0) <= 0) {
      setError("No houses are available in this configuration.");
      return;
    }

    const applicantName = applicantEntry.applicant.name || "this applicant";

    const confirmed = window.confirm(
      `Create an allotment offer for ${applicantName}?\n\n` +
        `Priority score: ${applicantEntry.priorityScore?.totalScore ?? 0}/100\n` +
        `District waiting-list position: ${applicantEntry.districtPosition}`
    );

    if (!confirmed) {
      return;
    }

    setSubmittingApplicantId(applicantId);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${API_URL}/allotments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configurationId,
          applicantId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create the allotment offer."
        );
      }

      setSuccess(
        `Allotment offer created successfully for ${applicantName}.`
      );

      // Refresh available units and eligible applicants.
      try {
        await fetchApplicants();
      } catch (refreshError) {
        console.error("Applicant list refresh error:", refreshError);
      }
    } catch (err) {
      setError(err.message || "Unable to create the allotment offer.");
    } finally {
      setSubmittingApplicantId(null);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-gray-600">Loading eligible applicants...</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        {/* Back navigation */}

        <Link
          to={`/officer/schemes/${schemeId}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Scheme Details
        </Link>

        {/* Header */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Manual Housing Allotment</p>

          <h1 className="mt-1 text-2xl font-bold text-gray-800 sm:text-3xl">
            {scheme?.schemeName || "Housing Scheme"}
          </h1>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-blue-50 p-4">
              <p className="text-sm text-blue-700">District</p>
              <p className="mt-1 font-semibold text-gray-800">
                {configuration?.district || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-purple-50 p-4">
              <p className="text-sm text-purple-700">Housing Location</p>
              <p className="mt-1 font-semibold text-gray-800">
                {configuration?.location || "-"}
              </p>
            </div>

            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-700">Available Units</p>
              <p className="mt-1 text-xl font-bold text-green-700">
                {configuration?.availableUnits ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-green-700"
          >
            {success}
          </div>
        )}

        {/* Scoring information */}

        <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
          <h2 className="font-semibold text-blue-900">
            Priority Score — 100 Points
          </h2>

          <div className="mt-3 flex flex-wrap gap-3 text-sm text-blue-800">
            <span className="rounded-md bg-white px-3 py-2">
              Income: 40 points
            </span>
            <span className="rounded-md bg-white px-3 py-2">
              Family size: 30 points
            </span>
            <span className="rounded-md bg-white px-3 py-2">
              Housing situation: 30 points
            </span>
          </div>

          <p className="mt-3 text-sm text-blue-800">
            Applicants are displayed by priority score, highest first.
            The district waiting-list position remains unchanged.
            You decide which eligible applicant receives an offer.
          </p>
        </div>

        {/* Applicant list */}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Eligible Applicants
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {applicants.length} applicant
                {applicants.length === 1 ? "" : "s"} available for selection
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                setError("");
                setSuccess("");
                setLoading(true);

                try {
                  await fetchApplicants();
                } catch (err) {
                  setError(err.message || "Failed to refresh applicants.");
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded-lg border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
            >
              Refresh List
            </button>
          </div>

          {applicants.length === 0 ? (
            <div className="mt-6 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
              <h3 className="font-semibold text-gray-700">
                No eligible applicants available
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                There are currently no eligible applicants available for a
                new offer in this scheme and district.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-5">
              {applicants.map((entry, index) => {
                const applicant = entry.applicant || {};
                const application = entry.application || {};
                const score = entry.priorityScore || {};
                const isSubmitting =
                  submittingApplicantId === applicant._id;

                return (
                  <article
                    key={application._id || applicant._id}
                    className="overflow-hidden rounded-xl border border-gray-200"
                  >
                    {/* Applicant heading */}

                    <div className="flex flex-col gap-4 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                          {index + 1}
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-gray-800">
                            {applicant.name || "Applicant"}
                          </h3>

                          <p className="mt-1 text-sm text-gray-500">
                            Application No:{" "}
                            {application.applicationNumber || "-"}
                          </p>

                          <p className="mt-1 text-sm text-gray-500">
                            District waiting-list position:{" "}
                            <span className="font-semibold text-gray-800">
                              {entry.districtPosition ?? "-"}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-center">
                          <p className="text-xs text-green-700">
                            Priority Score
                          </p>
                          <p className="text-2xl font-bold text-green-700">
                            {Number(score.totalScore ?? 0).toFixed(2)}
                            <span className="text-sm font-medium">/100</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Applicant information */}

                    <div className="grid grid-cols-1 gap-5 p-4 sm:grid-cols-2 lg:grid-cols-3 sm:p-5">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Email
                        </p>
                        <p className="mt-1 break-words text-sm text-gray-800">
                          {applicant.email || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Phone
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {applicant.phone || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Annual Income
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {formatCurrency(application.annualIncome)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Family Members
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {application.familyMembers ?? "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Income Category
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {application.incomeCategory || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Employment Status
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {application.employmentStatus || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Occupation
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {application.occupation || "-"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Current Housing Situation
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {(application.housingStatus || "-").replaceAll(
                            "_",
                            " "
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                          Application Submitted
                        </p>
                        <p className="mt-1 text-sm text-gray-800">
                          {formatDate(application.submittedAt)}
                        </p>
                      </div>
                    </div>

                    {/* Score breakdown */}

                    <div className="border-t border-gray-100 p-4 sm:p-5">
                      <h4 className="text-sm font-semibold text-gray-700">
                        Priority Score Breakdown
                      </h4>

                      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg bg-blue-50 p-3">
                          <p className="text-sm text-blue-700">Income Score</p>
                          <p className="mt-1 text-lg font-bold text-blue-800">
                            {Number(score.incomeScore ?? 0).toFixed(2)}
                            <span className="text-sm font-normal">/40</span>
                          </p>
                        </div>

                        <div className="rounded-lg bg-purple-50 p-3">
                          <p className="text-sm text-purple-700">
                            Family Score
                          </p>
                          <p className="mt-1 text-lg font-bold text-purple-800">
                            {Number(score.familyScore ?? 0).toFixed(2)}
                            <span className="text-sm font-normal">/30</span>
                          </p>
                        </div>

                        <div className="rounded-lg bg-orange-50 p-3">
                          <p className="text-sm text-orange-700">
                            Housing Score
                          </p>
                          <p className="mt-1 text-lg font-bold text-orange-800">
                            {Number(score.housingScore ?? 0).toFixed(2)}
                            <span className="text-sm font-normal">/30</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Manual allotment action */}

                    <div className="flex flex-col gap-3 border-t border-gray-100 bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                      <p className="text-sm text-gray-600">
                        You are selecting this applicant manually.
                      </p>

                      <button
                        type="button"
                        onClick={() => handleAllot(entry)}
                        disabled={
                          Boolean(submittingApplicantId) ||
                          Number(configuration?.availableUnits || 0) <= 0
                        }
                        className="rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {isSubmitting ? "Creating Offer..." : "Allot"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer navigation */}

        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate(`/officer/schemes/${schemeId}`)}
            className="rounded-lg border border-gray-300 bg-white px-5 py-3 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Scheme Details
          </button>
        </div>
      </div>
    </div>
  );
}

export default OfficerAllotment;
