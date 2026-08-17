import {
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaListOl,
} from "react-icons/fa";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import StatCard from "../../components/dashboard/StatCard";
import ApplicationCard from "../../components/dashboard/ApplicationCard";
import ApplicationProgress from "../../components/dashboard/ApplicationProgress";
import NotificationCard from "../../components/dashboard/NotificationCard";
import RecentApplications from "../../components/dashboard/RecentApplications";
import SchemeCard from "../../components/dashboard/SchemeCard";
import WaitingListCard from "../../components/dashboard/WaitingListCard";

function ApplicantDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">

        {/* Topbar */}
        <Topbar />

        <main className="p-6">

          {/* Welcome */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome back, Karthikeyan
            </h1>

            <p className="text-gray-500 mt-1">
              Here's an overview of your housing applications.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <StatCard
              title="Applications"
              value="2"
              icon={<FaFileAlt />}
              description="Total applications submitted"
            />

            <StatCard
              title="Pending"
              value="1"
              icon={<FaClock />}
              description="Applications under review"
            />

            <StatCard
              title="Approved"
              value="0"
              icon={<FaCheckCircle />}
              description="Approved applications"
            />

            <StatCard
              title="Waiting Position"
              value="#24"
              icon={<FaListOl />}
              description="Current waiting list position"
            />

          </div>

          {/* Current Application + Waiting List */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mt-6">

            <ApplicationCard
              schemeName="Chennai Urban Housing Scheme"
              applicationId="TNHB202600124"
              submittedDate="10 Aug 2026"
              status="Under Verification"
            />

            <WaitingListCard
              schemeName="Chennai Urban Housing Scheme"
              position="24"
              totalApplicants="180"
              status="Active"
              lastUpdated="12 Aug 2026"
            />

          </div>

          {/* Application Progress */}
          <div className="mt-6">
            <ApplicationProgress currentStep={2} />
          </div>

          {/* Recent Applications + Notifications */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-6">

            {/* Recent Applications */}
            <div className="xl:col-span-2">
              <RecentApplications />
            </div>

            {/* Notifications */}
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

                <NotificationCard
                  type="success"
                  title="Application Submitted"
                  message="Your housing application has been successfully submitted."
                  date="Today, 10:30 AM"
                  isNew={true}
                />

                <NotificationCard
                  type="warning"
                  title="Document Required"
                  message="Please upload your income certificate for verification."
                  date="Yesterday"
                />

                <NotificationCard
                  type="info"
                  title="Application Under Verification"
                  message="Your submitted documents are currently being reviewed."
                  date="2 days ago"
                />

              </div>

              <div className="p-4 border-t border-gray-100 text-center">
                <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                  View All Notifications →
                </button>
              </div>

            </div>

          </div>

          {/* Available Housing Schemes */}
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

              <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
                View All →
              </button>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              <SchemeCard
                name="Chennai Urban Housing Scheme"
                location="Chennai"
                units="250"
                category="LIG / MIG"
                deadline="30 Sep 2026"
              />

              <SchemeCard
                name="Madurai Housing Scheme"
                location="Madurai"
                units="180"
                category="EWS / LIG"
                deadline="15 Oct 2026"
              />

              <SchemeCard
                name="Coimbatore Housing Scheme"
                location="Coimbatore"
                units="120"
                category="MIG"
                deadline="25 Oct 2026"
              />

            </div>

          </div>

        </main>

      </div>

    </div>
  );
}

export default ApplicantDashboard;