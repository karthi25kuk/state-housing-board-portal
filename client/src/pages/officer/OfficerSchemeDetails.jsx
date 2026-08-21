import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function OfficerSchemeDetails() {
  const { schemeId } = useParams();

  const [scheme, setScheme] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        const response = await fetch(
          `http://localhost:5000/api/schemes/${schemeId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          setError(data.message || "Failed to load scheme.");
          return;
        }

        setScheme(data.scheme);
      } catch (error) {
        console.error("Fetch scheme error:", error);
        setError("Unable to connect to the server.");
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">Loading scheme details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/officer/schemes"
            className="text-blue-600 font-medium"
          >
            &larr; Back to My Schemes
          </Link>

          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">Scheme not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <Link
          to="/officer/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to My Schemes
        </Link>

        {/* Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>
              <p className="text-sm text-gray-500">
                Housing Scheme
              </p>

              <h1 className="text-3xl font-bold text-gray-800 mt-1">
                {scheme.schemeName}
              </h1>

              <p className="text-gray-500 mt-2">
                {scheme.location}, {scheme.district}
              </p>
            </div>

            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                scheme.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : scheme.status === "UPCOMING"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {scheme.status}
            </span>

          </div>

        </div>

        {/* Description */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800">
            Scheme Description
          </h2>

          <p className="text-gray-600 mt-3 leading-relaxed">
            {scheme.description}
          </p>

        </div>

        {/* House Details */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Housing Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                House Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹{Number(scheme.price).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Total Units
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.totalUnits}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Available Units
              </p>

              <p className="font-semibold text-green-600 mt-1">
                {scheme.availableUnits}
              </p>
            </div>

          </div>

        </div>

        {/* Application Period */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Application Period
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Application Start
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {new Date(
                  scheme.applicationStartDate
                ).toLocaleDateString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Application End
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {new Date(
                  scheme.applicationEndDate
                ).toLocaleDateString("en-IN")}
              </p>
            </div>

          </div>

        </div>

        {/* Eligibility */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Eligible Income Categories
          </h2>

          <div className="flex flex-wrap gap-3">

            {scheme.eligibleIncomeCategories?.map((category) => (
              <span
                key={category}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
              >
                {category}
              </span>
            ))}

          </div>

        </div>

        {/* Scheme Metadata */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">

          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Scheme Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            <div>
              <p className="text-sm text-gray-500">
                Scheme ID
              </p>

              <p className="font-mono text-sm text-gray-700 mt-1 break-all">
                {scheme._id}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Created On
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {new Date(
                  scheme.createdAt
                ).toLocaleString("en-IN")}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Last Updated
              </p>

              <p className="font-medium text-gray-800 mt-1">
                {new Date(
                  scheme.updatedAt
                ).toLocaleString("en-IN")}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default OfficerSchemeDetails;