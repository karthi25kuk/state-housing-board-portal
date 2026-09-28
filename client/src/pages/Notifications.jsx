import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getMyApplications,
} from "../services/applicationService";

import {
  getMyWaitingLists,
} from "../services/waitingListService";

function Notifications() {
  const { token } = useAuth();

  const [applications, setApplications] = useState([]);
  const [waitingLists, setWaitingLists] = useState([]);
  const [allotments, setAllotments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH ALL USER ACTIVITY
  // ==========================================

  useEffect(() => {
    const fetchNotificationData = async () => {
      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [applicationResult, waitingListResult] =
          await Promise.all([
            getMyApplications(token),
            getMyWaitingLists(token),
          ]);

        setApplications(applicationResult || []);
        setWaitingLists(waitingListResult || []);

        // Allotment endpoint
        const allotmentResponse = await fetch(
          "http://localhost:5000/api/allotments/my",
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        let allotmentData = {};

        try {
          allotmentData = await allotmentResponse.json();
        } catch {
          allotmentData = {};
        }

        if (!allotmentResponse.ok) {
          throw new Error(
            allotmentData.message ||
              "Failed to fetch allotment updates."
          );
        }

        setAllotments(
          allotmentData.allotments || []
        );
      } catch (error) {
        console.error(
          "Fetch notifications error:",
          error
        );

        setError(
          error.message ||
            "Unable to connect to the server. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNotificationData();
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
  // NOTIFICATION GENERATOR
  // ==========================================

  const notifications = useMemo(() => {
    const result = [];

    // ==========================================
    // APPLICATION NOTIFICATIONS
    // ==========================================

    applications.forEach((application) => {
      const applicationId =
        application._id;

      const applicationNumber =
        application.applicationNumber ||
        "Application";

      const schemeName =
        application.schemeId?.schemeName ||
        "Housing Scheme";

      // ----------------------------------------
      // APPLICATION SUBMITTED
      // ----------------------------------------

      if (
        application.submittedAt ||
        application.createdAt
      ) {
        result.push({
          id: `${applicationId}-submitted`,
          type: "success",
          title: "Application Submitted",
          message: `Your application ${applicationNumber} for ${schemeName} has been submitted successfully.`,
          date:
            application.submittedAt ||
            application.createdAt,
        });
      }

      // ----------------------------------------
      // UNDER VERIFICATION
      // ----------------------------------------

      if (
        application.status ===
        "UNDER_VERIFICATION"
      ) {
        result.push({
          id: `${applicationId}-verification`,
          type: "info",
          title: "Application Under Verification",
          message: `Your application ${applicationNumber} is currently under verification.`,
          date:
            application.updatedAt ||
            application.verifiedAt,
        });
      }

      // ----------------------------------------
      // ELIGIBLE
      // ----------------------------------------

      if (
        application.status === "ELIGIBLE"
      ) {
        result.push({
          id: `${applicationId}-eligible`,
          type: "success",
          title: "Application Eligible",
          message: `Your application ${applicationNumber} for ${schemeName} has been verified and marked eligible.`,
          date:
            application.verifiedAt ||
            application.updatedAt,
        });
      }

      // ----------------------------------------
      // REJECTED
      // ----------------------------------------

      if (
        application.status === "REJECTED"
      ) {
        result.push({
          id: `${applicationId}-rejected`,
          type: "error",
          title: "Application Rejected",
          message:
            application.verificationRemarks
              ? `Your application ${applicationNumber} was rejected. Reason: ${application.verificationRemarks}`
              : `Your application ${applicationNumber} was not approved for ${schemeName}.`,
          date:
            application.verifiedAt ||
            application.updatedAt,
        });
      }

      // ----------------------------------------
      // WITHDRAWN
      // ----------------------------------------

      if (
        application.status === "WITHDRAWN"
      ) {
        result.push({
          id: `${applicationId}-withdrawn`,
          type: "warning",
          title: "Application Withdrawn",
          message: `Your application ${applicationNumber} for ${schemeName} has been withdrawn.`,
          date: application.updatedAt,
        });
      }
    });

    // ==========================================
    // WAITING LIST NOTIFICATIONS
    // ==========================================

    waitingLists.forEach((waitingList) => {
      const waitingListId =
        waitingList._id;

      const schemeName =
        waitingList.schemeId?.schemeName ||
        "Housing Scheme";

      const position =
        waitingList.districtPosition || "-";

      // ----------------------------------------
      // ACTIVE WAITING LIST
      // ----------------------------------------

      if (
        waitingList.status === "ACTIVE"
      ) {
        result.push({
          id: `${waitingListId}-active`,
          type: "warning",
          title: "Added to District Waiting List",
          message: `You are currently at district position #${position} for ${schemeName}.`,
          date:
            waitingList.lastUpdated ||
            waitingList.updatedAt ||
            waitingList.createdAt,
        });
      }

      // ----------------------------------------
      // REMOVED WAITING LIST
      // ----------------------------------------

      if (
        waitingList.status === "REMOVED"
      ) {
        let message =
          `Your waiting-list entry for ${schemeName} is no longer active.`;

        if (
          waitingList.removalReason ===
          "ALLOTMENT_ACCEPTED"
        ) {
          message =
            `Your waiting-list entry for ${schemeName} was removed because an allotment was accepted.`;
        } else if (
          waitingList.removalReason ===
          "ALLOTMENT_REJECTED"
        ) {
          message =
            `Your previous waiting-list entry for ${schemeName} was updated after an allotment offer was rejected.`;
        } else if (
          waitingList.removalReason ===
          "ALLOTTED_FROM_OTHER_SCHEME"
        ) {
          message =
            `Your waiting-list entry for ${schemeName} was removed because a house was allotted to you under another scheme.`;
        } else if (
          waitingList.removalReason ===
          "APPLICATION_REJECTED"
        ) {
          message =
            `Your waiting-list entry for ${schemeName} was removed because the application was rejected.`;
        } else if (
          waitingList.removalReason ===
          "APPLICATION_WITHDRAWN"
        ) {
          message =
            `Your waiting-list entry for ${schemeName} was removed because the application was withdrawn.`;
        }

        result.push({
          id: `${waitingListId}-removed`,
          type: "info",
          title: "Waiting List Updated",
          message,
          date:
            waitingList.removedAt ||
            waitingList.lastUpdated ||
            waitingList.updatedAt,
        });
      }
    });

    // ==========================================
    // ALLOTMENT NOTIFICATIONS
    // ==========================================

    allotments.forEach((allotment) => {
      const allotmentId =
        allotment._id;

      const applicationNumber =
        allotment.applicationId?.applicationNumber ||
        "your application";

      const schemeName =
        allotment.schemeId?.schemeName ||
        "Housing Scheme";

      // ----------------------------------------
      // OFFERED
      // ----------------------------------------

      if (
        allotment.status === "OFFERED"
      ) {
        result.push({
          id: `${allotmentId}-offered`,
          type: "success",
          title: "House Allotment Offered",
          message: `A house has been offered to you under ${schemeName} for ${applicationNumber}. Please review and respond to the offer.`,
          date: allotment.offeredAt,
        });
      }

      // ----------------------------------------
      // ACCEPTED
      // ----------------------------------------

      if (
        allotment.status === "ACCEPTED"
      ) {
        result.push({
          id: `${allotmentId}-accepted`,
          type: "success",
          title: "House Allotment Accepted",
          message: `Your house allotment under ${schemeName} has been accepted successfully. House number: ${
            allotment.houseNumber || "-"
          }.`,
          date:
            allotment.respondedAt ||
            allotment.offeredAt,
        });
      }

      // ----------------------------------------
      // REJECTED
      // ----------------------------------------

      if (
        allotment.status === "REJECTED"
      ) {
        result.push({
          id: `${allotmentId}-rejected`,
          type: "warning",
          title: "Allotment Offer Rejected",
          message: `The house allotment offer under ${schemeName} was rejected. The house has been returned to available inventory.`,
          date:
            allotment.respondedAt ||
            allotment.offeredAt,
        });
      }

      // ----------------------------------------
      // CANCELLED
      // ----------------------------------------

      if (
        allotment.status === "CANCELLED"
      ) {
        result.push({
          id: `${allotmentId}-cancelled`,
          type: "error",
          title: "Allotment Cancelled",
          message: `The housing allotment under ${schemeName} has been cancelled.`,
          date:
            allotment.respondedAt ||
            allotment.offeredAt,
        });
      }
    });

    // ==========================================
    // SORT NEWEST FIRST
    // ==========================================

    result.sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );

    return result;
  }, [
    applications,
    waitingLists,
    allotments,
  ]);

  // ==========================================
  // NOTIFICATION STYLE
  // ==========================================

  const getNotificationStyle = (type) => {
    switch (type) {
      case "success":
        return {
          container:
            "bg-green-50 border-green-200",
          icon:
            "bg-green-100 text-green-600",
          title:
            "text-green-800",
          symbol: "✓",
        };

      case "info":
        return {
          container:
            "bg-blue-50 border-blue-200",
          icon:
            "bg-blue-100 text-blue-600",
          title:
            "text-blue-800",
          symbol: "i",
        };

      case "warning":
        return {
          container:
            "bg-yellow-50 border-yellow-200",
          icon:
            "bg-yellow-100 text-yellow-600",
          title:
            "text-yellow-800",
          symbol: "!",
        };

      case "error":
        return {
          container:
            "bg-red-50 border-red-200",
          icon:
            "bg-red-100 text-red-600",
          title:
            "text-red-800",
          symbol: "×",
        };

      default:
        return {
          container:
            "bg-gray-50 border-gray-200",
          icon:
            "bg-gray-100 text-gray-600",
          title:
            "text-gray-800",
          symbol: "•",
        };
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
            Loading notifications...
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
        <div className="max-w-5xl mx-auto">
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

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
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
              Notifications
            </h1>

            <p className="text-gray-500 mt-1">
              View all updates related to your housing
              applications, waiting lists and allotments.
            </p>
          </div>
        </div>

        {/* NOTIFICATION COUNT */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
          <p className="text-sm text-gray-500">
            Total Notifications
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {notifications.length}
          </p>
        </div>

        {/* EMPTY STATE */}

        {notifications.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              No Notifications
            </h2>

            <p className="text-gray-500 mt-2">
              You currently have no application, waiting-list
              or allotment updates.
            </p>

            <Link
              to="/applicant/schemes"
              className="inline-block mt-5 text-blue-600 font-medium hover:text-blue-800"
            >
              Explore Housing Schemes →
            </Link>
          </div>
        ) : (
          /* ALL NOTIFICATIONS */

          <div className="space-y-4">
            {notifications.map((notification) => {
              const style =
                getNotificationStyle(
                  notification.type
                );

              return (
                <div
                  key={notification.id}
                  className={`border rounded-xl p-5 ${style.container}`}
                >
                  <div className="flex gap-4">
                    {/* ICON */}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-bold ${style.icon}`}
                    >
                      {style.symbol}
                    </div>

                    {/* CONTENT */}

                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                        <h3
                          className={`font-semibold ${style.title}`}
                        >
                          {notification.title}
                        </h3>

                        <span className="text-xs text-gray-500">
                          {formatDate(
                            notification.date
                          )}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mt-2">
                        {notification.message}
                      </p>
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

export default Notifications;