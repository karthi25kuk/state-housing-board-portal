import {
  FaUsers,
  FaFileAlt,
  FaClock,
  FaCheckCircle,
  FaBuilding,
  FaExclamationCircle,
} from "react-icons/fa";

function AdminDashboard() {
  const applications = [
    {
      id: "TNHB202600124",
      applicant: "Arun Kumar",
      scheme: "Chennai Urban Housing Scheme",
      date: "12 Aug 2026",
      status: "Pending",
    },
    {
      id: "TNHB202600118",
      applicant: "Priya S",
      scheme: "Madurai Housing Scheme",
      date: "11 Aug 2026",
      status: "Verified",
    },
    {
      id: "TNHB202600105",
      applicant: "Ravi Kumar",
      scheme: "Coimbatore Housing Scheme",
      date: "10 Aug 2026",
      status: "Approved",
    },
    {
      id: "TNHB202600097",
      applicant: "Meena R",
      scheme: "Salem Housing Scheme",
      date: "09 Aug 2026",
      status: "Pending",
    },
  ];

  const statusStyles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Verified: "bg-blue-100 text-blue-700",
    Approved: "bg-green-100 text-green-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">

          <div>
            <h1 className="text-xl font-bold text-blue-600">
              State Housing Board
            </h1>

            <p className="text-xs text-gray-500">
              Administration Portal
            </p>
          </div>

          <div className="flex items-center gap-4">

            <button className="relative text-gray-500 hover:text-blue-600">
              <FaExclamationCircle size={20} />

              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
                5
              </span>
            </button>

            <div>
              <p className="text-sm font-medium text-gray-800">
                Admin
              </p>

              <p className="text-xs text-gray-500">
                Administrator
              </p>
            </div>

          </div>

        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Heading */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Admin Dashboard
          </h2>

          <p className="text-gray-500 mt-1">
            Manage applications, housing schemes, and allotments.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Total Applicants
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  12,450
                </h3>
              </div>

              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <FaUsers />
              </div>

            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Total Applications
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  8,240
                </h3>
              </div>

              <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                <FaFileAlt />
              </div>

            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Pending Verification
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  1,240
                </h3>
              </div>

              <div className="w-11 h-11 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center">
                <FaClock />
              </div>

            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center">

              <div>
                <p className="text-sm text-gray-500">
                  Houses Allotted
                </p>

                <h3 className="text-2xl font-bold text-gray-800 mt-1">
                  3,850
                </h3>
              </div>

              <div className="w-11 h-11 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                <FaCheckCircle />
              </div>

            </div>
          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            Quick Actions
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <button className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition">
              <FaFileAlt className="text-blue-600 text-xl mb-3" />

              <h4 className="font-semibold text-gray-800">
                Review Applications
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Verify pending applications.
              </p>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition">
              <FaBuilding className="text-blue-600 text-xl mb-3" />

              <h4 className="font-semibold text-gray-800">
                Manage Schemes
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Add or update housing schemes.
              </p>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition">
              <FaClock className="text-blue-600 text-xl mb-3" />

              <h4 className="font-semibold text-gray-800">
                Waiting List
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Manage applicant waiting lists.
              </p>
            </button>

            <button className="bg-white border border-gray-200 rounded-xl p-5 text-left hover:shadow-md transition">
              <FaCheckCircle className="text-blue-600 text-xl mb-3" />

              <h4 className="font-semibold text-gray-800">
                Allotments
              </h4>

              <p className="text-sm text-gray-500 mt-1">
                Process housing allotments.
              </p>
            </button>

          </div>

        </div>

        {/* Recent Applications */}
        <div className="mt-8 bg-white border border-gray-200 rounded-xl shadow-sm">

          <div className="flex items-center justify-between p-6 border-b border-gray-100">

            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                Recent Applications
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                Recently submitted housing applications.
              </p>
            </div>

            <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
              View All →
            </button>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full text-sm">

              <thead className="bg-gray-50">

                <tr className="text-gray-500">

                  <th className="text-left px-6 py-3 font-medium">
                    Application ID
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Applicant
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Housing Scheme
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Date
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Status
                  </th>

                  <th className="text-left px-6 py-3 font-medium">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {applications.map((application) => (

                  <tr
                    key={application.id}
                    className="border-t border-gray-100 hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-medium text-gray-800">
                      {application.id}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {application.applicant}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {application.scheme}
                    </td>

                    <td className="px-6 py-4 text-gray-600">
                      {application.date}
                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          statusStyles[application.status]
                        }`}
                      >
                        {application.status}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <button className="text-blue-600 font-medium hover:text-blue-800">
                        Review
                      </button>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">

          {/* Pending Verification */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            <h3 className="text-lg font-semibold text-gray-800">
              Pending Verification
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Applications that require administrator review.
            </p>

            <div className="mt-5 flex items-center justify-between bg-yellow-50 rounded-lg p-4">

              <div>
                <p className="text-sm text-gray-600">
                  Applications awaiting verification
                </p>

                <p className="text-2xl font-bold text-yellow-700 mt-1">
                  1,240
                </p>
              </div>

              <button className="text-sm font-medium text-yellow-700">
                Review →
              </button>

            </div>

          </div>

          {/* Housing Schemes */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">

            <h3 className="text-lg font-semibold text-gray-800">
              Housing Schemes
            </h3>

            <p className="text-sm text-gray-500 mt-1">
              Overview of currently active housing schemes.
            </p>

            <div className="mt-5 flex items-center justify-between bg-blue-50 rounded-lg p-4">

              <div>
                <p className="text-sm text-gray-600">
                  Active Housing Schemes
                </p>

                <p className="text-2xl font-bold text-blue-700 mt-1">
                  24
                </p>
              </div>

              <button className="text-sm font-medium text-blue-700">
                Manage →
              </button>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default AdminDashboard;