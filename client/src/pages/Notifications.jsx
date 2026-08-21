import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Notifications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================
  // FETCH APPLICATIONS
  // ==========================================

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
            data.message || "Failed to fetch notifications."
          );
          return;
        }

        setApplications(data.applications || []);
      } catch (error) {
        console.error("Fetch notifications error:", error);

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
  // CREATE NOTIFICATIONS
  // ==========================================

  const generateNotifications = () => {
    const notifications = [];

    applications.forEach((application) => {
      const applicationNumber =
        application.applicationNumber || "Application";

      const schemeName =
        application.schemeId?.schemeName ||
        application.scheme?.schemeName ||
        "Housing Scheme";

      // ------------------------------------------
      // Application Submitted
      // ------------------------------------------

      if (application.submittedAt || application.createdAt) {
        notifications.push({
          id: `${application._id}-submitted`,
          type: "success",
          title: "Application Submitted",
          message: `Your application ${applicationNumber} for ${schemeName} has been submitted successfully.`,
          date:
            application.submittedAt ||
            application.createdAt,
        });
      }

      // ------------------------------------------
      // Under Verification
      // ------------------------------------------

      if (application.status === "UNDER_VERIFICATION") {
        notifications.push({
          id: `${application._id}-verification`,
          type: "info",
          title: "Application Under Verification",
          message: `Your application ${applicationNumber} is currently under verification.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Eligible
      // ------------------------------------------

      if (application.status === "ELIGIBLE") {
        notifications.push({
          id: `${application._id}-eligible`,
          type: "success",
          title: "Application Eligible",
          message: `Your application ${applicationNumber} for ${schemeName} has been verified and marked eligible.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Waiting List
      // ------------------------------------------

      if (application.status === "WAITING_LIST") {
        notifications.push({
          id: `${application._id}-waiting`,
          type: "warning",
          title: "Added to Waiting List",
          message: `Your application ${applicationNumber} has been added to the waiting list for ${schemeName}.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Allotment Offered
      // ------------------------------------------

      if (application.status === "ALLOTMENT_OFFERED") {
        notifications.push({
          id: `${application._id}-offer`,
          type: "success",
          title: "House Allotment Offered",
          message: `A house allotment has been offered for your application ${applicationNumber}.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Allotted
      // ------------------------------------------

      if (application.status === "ALLOTTED") {
        notifications.push({
          id: `${application._id}-allotted`,
          type: "success",
          title: "House Allotted",
          message: `Congratulations! A house has been allotted to you under ${schemeName}.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Rejected
      // ------------------------------------------

      if (
        application.status === "REJECTED" ||
        application.status === "INELIGIBLE"
      ) {
        notifications.push({
          id: `${application._id}-rejected`,
          type: "error",
          title: "Application Rejected",
          message: `Your application ${applicationNumber} was not approved for ${schemeName}.`,
          date: application.updatedAt,
        });
      }

      // ------------------------------------------
      // Withdrawn
      // ------------------------------------------

      if (application.status === "WITHDRAWN") {
        notifications.push({
          id: `${application._id}-withdrawn`,
          type: "warning",
          title: "Application Withdrawn",
          message: `Your application ${applicationNumber} has been withdrawn.`,
          date: application.updatedAt,
        });
      }
    });

    // ==========================================
    // SORT NEWEST FIRST
    // ==========================================

    notifications.sort(
      (a, b) =>
        new Date(b.date || 0) -
        new Date(a.date || 0)
    );

    return notifications;
  };

  const notifications = generateNotifications();

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
        };

      case "info":
        return {
          container:
            "bg-blue-50 border-blue-200",
          icon:
            "bg-blue-100 text-blue-600",
          title:
            "text-blue-800",
        };

      case "warning":
        return {
          container:
            "bg-yellow-50 border-yellow-200",
          icon:
            "bg-yellow-100 text-yellow-600",
          title:
            "text-yellow-800",
        };

      case "error":
        return {
          container:
            "bg-red-50 border-red-200",
          icon:
            "bg-red-100 text-red-600",
          title:
            "text-red-800",
        };

      default:
        return {
          container:
            "bg-gray-50 border-gray-200",
          icon:
            "bg-gray-100 text-gray-600",
          title:
            "text-gray-800",
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

        {/* Header */}

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
              View all updates related to your housing applications.
            </p>

          </div>

        </div>


        {/* Notification Count */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">

          <p className="text-sm text-gray-500">
            Total Notifications
          </p>

          <p className="text-2xl font-bold text-gray-800 mt-1">
            {notifications.length}
          </p>

        </div>


        {/* Empty State */}

        {notifications.length === 0 ? (

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-10 text-center">

            <h2 className="text-lg font-semibold text-gray-800">
              No Notifications
            </h2>

            <p className="text-gray-500 mt-2">
              You currently have no application updates.
            </p>

          </div>

        ) : (

          /* All Notifications */

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

                    {/* Icon */}

                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${style.icon}`}
                    >
                      ✓
                    </div>


                    {/* Content */}

                    <div className="flex-1">

                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">

                        <h3
                          className={`font-semibold ${style.title}`}
                        >
                          {notification.title}
                        </h3>

                        <span className="text-xs text-gray-500">
                          {formatDate(notification.date)}
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