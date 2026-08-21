import { useEffect, useState } from "react";
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaListOl,
  FaHome,
} from "react-icons/fa";
import { Link } from "react-router-dom";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationCard from "../../components/dashboard/ApplicationCard";
import ApplicationProgress from "../../components/dashboard/ApplicationProgress";
import NotificationCard from "../../components/dashboard/NotificationCard";
import RecentApplications from "../../components/dashboard/RecentApplications";
import SchemeCard from "../../components/dashboard/SchemeCard";
import WaitingListCard from "../../components/dashboard/WaitingListCard";

import { useAuth } from "../../context/AuthContext";

function ApplicantDashboard() {
  const { token, user } = useAuth();

  // ==========================================
  // STATE
  // ==========================================

  const [schemes, setSchemes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [waitingLists, setWaitingLists] = useState([]);
  const [allotments, setAllotments] = useState([]);

  const [loadingSchemes, setLoadingSchemes] = useState(true);
  const [loadingApplications, setLoadingApplications] = useState(true);
  const [loadingWaitingLists, setLoadingWaitingLists] = useState(true);
  const [loadingAllotments, setLoadingAllotments] = useState(true);

  const [schemeError, setSchemeError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [waitingListError, setWaitingListError] = useState("");
  const [allotmentError, setAllotmentError] = useState("");

  // ==========================================
  // COMMON API HELPER
  // ==========================================

  const fetchWithAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error("Authentication required. Please login again.");
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    let data = {};

    try {
      data = await response.json();
    } catch {
      data = {};
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Something went wrong while fetching data."
      );
    }

    return data;
  };

  // ==========================================
  // FETCH OPEN SCHEMES
  // ==========================================

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoadingSchemes(true);
        setSchemeError("");

        const data = await fetchWithAuth(
          "http://localhost:5000/api/schemes/open"
        );

        setSchemes(data.schemes || []);
      } catch (error) {
        console.error("Fetch schemes error:", error);
        setSchemeError(error.message);
      } finally {
        setLoadingSchemes(false);
      }
    };

    if (token) {
      fetchSchemes();
    } else {
      setLoadingSchemes(false);
    }
  }, [token]);

  // ==========================================
  // FETCH MY APPLICATIONS
  // ==========================================

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoadingApplications(true);
        setApplicationError("");

        const data = await fetchWithAuth(
          "http://localhost:5000/api/applications/my"
        );

        setApplications(data.applications || []);
      } catch (error) {
        console.error("Fetch applications error:", error);
        setApplicationError(error.message);
      } finally {
        setLoadingApplications(false);
      }
    };

    if (token) {
      fetchApplications();
    } else {
      setLoadingApplications(false);
    }
  }, [token]);

  // ==========================================
  // FETCH MY WAITING LIST
  // ==========================================

  useEffect(() => {
    const fetchWaitingLists = async () => {
      try {
        setLoadingWaitingLists(true);
        setWaitingListError("");

        const data = await fetchWithAuth(
          "http://localhost:5000/api/waiting-list/my"
        );

        setWaitingLists(data.waitingLists || []);
      } catch (error) {
        console.error("Fetch waiting list error:", error);
        setWaitingListError(error.message);
      } finally {
        setLoadingWaitingLists(false);
      }
    };

    if (token) {
      fetchWaitingLists();
    } else {
      setLoadingWaitingLists(false);
    }
  }, [token]);

  // ==========================================
  // FETCH MY ALLOTMENTS
  // ==========================================

  useEffect(() => {
    const fetchAllotments = async () => {
      try {
        setLoadingAllotments(true);
        setAllotmentError("");

        const data = await fetchWithAuth(
          "http://localhost:5000/api/allotments/my"
        );

        setAllotments(data.allotments || []);
      } catch (error) {
        console.error("Fetch allotments error:", error);
        setAllotmentError(error.message);
      } finally {
        setLoadingAllotments(false);
      }
    };

    if (token) {
      fetchAllotments();
    } else {
      setLoadingAllotments(false);
    }
  }, [token]);

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
  // APPLICATION STATUS
  // ==========================================

  const getApplicationStatus = (status) => {
    const statusMap = {
      SUBMITTED: "Pending",
      UNDER_VERIFICATION: "Under Verification",
      ELIGIBLE: "Eligible",
      INELIGIBLE: "Rejected",
      WAITING_LIST: "Waiting List",
      ALLOTMENT_OFFERED: "Allotment Offered",
      ALLOTTED: "Allotted",
      REJECTED: "Rejected",
      WITHDRAWN: "Withdrawn",
    };

    return statusMap[status] || status || "Unknown";
  };

  // ==========================================
  // ALLOTMENT STATUS
  // ==========================================

  const getAllotmentStatus = (status) => {
    const statusMap = {
      OFFERED: "Offer Received",
      ACCEPTED: "Accepted",
      REJECTED: "Rejected",
      CANCELLED: "Cancelled",
    };

    return statusMap[status] || status || "Unknown";
  };

  // ==========================================
  // APPLICATION PROGRESS
  // ==========================================

  const getProgressStep = (status) => {
    switch (status) {
      case "SUBMITTED":
        return 1;

      case "UNDER_VERIFICATION":
        return 2;

      case "ELIGIBLE":
        return 3;

      case "WAITING_LIST":
        return 4;

      case "ALLOTMENT_OFFERED":
        return 4;

      case "ALLOTTED":
        return 4;

      default:
        return 1;
    }
  };

  // ==========================================
  // SORT DATA
  // ==========================================

  const sortedApplications = [...applications].sort(
    (a, b) =>
      new Date(b.createdAt || b.submittedAt || 0) -
      new Date(a.createdAt || a.submittedAt || 0)
  );

  const sortedWaitingLists = [...waitingLists].sort(
    (a, b) =>
      new Date(b.createdAt || 0) -
      new Date(a.createdAt || 0)
  );

  const sortedAllotments = [...allotments].sort(
    (a, b) =>
      new Date(b.createdAt || b.offeredAt || 0) -
      new Date(a.createdAt || a.offeredAt || 0)
  );

  // ==========================================
  // CURRENT DATA
  // ==========================================

  const currentApplication =
    sortedApplications.length > 0
      ? sortedApplications[0]
      : null;

  const currentWaitingList =
    sortedWaitingLists.length > 0
      ? sortedWaitingLists[0]
      : null;

  const currentAllotment =
    sortedAllotments.length > 0
      ? sortedAllotments[0]
      : null;

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "SUBMITTED" ||
      application.status === "UNDER_VERIFICATION"
  ).length;

  const approvedApplications = applications.filter(
    (application) =>
      application.status === "ELIGIBLE" ||
      application.status === "ALLOTMENT_OFFERED" ||
      application.status === "ALLOTTED"
  ).length;

  // ==========================================
  // WAITING POSITION
  // ==========================================

  const waitingPosition =
    currentWaitingList?.overallPosition ??
    currentWaitingList?.districtPosition ??
    "-";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">

        <Topbar />

        <main className="p-6">

          {/* ==========================================
              WELCOME
          ========================================== */}

          <div className="mb-6">

            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.name || "Applicant"}
            </h1>

            <p className="text-gray-500 mt-1">
              Here's an overview of your housing applications.
            </p>

          </div>

          {/* ==========================================
              STATISTICS
          ========================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <StatCard
              title="Applications"
              value={totalApplications}
              icon={<FaFileAlt />}
              description="Total applications submitted"
            />

            <StatCard
              title="Pending"
              value={pendingApplications}
              icon={<FaClock />}
              description="Applications under review"
            />

            <StatCard
              title="Eligible"
              value={approvedApplications}
              icon={<FaCheckCircle />}
              description="Eligible applications"
            />

            <StatCard
              title="Waiting Position"
              value={
                currentWaitingList
                  ? `#${waitingPosition}`
                  : "-"
              }
              icon={<FaListOl />}
              description="Current waiting list position"
            />

          </div>

          {/* ==========================================
              CURRENT APPLICATION + WAITING LIST
          ========================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

            {/* CURRENT APPLICATION */}

            {loadingApplications ? (

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-gray-500">
                  Loading application...
                </p>
              </div>

            ) : applicationError ? (

              <div className="bg-white border border-red-200 rounded-xl p-6">
                <p className="text-red-600">
                  {applicationError}
                </p>
              </div>

            ) : currentApplication ? (

              <ApplicationCard
                schemeName={
                  currentApplication.schemeId?.schemeName ||
                  "Housing Scheme"
                }
                applicationId={
                  currentApplication.applicationNumber ||
                  currentApplication._id
                }
                submittedDate={formatDate(
                  currentApplication.submittedAt ||
                  currentApplication.createdAt
                )}
                status={getApplicationStatus(
                  currentApplication.status
                )}
              />

            ) : (

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

                <p className="text-sm text-gray-500">
                  Current Application
                </p>

                <h3 className="text-xl font-semibold text-gray-800 mt-1">
                  No applications yet
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Apply for an available housing scheme to
                  track your application here.
                </p>

                <Link
                  to="/applicant/schemes"
                  className="inline-block mt-4 text-sm text-blue-600 font-medium"
                >
                  Explore Housing Schemes →
                </Link>

              </div>

            )}

            {/* WAITING LIST */}

            {loadingWaitingLists ? (

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-gray-500">
                  Loading waiting list...
                </p>
              </div>

            ) : waitingListError ? (

              <div className="bg-white border border-red-200 rounded-xl p-6">
                <p className="text-red-600">
                  {waitingListError}
                </p>
              </div>

            ) : currentWaitingList ? (

              <WaitingListCard
                schemeName={
                  currentWaitingList.schemeId?.schemeName ||
                  "Housing Scheme"
                }
                position={waitingPosition}
                totalApplicants={
                  currentWaitingList.totalApplicants || "-"
                }
                status={
                  currentWaitingList.status === "ACTIVE"
                    ? "Active"
                    : currentWaitingList.status
                }
                lastUpdated={formatDate(
                  currentWaitingList.updatedAt ||
                  currentWaitingList.lastUpdated
                )}
              />

            ) : (

              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                    <FaClock />
                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Waiting List
                    </p>

                    <h3 className="text-lg font-semibold text-gray-800">
                      No Waiting List Entry
                    </h3>

                  </div>

                </div>

                <p className="text-sm text-gray-500 mt-5">
                  You are currently not on any housing scheme
                  waiting list.
                </p>

                <Link
                  to="/applicant/waiting-list"
                  className="inline-block mt-4 text-sm text-blue-600 font-medium"
                >
                  View Waiting List →
                </Link>

              </div>

            )}

          </div>

          {/* ==========================================
              ALLOTMENT
          ========================================== */}

          {!loadingAllotments && currentAllotment && (

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

              <div className="flex items-start justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                    <FaHome />
                  </div>

                  <div>

                    <p className="text-sm text-gray-500">
                      Housing Allotment
                    </p>

                    <h2 className="text-xl font-semibold text-gray-800">
                      {currentAllotment.schemeId?.schemeName ||
                        "Housing Scheme"}
                    </h2>

                  </div>

                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentAllotment.status === "ACCEPTED"
                      ? "bg-green-100 text-green-700"
                      : currentAllotment.status === "OFFERED"
                      ? "bg-blue-100 text-blue-700"
                      : currentAllotment.status === "REJECTED"
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {getAllotmentStatus(
                    currentAllotment.status
                  )}
                </span>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">

                <div>
                  <p className="text-sm text-gray-500">
                    House Number
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {currentAllotment.houseNumber || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    House Model
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {currentAllotment.houseModel || "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Price
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    ₹
                    {Number(
                      currentAllotment.price || 0
                    ).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Offered On
                  </p>

                  <p className="font-semibold text-gray-800 mt-1">
                    {formatDate(
                      currentAllotment.offeredAt
                    )}
                  </p>
                </div>

              </div>

              {currentAllotment.status === "OFFERED" && (

                <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4">

                  <p className="text-sm text-blue-800 font-medium">
                    A house allotment offer is waiting for your
                    response.
                  </p>

                  <p className="text-sm text-blue-700 mt-1">
                    Please open My Allotments to accept or
                    reject the offer.
                  </p>

                  <Link
                    to="/dashboard/allotments"
                    className="inline-block mt-3 text-sm text-blue-700 font-semibold"
                  >
                    Open My Allotments →
                  </Link>

                </div>

              )}

            </div>

          )}

          {allotmentError && (

            <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-700">
                {allotmentError}
              </p>
            </div>

          )}

          {/* ==========================================
              APPLICATION PROGRESS
          ========================================== */}

          {currentApplication && (

            <div className="mt-6">

              <ApplicationProgress
                currentStep={getProgressStep(
                  currentApplication.status
                )}
              />

            </div>

          )}

          {/* ==========================================
              RECENT APPLICATIONS + NOTIFICATIONS
          ========================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

            {/* RECENT APPLICATIONS */}

            <div className="xl:col-span-2">

              {loadingApplications ? (

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-500">
                    Loading applications...
                  </p>
                </div>

              ) : applicationError ? (

                <div className="bg-white border border-red-200 rounded-xl p-6">
                  <p className="text-red-600">
                    {applicationError}
                  </p>
                </div>

              ) : (

                <RecentApplications
                  applications={sortedApplications}
                />

              )}

            </div>

            {/* NOTIFICATIONS */}

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

              <div className="p-6 border-b border-gray-100">

                <h3 className="text-lg font-semibold text-gray-800">
                  Recent Notifications
                </h3>

                <p className="text-sm text-gray-500 mt-1">
                  Latest updates regarding your applications.
                </p>

              </div>

              <div>

                {currentApplication ? (

                  <>

                    <NotificationCard
                      type="success"
                      title="Application Submitted"
                      message={`Your application ${
                        currentApplication.applicationNumber ||
                        currentApplication._id
                      } has been submitted successfully.`}
                      date={formatDate(
                        currentApplication.submittedAt ||
                        currentApplication.createdAt
                      )}
                      isNew={true}
                    />

                    {currentApplication.status ===
                      "UNDER_VERIFICATION" && (

                      <NotificationCard
                        type="info"
                        title="Application Under Verification"
                        message="Your submitted application is currently being reviewed."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                    {currentApplication.status === "ELIGIBLE" && (

                      <NotificationCard
                        type="success"
                        title="Application Eligible"
                        message="Your application has been verified and you are eligible for the housing scheme."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                    {currentApplication.status === "WAITING_LIST" && (

                      <NotificationCard
                        type="warning"
                        title="Added to Waiting List"
                        message="Your application has been added to the housing scheme waiting list."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                    {currentApplication.status === "ALLOTMENT_OFFERED" && (

                      <NotificationCard
                        type="success"
                        title="House Allotment Offered"
                        message="A house has been offered to you. Please check My Allotments and respond to the offer."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                    {currentApplication.status === "ALLOTTED" && (

                      <NotificationCard
                        type="success"
                        title="House Allotted"
                        message="Congratulations! A house has been allotted to you."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                    {currentApplication.status === "INELIGIBLE" && (

                      <NotificationCard
                        type="error"
                        title="Application Rejected"
                        message="Your application was found to be ineligible for this housing scheme."
                        date={formatDate(
                          currentApplication.updatedAt
                        )}
                      />

                    )}

                  </>

                ) : (

                  <NotificationCard
                    type="info"
                    title="Welcome to the Housing Portal"
                    message="You currently have no application updates."
                    date="Today"
                  />

                )}

              </div>

              <div className="p-4 border-t border-gray-100 text-center">

                <Link
                  to="/notifications"
                  className="text-sm text-blue-600 font-medium hover:text-blue-800"
                >
                  View All Notifications →
                </Link>

              </div>

            </div>

          </div>

          {/* ==========================================
              AVAILABLE HOUSING SCHEMES
          ========================================== */}

          <div className="mt-8">

            <div className="flex items-center justify-between mb-5">

              <div>

                <h2 className="text-xl font-semibold text-gray-800">
                  Available Housing Schemes
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Explore currently available housing opportunities.
                </p>

              </div>

              <Link
                to="/applicant/schemes"
                className="text-sm text-blue-600 font-medium hover:text-blue-800"
              >
                View All →
              </Link>

            </div>

            {/* SCHEME ERROR */}

            {schemeError && (

              <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5">
                {schemeError}
              </div>

            )}

            {/* SCHEME LOADING */}

            {loadingSchemes ? (

              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-gray-500">
                  Loading available housing schemes...
                </p>
              </div>

            ) : schemes.length === 0 ? (

              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">

                <h3 className="text-lg font-semibold text-gray-800">
                  No housing schemes available
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  There are currently no open housing schemes.
                </p>

              </div>

            ) : (

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {schemes.slice(0, 3).map((scheme) => (

                  <SchemeCard
                    key={scheme._id}
                    name={scheme.schemeName}
                    location={`${scheme.district}, ${scheme.location}`}
                    units={scheme.availableUnits}
                    category={
                      scheme.eligibleIncomeCategories?.join(
                        " / "
                      ) || "Not specified"
                    }
                    deadline={formatDate(
                      scheme.applicationEndDate
                    )}
                    schemeId={scheme._id}
                  />

                ))}

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}

export default ApplicantDashboard;