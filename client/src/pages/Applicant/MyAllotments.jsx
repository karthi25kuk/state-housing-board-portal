import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

function MyAllotments() {
  const { token } = useAuth();

  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  // ==========================================
  // FETCH MY ALLOTMENTS
  // ==========================================

  const fetchAllotments = async () => {
    if (!token) {
      setError("Your session has expired. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "http://localhost:5000/api/allotments/my",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to load allotments."
        );
      }

      setAllotments(data.allotments || []);
    } catch (error) {
      console.error("Fetch allotments error:", error);

      setError(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllotments();
  }, [token]);

  // ==========================================
  // DATE FORMATTER
  // ==========================================

  const formatDateTime = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "-";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    const statusMap = {
      OFFERED: "Offer Received",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
    };

    return statusMap[status] || status || "Unknown";
  };

  // ==========================================
  // STATUS STYLE
  // ==========================================

  const getStatusClass = (status) => {
    switch (status) {
      case "OFFERED":
        return "bg-yellow-100 text-yellow-700";

      case "ACCEPTED":
        return "bg-green-100 text-green-700";

      case "REJECTED":
        return "bg-red-100 text-red-700";

      case "CANCELLED":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // RESPOND TO ALLOTMENT
  // ==========================================

  const handleResponse = async (allotmentId, decision) => {
    if (!token || !allotmentId) {
      return;
    }

    const action =
      decision === "ACCEPT" ? "accept" : "reject";

    const confirmed = window.confirm(
      `Are you sure you want to ${action} this allotment offer?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setProcessingId(allotmentId);
      setError("");

      const response = await fetch(
        `http://localhost:5000/api/allotments/${allotmentId}/respond`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            decision,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to process your response."
        );
      }

      window.alert(
        data.message ||
          `Allotment offer ${action}ed successfully.`
      );

      await fetchAllotments();
    } catch (error) {
      console.error("Allotment response error:", error);

      setError(
        error.message || "Unable to connect to the server."
      );
    } finally {
      setProcessingId(null);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">
            Loading allotment details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* BACK */}
        <Link
          to="/applicant"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Dashboard
        </Link>

        {/* HEADER */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Allotments
          </h1>

          <p className="text-gray-500 mt-2">
            View and respond to your housing allotment offers.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* EMPTY */}
        {!error && allotments.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No allotments found
            </h2>

            <p className="text-gray-500 mt-2">
              You currently do not have any housing allotment
              offers.
            </p>

            <Link
              to="/applicant/schemes"
              className="inline-block mt-5 text-blue-600 font-medium hover:text-blue-800"
            >
              Explore Housing Schemes →
            </Link>
          </div>
        )}

        {/* ALLOTMENTS */}
        <div className="space-y-6">
          {allotments.map((allotment) => {
            const isOffered =
              allotment.status === "OFFERED";

            const isAccepted =
              allotment.status === "ACCEPTED";

            const isRejected =
              allotment.status === "REJECTED";

            const isCancelled =
              allotment.status === "CANCELLED";

            return (
              <div
                key={allotment._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
              >
                {/* HEADER */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-sm text-gray-500">
                      Housing Allotment
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-1">
                      {allotment.schemeId?.schemeName ||
                        "Housing Scheme"}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {allotment.location || "-"},{" "}
                      {allotment.district || "-"}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold self-start ${getStatusClass(
                      allotment.status
                    )}`}
                  >
                    {getStatusLabel(allotment.status)}
                  </span>
                </div>

                {/* HOUSE INFORMATION */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      House Number
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {allotment.houseNumber || "-"}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      House Model
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {allotment.houseModel || "-"}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      ₹
                      {Number(
                        allotment.price || 0
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                {/* APPLICATION INFORMATION */}
                <div className="border-t border-gray-100 mt-6 pt-5">
                  <p className="text-sm text-gray-500">
                    Application Number
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {allotment.applicationId?.applicationNumber ||
                      "-"}
                  </p>
                </div>

                {/* DISTRICT */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    District
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {allotment.district || "-"}
                  </p>
                </div>

                {/* OFFER DATE */}
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Offer Date
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {formatDateTime(allotment.offeredAt)}
                  </p>
                </div>

                {/* RESPONSE DATE */}
                {allotment.respondedAt && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Response Date
                    </p>

                    <p className="font-medium text-gray-800 mt-1">
                      {formatDateTime(
                        allotment.respondedAt
                      )}
                    </p>
                  </div>
                )}

                {/* REMARKS */}
                {allotment.remarks && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-500">
                      Remarks
                    </p>

                    <p className="font-medium text-gray-800 mt-1">
                      {allotment.remarks}
                    </p>
                  </div>
                )}

                {/* OFFER ACTIONS */}
                {isOffered && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={() =>
                        handleResponse(
                          allotment._id,
                          "ACCEPT"
                        )
                      }
                      disabled={
                        processingId === allotment._id
                      }
                      className="flex-1 bg-green-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                    >
                      {processingId === allotment._id
                        ? "Processing..."
                        : "Accept Offer"}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleResponse(
                          allotment._id,
                          "REJECT"
                        )
                      }
                      disabled={
                        processingId === allotment._id
                      }
                      className="flex-1 bg-white border border-red-300 text-red-600 px-5 py-3 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingId === allotment._id
                        ? "Processing..."
                        : "Reject Offer"}
                    </button>
                  </div>
                )}

                {/* ACCEPTED MESSAGE */}
                {isAccepted && (
                  <div className="mt-6 bg-green-50 border border-green-200 text-green-700 rounded-lg p-4">
                    <p className="font-semibold">
                      Housing allotment accepted
                    </p>

                    <p className="text-sm mt-1">
                      This house has been successfully allotted
                      to you.
                    </p>
                  </div>
                )}

                {/* REJECTED MESSAGE */}
                {isRejected && (
                  <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    <p className="font-semibold">
                      Allotment offer rejected
                    </p>

                    <p className="text-sm mt-1">
                      The rejected house has been returned to
                      the scheme's available inventory. Your
                      application may remain eligible for a
                      future allotment according to the
                      district waiting-list process.
                    </p>
                  </div>
                )}

                {/* CANCELLED MESSAGE */}
                {isCancelled && (
                  <div className="mt-6 bg-gray-50 border border-gray-200 text-gray-600 rounded-lg p-4">
                    <p className="font-semibold">
                      Allotment cancelled
                    </p>

                    <p className="text-sm mt-1">
                      This allotment offer is no longer active.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default MyAllotments;