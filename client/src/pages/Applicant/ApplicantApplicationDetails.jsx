import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMyApplicationById } from "../../services/applicationService";

function ApplicantApplicationDetails() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          setError("Your session has expired. Please login again.");
          return;
        }

        if (!applicationId) {
          setError("Invalid application ID.");
          return;
        }

        const data = await getMyApplicationById(
          token,
          applicationId
        );

        if (!data) {
          setError("Application not found.");
          return;
        }

        setApplication(data);
      } catch (error) {
        console.error("Fetch application error:", error);

        setError(
          error.message ||
            "Unable to load application details. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId]);

  // ==========================================
  // FORMAT DATE
  // ==========================================

  const formatDate = (date, includeTime = false) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      ...(includeTime
        ? {
            hour: "2-digit",
            minute: "2-digit",
          }
        : {}),
    });
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">
            Loading application details...
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
        <div className="max-w-4xl mx-auto">

          <Link
            to="/applicant/applications"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to My Applications
          </Link>

          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
            {error}
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // APPLICATION NOT FOUND
  // ==========================================

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto">

          <Link
            to="/applicant/applications"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to My Applications
          </Link>

          <div className="mt-6 bg-white border border-gray-200 rounded-xl p-6">
            <p className="text-gray-600">
              Application not found.
            </p>
          </div>

        </div>
      </div>
    );
  }

  const scheme = application.schemeId;

  // ==========================================
  // APPLICATION STATUS
  // ==========================================

  const statusStyles = {
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    UNDER_VERIFICATION: "bg-blue-100 text-blue-700",
    ELIGIBLE: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    WITHDRAWN: "bg-gray-100 text-gray-600",
  };

  const statusLabels = {
    SUBMITTED: "Submitted",
    UNDER_VERIFICATION: "Under Verification",
    ELIGIBLE: "Eligible",
    REJECTED: "Rejected",
    WITHDRAWN: "Withdrawn",
  };

  const status = application.status || "SUBMITTED";

  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* BACK */}

        <Link
          to="/applicant/applications"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to My Applications
        </Link>

        {/* HEADER */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>

              <p className="text-sm text-blue-600 font-medium">
                Housing Application
              </p>

              <h1 className="text-2xl font-bold text-gray-800 mt-1">
                {application.applicationNumber || "-"}
              </h1>

              <p className="text-gray-500 mt-2">
                Application details and verification status
              </p>

            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                statusStyles[status] ||
                "bg-gray-100 text-gray-600"
              }`}
            >
              {statusLabels[status] || status}
            </span>

          </div>

        </div>

        {/* ==========================================
            HOUSING SCHEME
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Housing Scheme
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Scheme Name */}

            <div>
              <p className="text-sm text-gray-500">
                Scheme Name
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.schemeName || "-"}
              </p>
            </div>

            {/* District */}

            <div>
              <p className="text-sm text-gray-500">
                District
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.district || "-"}
              </p>
            </div>

            {/* House Model */}

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.houseModel || "-"}
              </p>
            </div>

            {/* Price */}

            <div>
              <p className="text-sm text-gray-500">
                House Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.price !== undefined
                  ? `₹${Number(
                      scheme.price
                    ).toLocaleString("en-IN")}`
                  : "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            PERSONAL INFORMATION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Personal Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Aadhaar */}

            <div>
              <p className="text-sm text-gray-500">
                Aadhaar Number
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.aadhaarNumber || "-"}
              </p>
            </div>

            {/* Date of Birth */}

            <div>
              <p className="text-sm text-gray-500">
                Date of Birth
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {formatDate(application.dateOfBirth)}
              </p>
            </div>

            {/* Gender */}

            <div>
              <p className="text-sm text-gray-500">
                Gender
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.gender || "-"}
              </p>
            </div>

            {/* Mobile */}

            <div>
              <p className="text-sm text-gray-500">
                Mobile Number
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.mobileNumber || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            ADDRESS INFORMATION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Address Information
          </h2>

          <div className="space-y-5">

            {/* Address */}

            <div>
              <p className="text-sm text-gray-500">
                Address
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.address || "-"}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">

              {/* District */}

              <div>
                <p className="text-sm text-gray-500">
                  District
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {application.district || "-"}
                </p>
              </div>

              {/* State */}

              <div>
                <p className="text-sm text-gray-500">
                  State
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {application.state || "-"}
                </p>
              </div>

              {/* PIN */}

              <div>
                <p className="text-sm text-gray-500">
                  PIN Code
                </p>

                <p className="font-semibold text-gray-800 mt-1">
                  {application.pinCode || "-"}
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ==========================================
            FAMILY / INCOME
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Family & Income Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Family Members */}

            <div>
              <p className="text-sm text-gray-500">
                Family Members
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.familyMembers ?? "-"}
              </p>
            </div>

            {/* Annual Income */}

            <div>
              <p className="text-sm text-gray-500">
                Annual Income
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.annualIncome !== undefined
                  ? `₹${Number(
                      application.annualIncome
                    ).toLocaleString("en-IN")}`
                  : "-"}
              </p>
            </div>

            {/* Income Category */}

            <div>
              <p className="text-sm text-gray-500">
                Income Category
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.incomeCategory || "-"}
              </p>
            </div>

            {/* Employment */}

            <div>
              <p className="text-sm text-gray-500">
                Employment Status
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.employmentStatus || "-"}
              </p>
            </div>

            {/* Occupation */}

            <div>
              <p className="text-sm text-gray-500">
                Occupation
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.occupation || "-"}
              </p>
            </div>

          </div>

        </div>

        {/* ==========================================
            DOCUMENTS
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Supporting Documents
          </h2>

          <div className="space-y-4">

            {/* Income Certificate */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-lg p-4">

              <div>
                <p className="font-medium text-gray-800">
                  Income Certificate
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Submitted document
                </p>
              </div>

              {application.incomeCertificateUrl ? (
                <a
                  href={application.incomeCertificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not provided
                </span>
              )}

            </div>

            {/* Aadhaar Document */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-lg p-4">

              <div>
                <p className="font-medium text-gray-800">
                  Aadhaar Document
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Submitted document
                </p>
              </div>

              {application.aadhaarDocumentUrl ? (
                <a
                  href={application.aadhaarDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not provided
                </span>
              )}

            </div>

            {/* Address Proof */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border border-gray-100 rounded-lg p-4">

              <div>
                <p className="font-medium text-gray-800">
                  Address Proof
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Submitted document
                </p>
              </div>

              {application.addressProofUrl ? (
                <a
                  href={application.addressProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                >
                  View Document
                </a>
              ) : (
                <span className="text-sm text-gray-400">
                  Not provided
                </span>
              )}

            </div>

          </div>

        </div>

        {/* ==========================================
            SUBMISSION / VERIFICATION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Submission & Verification
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Application Number */}

            <div>
              <p className="text-sm text-gray-500">
                Application Number
              </p>

              <p className="font-mono text-sm text-gray-800 mt-1">
                {application.applicationNumber || "-"}
              </p>
            </div>

            {/* Submitted */}

            <div>
              <p className="text-sm text-gray-500">
                Submitted On
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {formatDate(application.submittedAt, true)}
              </p>
            </div>

            {/* Verified */}

            <div>
              <p className="text-sm text-gray-500">
                Verified On
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.verifiedAt
                  ? formatDate(application.verifiedAt, true)
                  : "Not verified yet"}
              </p>
            </div>

            {/* Verification Remarks */}

            <div>
              <p className="text-sm text-gray-500">
                Verification Remarks
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.verificationRemarks ||
                  "No remarks available"}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default ApplicantApplicationDetails;