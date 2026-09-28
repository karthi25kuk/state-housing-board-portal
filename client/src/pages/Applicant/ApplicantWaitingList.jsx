import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaListOl, FaUsers } from "react-icons/fa";
import { getMyWaitingLists } from "../../services/waitingListService";

function ApplicantWaitingList() {
  const [waitingLists, setWaitingLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH MY WAITING LIST ENTRIES
  // ==========================================

  useEffect(() => {
    const fetchWaitingLists = async () => {
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

        const data = await getMyWaitingLists(token);

        setWaitingLists(data || []);
      } catch (error) {
        console.error("Fetch waiting list error:", error);

        setError(
          error.message ||
            "Unable to load your waiting list. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchWaitingLists();
  }, []);

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
  // STATUS STYLE
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "REMOVED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // ==========================================
  // STATUS LABEL
  // ==========================================

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "REMOVED":
        return "Removed";

      default:
        return status || "Unknown";
    }
  };

  // ==========================================
  // ACTIVE ENTRIES
  // ==========================================

  const activeEntries = waitingLists.filter(
    (item) => item.status === "ACTIVE"
  );

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          <Link
            to="/applicant"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8 mt-6 text-center">
            <p className="text-gray-500">
              Loading your waiting list...
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
      <div className="min-h-screen bg-slate-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">

          <Link
            to="/applicant"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 mt-6">
            <p className="font-medium">
              Unable to load waiting list
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>
          </div>

        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <Link
            to="/applicant"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <div className="mt-5">

            <h1 className="text-2xl font-bold text-gray-800">
              My Waiting List
            </h1>

            <p className="text-gray-500 mt-1">
              View your district-wise position and waiting list
              status for eligible housing applications.
            </p>

          </div>

        </div>

        {/* SUMMARY */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">

          {/* Total Entries */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FaListOl />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Waiting List Entries
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {waitingLists.length}
                </p>

              </div>

            </div>

          </div>

          {/* Active Entries */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                <FaClock />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Active Entries
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {activeEntries.length}
                </p>

              </div>

            </div>

          </div>

          {/* Districts */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaUsers />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Districts
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">
                  {
                    new Set(
                      waitingLists
                        .map((item) => item.district)
                        .filter(Boolean)
                    ).size
                  }
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* EMPTY STATE */}

        {waitingLists.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-gray-100 text-gray-500 flex items-center justify-center">
              <FaClock className="text-xl" />
            </div>

            <h2 className="text-lg font-semibold text-gray-800 mt-4">
              No Waiting List Entries
            </h2>

            <p className="text-gray-500 mt-2">
              You are currently not on any housing scheme
              waiting list.
            </p>

            <Link
              to="/applicant/schemes"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Explore Housing Schemes
            </Link>

          </div>
        ) : (

          /* WAITING LIST ENTRIES */

          <div className="space-y-5">

            {waitingLists.map((waitingList) => {

              const scheme = waitingList.schemeId;

              const position =
                waitingList.districtPosition ?? "-";

              const status =
                waitingList.status || "ACTIVE";

              return (
                <div
                  key={waitingList._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >

                  {/* CARD HEADER */}

                  <div className="bg-blue-50 px-6 py-5 border-b border-blue-100">

                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

                      <div>

                        <p className="text-sm text-blue-600 font-medium">
                          Housing Scheme
                        </p>

                        <h2 className="text-xl font-semibold text-gray-800 mt-1">
                          {scheme?.schemeName ||
                            "Housing Scheme"}
                        </h2>

                        <p className="text-sm text-gray-600 mt-1">
                          {waitingList.district || "-"}
                        </p>

                      </div>

                      <span
                        className={`self-start px-4 py-2 rounded-full text-xs font-semibold ${getStatusStyle(
                          status
                        )}`}
                      >
                        {getStatusLabel(status)}
                      </span>

                    </div>

                  </div>

                  {/* WAITING LIST DETAILS */}

                  <div className="p-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                      {/* District Position */}

                      <div>

                        <p className="text-xs text-gray-500">
                          District Position
                        </p>

                        <p className="text-xl font-bold text-blue-600 mt-1">
                          #{position}
                        </p>

                      </div>

                      {/* District */}

                      <div>

                        <p className="text-xs text-gray-500">
                          District
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {waitingList.district || "-"}
                        </p>

                      </div>

                      {/* Last Updated */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Last Updated
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {formatDate(
                            waitingList.lastUpdated ||
                              waitingList.updatedAt
                          )}
                        </p>

                      </div>

                      {/* Status */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Status
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {getStatusLabel(status)}
                        </p>

                      </div>

                    </div>

                    {/* ACTIVE INFORMATION */}

                    {status === "ACTIVE" && (
                      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">

                        <p className="text-sm text-blue-800 font-medium">
                          Your application is currently on
                          the district waiting list.
                        </p>

                        <p className="text-sm text-blue-700 mt-1">
                          Your position is determined by the
                          district-wise ranking process.
                        </p>

                      </div>
                    )}

                    {/* REMOVED INFORMATION */}

                    {status === "REMOVED" && (
                      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">

                        <p className="text-sm text-gray-700 font-medium">
                          This waiting list entry is no longer
                          active.
                        </p>

                        {waitingList.removalReason && (
                          <p className="text-sm text-gray-600 mt-1">
                            Reason:{" "}
                            {waitingList.removalReason.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        )}

                        {waitingList.removedAt && (
                          <p className="text-xs text-gray-500 mt-2">
                            Removed on{" "}
                            {formatDate(
                              waitingList.removedAt
                            )}
                          </p>
                        )}

                      </div>
                    )}

                    {/* APPLICATION LINK */}

                    {waitingList.applicationId?._id && (
                      <div className="mt-6 pt-5 border-t border-gray-100">

                        <Link
                          to={`/applicant/applications/${waitingList.applicationId._id}`}
                          className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
                        >
                          View Application
                        </Link>

                      </div>
                    )}

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

export default ApplicantWaitingList;