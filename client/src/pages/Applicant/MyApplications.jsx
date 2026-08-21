import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/applications/my",
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
            data.message || "Failed to fetch your applications."
          );
          return;
        }

        setApplications(data.applications || []);
      } catch (error) {
        console.error("Fetch applications error:", error);

        setError(
          "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-gray-600">
            Loading your applications...
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
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 rounded-xl p-5">
            {error}
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">

      <div className="max-w-6xl mx-auto">

        {/* =====================================
            HEADER
        ===================================== */}

        <div className="mb-6">

          <Link
            to="/applicant"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="mt-5">
            <h1 className="text-2xl font-bold text-gray-800">
              My Applications
            </h1>

            <p className="text-gray-500 mt-1">
              View all housing schemes you have applied for.
            </p>
          </div>

        </div>


        {/* =====================================
            APPLICATION COUNT
        ===================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">

          <p className="text-sm text-gray-500">
            Total Applications
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {applications.length}
          </p>

        </div>


        {/* =====================================
            EMPTY STATE
        ===================================== */}

        {applications.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">

            <h2 className="text-lg font-semibold text-gray-800">
              No Applications Found
            </h2>

            <p className="text-gray-500 mt-2">
              You have not applied for any housing schemes yet.
            </p>

            <Link
              to="/applicant/schemes"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700"
            >
              Explore Housing Schemes
            </Link>

          </div>

        ) : (

          /* =====================================
             APPLICATIONS
          ===================================== */

          <div className="space-y-5">

            {applications.map((application) => {

              const scheme = application.schemeId;

              const status =
                application.status || "SUBMITTED";

              return (
                <div
                  key={application._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >

                  {/* =================================
                      CARD HEADER
                  ================================= */}

                  <div className="p-6 border-b border-gray-100">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      <div>

                        <p className="text-sm text-blue-600 font-medium">
                          Housing Scheme
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-1">
                          {scheme?.schemeName || "Housing Scheme"}
                        </h2>

                        <p className="text-sm text-gray-500 mt-1">
                          {scheme?.location || "-"}
                          {scheme?.district
                            ? `, ${scheme.district}`
                            : ""}
                        </p>

                      </div>

                      <span
                        className={`self-start px-4 py-2 rounded-full text-xs font-semibold ${
                          statusStyles[status] ||
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {statusLabels[status] || status}
                      </span>

                    </div>

                  </div>


                  {/* =================================
                      APPLICATION DETAILS
                  ================================= */}

                  <div className="p-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                      {/* Application Number */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Application Number
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {application.applicationNumber || "-"}
                        </p>
                      </div>


                      {/* House Model */}

                      <div>
                        <p className="text-xs text-gray-500">
                          House Model
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {scheme?.houseModel || "-"}
                        </p>
                      </div>


                      {/* Price */}

                      <div>
                        <p className="text-xs text-gray-500">
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


                      {/* Income Category */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Income Category
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {application.incomeCategory || "-"}
                        </p>
                      </div>


                      {/* Family Members */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Family Members
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {application.familyMembers || "-"}
                        </p>
                      </div>


                      {/* Annual Income */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Annual Income
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          ₹
                          {application.annualIncome !== undefined
                            ? Number(
                                application.annualIncome
                              ).toLocaleString("en-IN")
                            : "-"}
                        </p>
                      </div>


                      {/* Employment */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Employment
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {application.employmentStatus || "-"}
                        </p>
                      </div>


                      {/* Submitted */}

                      <div>
                        <p className="text-xs text-gray-500">
                          Submitted On
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {application.submittedAt
                            ? new Date(
                                application.submittedAt
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "-"}
                        </p>
                      </div>

                    </div>


                    {/* =================================
                        ACTION
                    ================================= */}

                    <div className="mt-6 pt-5 border-t border-gray-100">

                      <Link
                        to={`/applicant/applications/${application._id}`}
                        className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                      >
                        View Application Details
                      </Link>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>

        )}

      </div>

    </div>
  );
}

export default MyApplications;