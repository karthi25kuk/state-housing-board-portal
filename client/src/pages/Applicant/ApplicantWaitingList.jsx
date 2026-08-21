import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaClock, FaListOl, FaUsers } from "react-icons/fa";

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

        const response = await fetch(
          "http://localhost:5000/api/waiting-list/my",
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
            data.message ||
              "Failed to fetch your waiting list."
          );
          return;
        }

        setWaitingLists(data.waitingLists || []);
      } catch (error) {
        console.error(
          "Fetch waiting list error:",
          error
        );

        setError(
          "Unable to connect to the server. Please try again."
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
  // STATUS
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";

      case "COMPLETED":
        return "bg-blue-100 text-blue-700";

      case "REMOVED":
        return "bg-red-100 text-red-700";

      case "INACTIVE":
        return "bg-gray-100 text-gray-600";

      default:
        return "bg-yellow-100 text-yellow-700";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "ACTIVE":
        return "Active";

      case "COMPLETED":
        return "Completed";

      case "REMOVED":
        return "Removed";

      case "INACTIVE":
        return "Inactive";

      default:
        return status || "Pending";
    }
  };

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
              My Waiting List
            </h1>

            <p className="text-gray-500 mt-1">
              View your position and status in housing
              scheme waiting lists.
            </p>

          </div>

        </div>


        {/* =====================================
            SUMMARY
        ===================================== */}

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
                  {
                    waitingLists.filter(
                      (item) =>
                        item.status === "ACTIVE"
                    ).length
                  }
                </p>

              </div>

            </div>

          </div>


          {/* Total Applicants */}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">

            <div className="flex items-center gap-4">

              <div className="w-11 h-11 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <FaUsers />
              </div>

              <div>

                <p className="text-sm text-gray-500">
                  Latest Total Applicants
                </p>

                <p className="text-2xl font-bold text-gray-800 mt-1">

                  {waitingLists.length > 0
                    ? waitingLists[0]
                        .totalApplicants || "-"
                    : "-"}

                </p>

              </div>

            </div>

          </div>

        </div>


        {/* =====================================
            EMPTY STATE
        ===================================== */}

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

          /* =====================================
             WAITING LIST ENTRIES
          ===================================== */

          <div className="space-y-5">

            {waitingLists.map((waitingList) => {

              const scheme =
                waitingList.schemeId;

              const position =
                waitingList.overallPosition ??
                waitingList.districtPosition ??
                "-";

              const totalApplicants =
                waitingList.totalApplicants ??
                "-";

              const status =
                waitingList.status || "ACTIVE";

              return (
                <div
                  key={waitingList._id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden"
                >

                  {/* =================================
                      CARD HEADER
                  ================================= */}

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

                          {scheme?.district || "-"}

                          {scheme?.location
                            ? ` · ${scheme.location}`
                            : ""}

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


                  {/* =================================
                      WAITING LIST DETAILS
                  ================================= */}

                  <div className="p-6">

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

                      {/* Position */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Waiting Position
                        </p>

                        <p className="text-xl font-bold text-blue-600 mt-1">
                          #{position}
                        </p>

                      </div>


                      {/* Total Applicants */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Total Applicants
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {totalApplicants}
                        </p>

                      </div>


                      {/* District Position */}

                      <div>

                        <p className="text-xs text-gray-500">
                          District Position
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {waitingList.districtPosition ??
                            "-"}
                        </p>

                      </div>


                      {/* Last Updated */}

                      <div>

                        <p className="text-xs text-gray-500">
                          Last Updated
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {formatDate(
                            waitingList.updatedAt ||
                              waitingList.lastUpdated
                          )}
                        </p>

                      </div>

                    </div>


                    {/* =================================
                        INFORMATION
                    ================================= */}

                    {status === "ACTIVE" && (
                      <div className="mt-6 bg-blue-50 border border-blue-100 rounded-lg p-4">

                        <p className="text-sm text-blue-800 font-medium">
                          Your application is currently
                          on the waiting list.
                        </p>

                        <p className="text-sm text-blue-700 mt-1">
                          Your position may change when
                          other applications are processed
                          or houses become available.
                        </p>

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