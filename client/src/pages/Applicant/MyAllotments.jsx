import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function MyAllotments() {
  const [allotments, setAllotments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState(null);

  const fetchAllotments = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/allotments/my",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load allotments.");
        return;
      }

      setAllotments(data.allotments || []);
    } catch (error) {
      console.error("Fetch allotments error:", error);

      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllotments();
  }, []);

  const handleResponse = async (allotmentId, decision) => {
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

      const token = localStorage.getItem("token");

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

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to process your response.");
        return;
      }

      alert(data.message);

      await fetchAllotments();
    } catch (error) {
      console.error("Allotment response error:", error);

      alert("Unable to connect to the server.");
    } finally {
      setProcessingId(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Dashboard
        </Link>

        {/* Header */}
        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            My Allotments
          </h1>

          <p className="text-gray-500 mt-2">
            View and respond to your housing allotment offers.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && allotments.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">
            <h2 className="text-xl font-semibold text-gray-700">
              No allotments found
            </h2>

            <p className="text-gray-500 mt-2">
              You currently do not have any housing allotment offers.
            </p>
          </div>
        )}

        {/* Allotments */}
        <div className="space-y-6">

          {allotments.map((allotment) => {

            const isOffered =
              allotment.status === "OFFERED";

            const isAccepted =
              allotment.status === "ACCEPTED";

            const isRejected =
              allotment.status === "REJECTED";

            return (
              <div
                key={allotment._id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
              >

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                  <div>
                    <p className="text-sm text-gray-500">
                      Housing Allotment
                    </p>

                    <h2 className="text-2xl font-bold text-gray-800 mt-1">
                      {allotment.schemeId?.schemeName}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {allotment.schemeId?.location},{" "}
                      {allotment.schemeId?.district}
                    </p>
                  </div>

                  <span
                    className={`px-4 py-2 rounded-full text-sm font-semibold self-start ${
                      isOffered
                        ? "bg-yellow-100 text-yellow-700"
                        : isAccepted
                        ? "bg-green-100 text-green-700"
                        : isRejected
                        ? "bg-red-100 text-red-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {allotment.status}
                  </span>

                </div>

                {/* House Information */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      House Number
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {allotment.houseNumber}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      House Model
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      {allotment.houseModel}
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">
                      Price
                    </p>

                    <p className="text-lg font-semibold text-gray-800 mt-1">
                      ₹
                      {Number(
                        allotment.price
                      ).toLocaleString("en-IN")}
                    </p>
                  </div>

                </div>

                {/* Application */}
                <div className="border-t border-gray-100 mt-6 pt-5">

                  <p className="text-sm text-gray-500">
                    Application Number
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {allotment.applicationId?.applicationNumber}
                  </p>

                </div>

                {/* Offer Date */}
                <div className="mt-4">

                  <p className="text-sm text-gray-500">
                    Offer Date
                  </p>

                  <p className="font-medium text-gray-800 mt-1">
                    {allotment.offeredAt
                      ? new Date(
                          allotment.offeredAt
                        ).toLocaleString("en-IN")
                      : "-"}
                  </p>

                </div>

                {/* Actions */}
                {isOffered && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-gray-100">

                    <button
                      onClick={() =>
                        handleResponse(
                          allotment._id,
                          "ACCEPT"
                        )
                      }
                      disabled={
                        processingId === allotment._id
                      }
                      className="flex-1 bg-green-600 text-white px-5 py-3 rounded-lg font-medium hover:bg-green-700 disabled:bg-green-300"
                    >
                      {processingId === allotment._id
                        ? "Processing..."
                        : "Accept Offer"}
                    </button>

                    <button
                      onClick={() =>
                        handleResponse(
                          allotment._id,
                          "REJECT"
                        )
                      }
                      disabled={
                        processingId === allotment._id
                      }
                      className="flex-1 bg-white border border-red-300 text-red-600 px-5 py-3 rounded-lg font-medium hover:bg-red-50 disabled:opacity-50"
                    >
                      Reject Offer
                    </button>

                  </div>
                )}

                {/* Accepted message */}
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

                {/* Rejected message */}
                {isRejected && (
                  <div className="mt-6 bg-red-50 border border-red-200 text-red-700 rounded-lg p-4">
                    <p className="font-semibold">
                      Allotment offer rejected
                    </p>

                    <p className="text-sm mt-1">
                      The rejected house has been returned to
                      the scheme's available inventory.
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