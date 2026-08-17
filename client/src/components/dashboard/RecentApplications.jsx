import { FaEye } from "react-icons/fa";

function RecentApplications() {
  const applications = [
    {
      id: "TNHB202600124",
      scheme: "Chennai Urban Housing Scheme",
      date: "10 Aug 2026",
      status: "Under Verification",
    },
    {
      id: "TNHB202600098",
      scheme: "Madurai Housing Scheme",
      date: "02 Aug 2026",
      status: "Pending",
    },
    {
      id: "TNHB202600075",
      scheme: "Coimbatore Housing Scheme",
      date: "25 Jul 2026",
      status: "Approved",
    },
  ];

  const statusStyles = {
    Approved: "bg-green-100 text-green-700",
    Pending: "bg-yellow-100 text-yellow-700",
    "Under Verification": "bg-blue-100 text-blue-700",
    Rejected: "bg-red-100 text-red-700",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm">

      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">

        <div>
          <h3 className="text-lg font-semibold text-gray-800">
            Recent Applications
          </h3>

          <p className="text-sm text-gray-500 mt-1">
            Overview of your recently submitted applications.
          </p>
        </div>

        <button className="text-sm text-blue-600 font-medium hover:text-blue-800">
          View All
        </button>

      </div>

      {/* Table */}
      <div className="overflow-x-auto">

        <table className="w-full text-sm">

          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-6 py-3 font-medium">
                Application ID
              </th>

              <th className="text-left px-6 py-3 font-medium">
                Housing Scheme
              </th>

              <th className="text-left px-6 py-3 font-medium">
                Submitted
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
                  {application.scheme}
                </td>

                <td className="px-6 py-4 text-gray-600">
                  {application.date}
                </td>

                <td className="px-6 py-4">

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      statusStyles[application.status] ||
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {application.status}
                  </span>

                </td>

                <td className="px-6 py-4">

                  <button
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <FaEye />
                    View
                  </button>

                </td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default RecentApplications;