import { Link } from "react-router-dom";

function OfficerDashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800">Officer Dashboard</h1>

      <p className="text-gray-600 mt-2">
        Manage housing schemes, applications, waiting lists, and allotments for
        your district.
      </p>

      <Link
        to="/officer/create-scheme"
        className="inline-block mt-6 bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700"
      >
        + Create Housing Scheme
      </Link>

      <Link
        to="/officer/schemes"
        className="bg-white border border-gray-300 text-gray-700 px-5 py-3 rounded-lg hover:bg-gray-50"
      >
        View My Schemes
      </Link>
    </div>
  );
}

export default OfficerDashboard;
