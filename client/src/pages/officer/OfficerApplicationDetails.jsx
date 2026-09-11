import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OfficerApplicationDetails() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  // ==========================================
  // FETCH APPLICATION
  // ==========================================

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError(
            "Your session has expired. Please login again."
          );
          return;
        }

        if (!applicationId) {
          setError("Invalid application ID.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/officer/applications/${applicationId}`,
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
            data.message || "Failed to load application."
          );
        }

        if (!data.application) {
          throw new Error(
            "Application data was not returned by the server."
          );
        }

        setApplication(data.application);

        setRemarks(
          data.application.verificationRemarks || ""
        );
      } catch (error) {
        console.error(
          "Fetch officer application error:",
          error
        );

        setError(
          error.message ||
            "Unable to connect to the server."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "SUBMITTED":
        return "bg-blue-100 text-blue-700";

      case "UNDER_VERIFICATION":
        return "bg-yellow-100 text-yellow-700";

      case "ELIGIBLE":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "WITHDRAWN":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const formatStatus = (status) => {
    if (!status) return "-";

    return status
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  // ==========================================
  // DATE FORMATTER
  // ==========================================

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

  // ==========================================
  // VERIFY APPLICATION
  // ==========================================

  const handleVerification = async (status) => {
    setActionMessage("");
    setActionError("");

    if (
      status === "REJECTED" &&
      !remarks.trim()
    ) {
      setActionError(
        "Please provide verification remarks before rejecting this application."
      );
      return;
    }

    const confirmationMessage =
      status === "ELIGIBLE"
        ? "Are you sure you want to approve this application?"
        : "Are you sure you want to reject this application?";

    const confirmed = window.confirm(
      confirmationMessage
    );

    if (!confirmed) {
      return;
    }

    try {
      setSubmitting(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setActionError(
          "Your session has expired. Please login again."
        );
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/officer/applications/${applicationId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status,
            verificationRemarks: remarks.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to verify application."
        );
      }

      setApplication(data.application);

      setRemarks(
        data.application?.verificationRemarks || ""
      );

      setActionMessage(
        data.message ||
          "Application verification completed successfully."
      );
    } catch (error) {
      console.error(
        "Verify application error:",
        error
      );

      setActionError(
        error.message ||
          "Unable to connect to the server."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/officer/applications"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Applications
          </Link>

          <div className="bg-white border border-gray-200 rounded-xl p-8 mt-5 shadow-sm">
            <p className="text-gray-600">
              Loading application...
            </p>
          </div>
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
        <div className="max-w-5xl mx-auto">
          <Link
            to="/officer/applications"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Applications
          </Link>

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 mt-5">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  // ==========================================
  // VERIFICATION STATE
  // ==========================================

  const alreadyVerified =
    application.status === "ELIGIBLE" ||
    application.status === "REJECTED";

  const scheme = application.schemeId || {};

  const districtConfiguration =
    Array.isArray(scheme.configurations)
      ? scheme.configurations.find(
          (configuration) =>
            configuration.district?.trim().toLowerCase() ===
            application.district?.trim().toLowerCase()
        )
      : null;

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* ======================================
            BACK
        ====================================== */}

        <Link
          to="/officer/applications"
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          &larr; Back to Applications
        </Link>

        {/* ======================================
            HEADER
        ====================================== */}

        <div className="mt-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Application Details
              </h1>

              <p className="text-gray-500 mt-1">
                Review the applicant's submitted
                information and verify eligibility.
              </p>
            </div>

            <span
              className={`inline-block self-start px-4 py-2 rounded-full text-sm font-semibold ${getStatusStyle(
                application.status
              )}`}
            >
              {formatStatus(application.status)}
            </span>
          </div>
        </div>

        {/* ======================================
            SUCCESS
        ====================================== */}

        {actionMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-4 mb-6">
            {actionMessage}
          </div>
        )}

        {/* ======================================
            ACTION ERROR
        ====================================== */}

        {actionError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
            {actionError}
          </div>
        )}

        {/* ======================================
            APPLICATION INFORMATION
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Application Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500">
                Application Number
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.applicationNumber ||
                  application._id}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Submitted Date
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatDate(application.submittedAt)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                District
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.district || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Current Status
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatStatus(application.status)}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            APPLICANT DETAILS
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Applicant Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-xs text-gray-500">
                Full Name
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.applicantId?.name || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Email
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.applicantId?.email || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Aadhaar Number
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.aadhaarNumber || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Mobile Number
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.mobileNumber ||
                  application.applicantId?.phone ||
                  "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Date of Birth
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatDate(application.dateOfBirth)}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Gender
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.gender || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            ADDRESS
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Address Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div className="md:col-span-2">
              <p className="text-xs text-gray-500">
                Address
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.address || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                District
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.district || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                State
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.state || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                PIN Code
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.pinCode || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            FAMILY & INCOME
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Family & Income Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-xs text-gray-500">
                Family Members
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.familyMembers ?? "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Annual Income
              </p>

              <p className="font-medium text-gray-800 mt-1">
                ₹
                {Number(
                  application.annualIncome || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Income Category
              </p>

              <p className="mt-1">
                <span className="inline-block px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">
                  {application.incomeCategory || "-"}
                </span>
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Employment Status
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatStatus(
                  application.employmentStatus
                )}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Occupation
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.occupation || "-"}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            HOUSING SCHEME
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Housing Scheme
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
            <div>
              <p className="text-xs text-gray-500">
                Scheme Name
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {scheme.schemeName || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Application District
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.district || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Housing Location
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {districtConfiguration?.location ||
                  "Not configured"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                House Model
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {scheme.houseModel || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                House Price
              </p>

              <p className="font-medium text-gray-800 mt-1">
                ₹
                {Number(
                  scheme.price || 0
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Allotment Date
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatDate(
                  districtConfiguration?.allotmentDate
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================
            DOCUMENTS
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-5">
            Submitted Documents
          </h2>

          <div className="space-y-4">
            {/* Income Certificate */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-800">
                  Income Certificate
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Submitted income proof
                </p>
              </div>

              {application.incomeCertificateUrl ? (
                <a
                  href={
                    application.incomeCertificateUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not available
                </span>
              )}
            </div>

            {/* Aadhaar */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-800">
                  Aadhaar Document
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Applicant identity proof
                </p>
              </div>

              {application.aadhaarDocumentUrl ? (
                <a
                  href={
                    application.aadhaarDocumentUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not available
                </span>
              )}
            </div>

            {/* Address Proof */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-200 rounded-lg p-4">
              <div>
                <p className="font-medium text-gray-800">
                  Address Proof
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Applicant address proof
                </p>
              </div>

              {application.addressProofUrl ? (
                <a
                  href={
                    application.addressProofUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not available
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ======================================
            VERIFICATION
        ====================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Application Verification
          </h2>

          <p className="text-gray-500 text-sm mb-5">
            Review the submitted information and
            documents before making a decision.
          </p>

          {alreadyVerified ? (
            <div>
              <div
                className={`rounded-lg p-4 ${
                  application.status === "ELIGIBLE"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p className="font-semibold text-gray-800">
                  Application already verified
                </p>

                <p className="text-sm text-gray-600 mt-1">
                  Status:{" "}
                  {formatStatus(application.status)}
                </p>

                {application.verifiedAt && (
                  <p className="text-sm text-gray-600 mt-1">
                    Verified on:{" "}
                    {formatDate(
                      application.verifiedAt
                    )}
                  </p>
                )}
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-gray-700">
                  Officer Feedback
                </p>

                <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-4 text-gray-700">
                  {application.verificationRemarks ||
                    "No feedback provided."}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Verification Remarks
              </label>

              <textarea
                value={remarks}
                onChange={(event) =>
                  setRemarks(event.target.value)
                }
                rows={5}
                placeholder="Enter verification remarks..."
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={submitting}
              />

              <p className="text-xs text-gray-500 mt-2">
                Remarks are mandatory when rejecting
                an application.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    handleVerification("ELIGIBLE")
                  }
                  disabled={submitting}
                  className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting
                    ? "Processing..."
                    : "Approve Application"}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleVerification("REJECTED")
                  }
                  disabled={submitting}
                  className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {submitting
                    ? "Processing..."
                    : "Reject Application"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OfficerApplicationDetails;