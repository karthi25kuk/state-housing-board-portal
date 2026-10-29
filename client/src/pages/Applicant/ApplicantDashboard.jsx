import { useEffect, useMemo, useState } from "react";
import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaListOl,
  FaHome,
  FaDownload,
  FaMapMarkerAlt,
  FaCalendarAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import API_BASE_URL from "../../api";

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

import { getOpenSchemes } from "../../services/schemeService";
import { getMyApplications } from "../../services/applicationService";
import { getMyWaitingLists } from "../../services/waitingListService";

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
  const [downloadingAllotmentId, setDownloadingAllotmentId] = useState(null);

  const [schemeError, setSchemeError] = useState("");
  const [applicationError, setApplicationError] = useState("");
  const [waitingListError, setWaitingListError] = useState("");
  const [allotmentError, setAllotmentError] = useState("");

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

  const handleDownloadAllotment = async (allotment) => {
    if (!allotment?._id || !token) {
      setAllotmentError("Unable to download the allotment copy.");
      return;
    }

    try {
      setDownloadingAllotmentId(allotment._id);
      setAllotmentError("");

      const response = await fetch(
        `${API_BASE_URL}/api/allotments/${allotment._id}/download`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        let message = "Failed to download allotment copy.";

        try {
          const errorData = JSON.parse(errorText);
          message = errorData.message || message;
        } catch {
          // Keep the default message if the response isn't JSON.
        }

        throw new Error(message);
      }

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Allotment_Order_${
        allotment.houseNumber || allotment._id
      }.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Download allotment error:", error);
      setAllotmentError(error.message || "Failed to download allotment copy.");
    } finally {
      setDownloadingAllotmentId(null);
    }
  };

  // ==========================================
  // APPLICATION STATUS LABEL
  // ==========================================

  const getApplicationStatus = (status) => {
    const statusMap = {
      SUBMITTED: "Pending",
      UNDER_VERIFICATION: "Under Verification",
      ELIGIBLE: "Eligible",
      REJECTED: "Rejected",
      WITHDRAWN: "Withdrawn",
    };

    return statusMap[status] || status || "Unknown";
  };

  // ==========================================
  // ALLOTMENT STATUS LABEL
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

  const getProgressStep = (status, hasWaitingList, hasAllotment) => {
    if (status === "SUBMITTED") {
      return 1;
    }

    if (status === "UNDER_VERIFICATION") {
      return 2;
    }

    if (status === "ELIGIBLE") {
      if (hasWaitingList || hasAllotment) {
        return 4;
      }

      return 3;
    }

    return 1;
  };

  // ==========================================
  // FETCH COMMON HOUSING SCHEMES
  // ==========================================

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        setLoadingSchemes(true);
        setSchemeError("");

        const result = await getOpenSchemes(token);

        setSchemes(result || []);
      } catch (error) {
        console.error("Fetch schemes error:", error);

        setSchemeError(error.message || "Failed to fetch housing schemes.");
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

        const result = await getMyApplications(token);

        setApplications(result || []);
      } catch (error) {
        console.error("Fetch applications error:", error);

        setApplicationError(error.message || "Failed to fetch applications.");
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

        const result = await getMyWaitingLists(token);

        setWaitingLists(result || []);
      } catch (error) {
        console.error("Fetch waiting list error:", error);

        setWaitingListError(error.message || "Failed to fetch waiting list.");
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
      if (!token) {
        setLoadingAllotments(false);
        return;
      }

      try {
        setLoadingAllotments(true);
        setAllotmentError("");

        const response = await fetch(
          `${API_BASE_URL}/api/allotments/my`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch allotments.");
        }

        setAllotments(data.allotments || []);
      } catch (error) {
        console.error("Fetch allotments error:", error);

        setAllotmentError(error.message || "Failed to fetch allotments.");
      } finally {
        setLoadingAllotments(false);
      }
    };

    fetchAllotments();
  }, [token]);

  const applicantSchemes = schemes;

  // ==========================================
  // SORT APPLICATIONS
  // ==========================================

  const sortedApplications = useMemo(() => {
    return [...applications].sort(
      (a, b) =>
        new Date(b.submittedAt || b.createdAt || 0) -
        new Date(a.submittedAt || a.createdAt || 0),
    );
  }, [applications]);

  // ==========================================
  // SORT WAITING LISTS
  // ==========================================

  const sortedWaitingLists = useMemo(() => {
    return [...waitingLists].sort(
      (a, b) =>
        new Date(b.lastUpdated || b.updatedAt || b.createdAt || 0) -
        new Date(a.lastUpdated || a.updatedAt || a.createdAt || 0),
    );
  }, [waitingLists]);

  // ==========================================
  // SORT ALLOTMENTS
  // ==========================================

  const sortedAllotments = useMemo(() => {
    return [...allotments].sort(
      (a, b) =>
        new Date(b.offeredAt || b.createdAt || 0) -
        new Date(a.offeredAt || a.createdAt || 0),
    );
  }, [allotments]);

  // ==========================================
  // CURRENT DATA
  // ==========================================

  const currentApplication =
    sortedApplications.length > 0 ? sortedApplications[0] : null;

  const activeWaitingLists = sortedWaitingLists.filter(
    (waitingList) => waitingList.status === "ACTIVE",
  );

  const currentWaitingList =
    activeWaitingLists.length > 0 ? activeWaitingLists[0] : null;

  const currentAllotment =
    sortedAllotments.length > 0 ? sortedAllotments[0] : null;

  // ==========================================
  // STATISTICS
  // ==========================================

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (application) =>
      application.status === "SUBMITTED" ||
      application.status === "UNDER_VERIFICATION",
  ).length;

  const eligibleApplications = applications.filter(
    (application) => application.status === "ELIGIBLE",
  ).length;

  // ==========================================
  // WAITING POSITION
  // ==========================================

  const waitingPosition = currentWaitingList?.districtPosition ?? "-";

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* =====================================
          SINGLE SIDEBAR
      ===================================== */}

      <Sidebar />

      {/* =====================================
          MAIN CONTENT
      ===================================== */}

      <div className="flex-1 min-w-0">
        <Topbar />

        <main className="p-6">
          {/* ==================================
              WELCOME
          ================================== */}

          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, {user?.name || "Applicant"}
            </h1>

            <p className="text-gray-500 mt-1">
              Here's an overview of your housing applications.
            </p>
          </div>

          {/* ==================================
              STATISTICS
          ================================== */}

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
              value={eligibleApplications}
              icon={<FaCheckCircle />}
              description="Eligible applications"
            />

            <StatCard
              title="Waiting Position"
              value={currentWaitingList ? `#${waitingPosition}` : "-"}
              icon={<FaListOl />}
              description="Current district waiting position"
            />
          </div>

          {/* ==================================
              CURRENT APPLICATION + WAITING LIST
          ================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">
            {/* CURRENT APPLICATION */}

            {loadingApplications ? (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <p className="text-gray-500">Loading application...</p>
              </div>
            ) : applicationError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6">
                <p className="text-red-600">{applicationError}</p>
              </div>
            ) : currentApplication ? (
              <ApplicationCard
                schemeName={
                  currentApplication.schemeId?.schemeName || "Housing Scheme"
                }
                applicationId={
                  currentApplication.applicationNumber || currentApplication._id
                }
                applicationMongoId={currentApplication._id}
                submittedDate={formatDate(
                  currentApplication.submittedAt ||
                    currentApplication.createdAt,
                )}
                status={getApplicationStatus(currentApplication.status)}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <p className="text-sm text-gray-500">Current Application</p>

                <h3 className="text-xl font-semibold text-gray-800 mt-1">
                  No applications yet
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  Apply for a housing scheme to track your application here.
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
                <p className="text-gray-500">Loading waiting list...</p>
              </div>
            ) : waitingListError ? (
              <div className="bg-white border border-red-200 rounded-xl p-6">
                <p className="text-red-600">{waitingListError}</p>
              </div>
            ) : currentWaitingList ? (
              <WaitingListCard
                schemeName={
                  currentWaitingList.schemeId?.schemeName || "Housing Scheme"
                }
                position={waitingPosition}
                totalApplicants="-"
                status="Active"
                lastUpdated={formatDate(
                  currentWaitingList.lastUpdated ||
                    currentWaitingList.updatedAt ||
                    currentWaitingList.createdAt,
                )}
              />
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-lg bg-gray-50 text-gray-500 flex items-center justify-center">
                    <FaClock />
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Waiting List</p>

                    <h3 className="text-lg font-semibold text-gray-800">
                      No Active Waiting List Entry
                    </h3>
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-5">
                  You are currently not on any active housing scheme waiting
                  list.
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

          {/* ==================================
    HOUSING ALLOTMENT
================================== */}

          {loadingAllotments ? (
            <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-56 animate-pulse rounded bg-gray-100" />
                </div>
              </div>
              <div className="mt-6 h-24 animate-pulse rounded-xl bg-gray-50" />
            </div>
          ) : currentAllotment ? (
            <section className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Header */}
              <div className="flex flex-col gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                    <FaHome className="text-xl" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Housing allotment
                    </p>
                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                      {currentAllotment.schemeId?.schemeName ||
                        "Housing Scheme"}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Your allotment information and documents
                    </p>
                  </div>
                </div>

                <span
                  className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${
                    currentAllotment.status === "ACCEPTED"
                      ? "bg-emerald-50 text-emerald-700"
                      : currentAllotment.status === "OFFERED"
                        ? "bg-blue-50 text-blue-700"
                        : currentAllotment.status === "REJECTED"
                          ? "bg-red-50 text-red-700"
                          : "bg-gray-100 text-gray-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${
                      currentAllotment.status === "ACCEPTED"
                        ? "bg-emerald-500"
                        : currentAllotment.status === "OFFERED"
                          ? "bg-blue-500"
                          : currentAllotment.status === "REJECTED"
                            ? "bg-red-500"
                            : "bg-gray-400"
                    }`}
                  />
                  {getAllotmentStatus(currentAllotment.status)}
                </span>
              </div>

              <div className="p-5 sm:p-6">
                {/* House highlight */}
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5">
                  <p className="text-sm font-medium text-emerald-800">
                    {currentAllotment.status === "ACCEPTED"
                      ? "Your allotted house"
                      : currentAllotment.status === "OFFERED"
                        ? "House offered to you"
                        : "Previous allotment"}
                  </p>

                  <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h3 className="text-3xl font-bold tracking-tight text-gray-900">
                        {currentAllotment.houseNumber || "Not assigned"}
                      </h3>

                      <p className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="shrink-0 text-emerald-700" />
                        {[currentAllotment.location, currentAllotment.district]
                          .filter(Boolean)
                          .join(", ") || "Location not available"}
                      </p>
                    </div>

                    <div className="sm:text-right">
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        Allotment price
                      </p>
                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {Number(currentAllotment.price || 0).toLocaleString(
                          "en-IN",
                          {
                            style: "currency",
                            currency: "INR",
                            maximumFractionDigits: 2,
                          },
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-5">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Allotment details
                  </h3>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        House model
                      </p>
                      <p className="mt-2 break-words font-semibold text-gray-800">
                        {currentAllotment.houseModel ||
                          currentAllotment.schemeId?.houseModel ||
                          "Not specified"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        Application number
                      </p>
                      <p className="mt-2 break-words font-semibold text-gray-800">
                        {currentAllotment.applicationId?.applicationNumber ||
                          "Not available"}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        Offer date
                      </p>
                      <p className="mt-2 flex items-center gap-2 font-semibold text-gray-800">
                        <FaCalendarAlt className="text-gray-400" />
                        {formatDate(
                          currentAllotment.offeredAt ||
                            currentAllotment.createdAt,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 p-4">
                      <p className="text-xs font-medium text-gray-500">
                        Response date
                      </p>
                      <p className="mt-2 font-semibold text-gray-800">
                        {formatDate(currentAllotment.respondedAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Pending offer message */}
                {currentAllotment.status === "OFFERED" && (
                  <div className="mt-5 flex flex-col gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-blue-900">
                        Action required
                      </p>
                      <p className="mt-1 text-sm text-blue-800">
                        Review your house offer and accept or reject it from My
                        Allotments.
                      </p>
                    </div>

                    <Link
                      to="/dashboard/allotments"
                      className="inline-flex shrink-0 items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                    >
                      Respond to offer →
                    </Link>
                  </div>
                )}

                {currentAllotment.status === "ACCEPTED" && (
                  <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                    <p className="font-semibold text-emerald-900">
                      Allotment accepted
                    </p>
                    <p className="mt-1 text-sm text-emerald-800">
                      Your acceptance has been recorded. Download your allotment
                      copy for your records.
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs leading-5 text-gray-500">
                    Keep a copy of your allotment details for future reference.
                  </p>

                  {["OFFERED", "ACCEPTED"].includes(
                    currentAllotment.status,
                  ) && (
                    <button
                      type="button"
                      onClick={() => handleDownloadAllotment(currentAllotment)}
                      disabled={downloadingAllotmentId === currentAllotment._id}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <FaDownload />
                      {downloadingAllotmentId === currentAllotment._id
                        ? "Preparing PDF..."
                        : "Download Allotment Copy"}
                    </button>
                  )}
                </div>
              </div>
            </section>
          ) : !allotmentError ? (
            <section className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
                <FaHome className="text-2xl" />
              </div>
              <h2 className="mt-4 text-lg font-bold text-gray-900">
                No house allotment yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                Once a house is offered to you, its details and downloadable
                allotment copy will appear here.
              </p>
            </section>
          ) : null}

          {allotmentError && (
            <div
              role="alert"
              className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {allotmentError}
            </div>
          )}

          {/* ==================================
              APPLICATION PROGRESS
          ================================== */}

          {currentApplication &&
            currentApplication.status !== "REJECTED" &&
            currentApplication.status !== "WITHDRAWN" && (
              <div className="mt-6">
                <ApplicationProgress
                  currentStep={getProgressStep(
                    currentApplication.status,
                    !!currentWaitingList,
                    !!currentAllotment,
                  )}
                />
              </div>
            )}

          {/* ==================================
              RECENT APPLICATIONS + NOTIFICATIONS
          ================================== */}

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">
            {/* RECENT APPLICATIONS */}

            <div className="xl:col-span-2">
              {loadingApplications ? (
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <p className="text-gray-500">Loading applications...</p>
                </div>
              ) : applicationError ? (
                <div className="bg-white border border-red-200 rounded-xl p-6">
                  <p className="text-red-600">{applicationError}</p>
                </div>
              ) : (
                <RecentApplications applications={sortedApplications} />
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
                          currentApplication.createdAt,
                      )}
                      isNew={true}
                    />

                    {currentApplication.status === "UNDER_VERIFICATION" && (
                      <NotificationCard
                        type="info"
                        title="Application Under Verification"
                        message="Your submitted application is currently being reviewed."
                        date={formatDate(currentApplication.updatedAt)}
                      />
                    )}

                    {currentApplication.status === "ELIGIBLE" && (
                      <NotificationCard
                        type="success"
                        title="Application Eligible"
                        message="Your application has been verified and you are eligible for the housing scheme."
                        date={formatDate(
                          currentApplication.verifiedAt ||
                            currentApplication.updatedAt,
                        )}
                      />
                    )}

                    {currentApplication.status === "REJECTED" && (
                      <NotificationCard
                        type="rejected"
                        title="Application Rejected"
                        message={
                          currentApplication.verificationRemarks ||
                          "Your application was not approved for this housing scheme."
                        }
                        date={formatDate(
                          currentApplication.verifiedAt ||
                            currentApplication.updatedAt,
                        )}
                      />
                    )}

                    {currentApplication.status === "WITHDRAWN" && (
                      <NotificationCard
                        type="warning"
                        title="Application Withdrawn"
                        message="This housing application has been withdrawn."
                        date={formatDate(currentApplication.updatedAt)}
                      />
                    )}

                    {currentWaitingList && (
                      <NotificationCard
                        type="waiting"
                        title="Waiting List"
                        message={`You are currently ${
                          currentWaitingList.districtPosition
                            ? `position #${currentWaitingList.districtPosition}`
                            : "on the active waiting list"
                        } in your district.`}
                        date={formatDate(
                          currentWaitingList.lastUpdated ||
                            currentWaitingList.updatedAt,
                        )}
                      />
                    )}

                    {currentAllotment?.status === "OFFERED" && (
                      <NotificationCard
                        type="allotment"
                        title="House Allotment Offered"
                        message="A house has been offered to you. Please check My Allotments and respond to the offer."
                        date={formatDate(currentAllotment.offeredAt)}
                        isNew={true}
                      />
                    )}

                    {currentAllotment?.status === "ACCEPTED" && (
                      <NotificationCard
                        type="allotment"
                        title="House Allotment Accepted"
                        message="Your house allotment has been accepted successfully."
                        date={formatDate(currentAllotment.respondedAt)}
                      />
                    )}

                    {currentAllotment?.status === "REJECTED" && (
                      <NotificationCard
                        type="warning"
                        title="Allotment Offer Rejected"
                        message="The previous house allotment offer was rejected. You may remain eligible for a future allotment according to the waiting-list process."
                        date={formatDate(currentAllotment.respondedAt)}
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

          {/* ==================================
              HOUSING SCHEMES
          ================================== */}

          <div className="mt-8">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Housing Schemes
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Explore standard housing schemes available through the Housing
                  Board.
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
                <p className="text-gray-500">Loading housing schemes...</p>
              </div>
            ) : applicantSchemes.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  No housing schemes available
                </h3>

                <p className="text-sm text-gray-500 mt-2">
                  There are currently no standard housing schemes available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {applicantSchemes.slice(0, 3).map((scheme) => {
                  const alreadyApplied = applications.some((application) => {
                    const appliedSchemeId =
                      application.schemeId?._id || application.schemeId;

                    return String(appliedSchemeId) === String(scheme._id);
                  });

                  return (
                    <SchemeCard
                      key={scheme._id}
                      name={scheme.schemeName}
                      category={
                        scheme.eligibleIncomeCategories?.join(" / ") ||
                        "Not specified"
                      }
                      schemeId={scheme._id}
                      alreadyApplied={alreadyApplied}
                      maximumAnnualIncome={scheme.maximumAnnualIncome}
                      houseModel={scheme.houseModel}
                      price={scheme.price}
                      description={scheme.description}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default ApplicantDashboard;
