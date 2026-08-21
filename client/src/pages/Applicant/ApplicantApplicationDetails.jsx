import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function ApplicantApplicationDetails() {
  const { applicationId } = useParams();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/applications/${applicationId}`,
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
          setError(
            data.message || "Failed to load application details."
          );
          return;
        }

        setApplication(data.application);
      } catch (error) {
        console.error("Fetch application error:", error);

        setError(
          "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchApplication();
    } else {
      setError("Invalid application ID.");
      setLoading(false);
    }
  }, [applicationId]);

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

  const statusStyles = {
    SUBMITTED: "bg-yellow-100 text-yellow-700",
    ELIGIBLE: "bg-green-100 text-green-700",
    WAITING_LIST: "bg-purple-100 text-purple-700",
    ALLOTMENT_OFFERED: "bg-blue-100 text-blue-700",
    ACCEPTED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
    CANCELLED: "bg-gray-100 text-gray-600",
  };

  const statusLabels = {
    SUBMITTED: "Submitted",
    ELIGIBLE: "Eligible",
    WAITING_LIST: "Waiting List",
    ALLOTMENT_OFFERED: "Allotment Offered",
    ACCEPTED: "Accepted",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
  };

  const status =
    application.status || "SUBMITTED";

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">

      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link
          to="/applicant/applications"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to My Applications
        </Link>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>

              <p className="text-sm text-blue-600 font-medium">
                Housing Application
              </p>

              <h1 className="text-2xl font-bold text-gray-800 mt-1">
                {application.applicationNumber}
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

        {/* Scheme Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Housing Scheme
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Scheme Name
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.schemeName || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                District
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.district || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Location
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.location || "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme?.houseModel || "-"}
              </p>
            </div>

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

        {/* Applicant Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Application Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Family Members
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.familyMembers}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Annual Income
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {Number(
                  application.annualIncome
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Income Category
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.incomeCategory}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Employment Status
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {application.employmentStatus}
              </p>
            </div>

          </div>

        </div>

        {/* Submission Information */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-5">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Submission Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Application Number
              </p>

              <p className="font-mono text-sm text-gray-800 mt-1">
                {application.applicationNumber}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Submitted On
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.submittedAt
                  ? new Date(
                      application.submittedAt
                    ).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Verified On
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {application.verifiedAt
                  ? new Date(
                      application.verifiedAt
                    ).toLocaleString("en-IN")
                  : "Not verified yet"}
              </p>
            </div>

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