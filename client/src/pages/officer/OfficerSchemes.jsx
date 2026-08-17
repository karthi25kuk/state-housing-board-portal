import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function OfficerSchemes() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSchemes = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:5000/api/schemes/officer",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to load schemes.");
        return;
      }

      setSchemes(data.schemes || []);
    } catch (error) {
      console.error(error);
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleOpenScheme = async (schemeId) => {
    const confirmOpen = window.confirm(
      "Are you sure you want to open this scheme for applications?"
    );

    if (!confirmOpen) {
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `http://localhost:5000/api/schemes/${schemeId}/open`,
        {
          method: "PATCH",

          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to open scheme.");
        return;
      }

      alert("Scheme is now open for applications.");

      fetchSchemes();
    } catch (error) {
      console.error(error);
      alert("Unable to connect to the server.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <p className="text-gray-600">
          Loading schemes...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          <div>
            <Link
              to="/officer"
              className="text-blue-600 text-sm font-medium"
            >
              &larr; Dashboard
            </Link>

            <h1 className="text-3xl font-bold text-gray-800 mt-2">
              My Housing Schemes
            </h1>

            <p className="text-gray-500 mt-1">
              Manage housing schemes for your district.
            </p>
          </div>

          <Link
            to="/officer/create-scheme"
            className="bg-blue-600 text-white px-5 py-3 rounded-lg hover:bg-blue-700 text-center"
          >
            + Create Scheme
          </Link>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Empty */}
        {!error && schemes.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No schemes found
            </h2>

            <p className="text-gray-500 mt-2">
              Create your first housing scheme for your district.
            </p>

            <Link
              to="/officer/create-scheme"
              className="inline-block mt-5 bg-blue-600 text-white px-5 py-3 rounded-lg"
            >
              Create Scheme
            </Link>

          </div>
        )}

        {/* Scheme Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {schemes.map((scheme) => (

            <div
              key={scheme._id}
              className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >

              {/* Title */}
              <div className="flex items-start justify-between gap-4">

                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {scheme.schemeName}
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    {scheme.location}
                  </p>
                </div>

                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    scheme.status === "OPEN"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {scheme.status}
                </span>

              </div>

              {/* Description */}
              <p className="text-gray-600 mt-4 text-sm">
                {scheme.description}
              </p>

              {/* Details */}
              <div className="grid grid-cols-2 gap-4 mt-6">

                <div>
                  <p className="text-xs text-gray-500">
                    House Model
                  </p>

                  <p className="font-medium text-gray-800">
                    {scheme.houseModel}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Price
                  </p>

                  <p className="font-medium text-gray-800">
                    ₹{Number(scheme.price).toLocaleString("en-IN")}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Total Houses
                  </p>

                  <p className="font-medium text-gray-800">
                    {scheme.totalUnits}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500">
                    Available Houses
                  </p>

                  <p className="font-medium text-gray-800">
                    {scheme.availableUnits}
                  </p>
                </div>

              </div>

              {/* Dates */}
              <div className="border-t border-gray-100 mt-6 pt-5">

                <div className="grid grid-cols-2 gap-4">

                  <div>
                    <p className="text-xs text-gray-500">
                      Applications Open
                    </p>

                    <p className="text-sm font-medium text-gray-700">
                      {new Date(
                        scheme.applicationStartDate
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-gray-500">
                      Applications Close
                    </p>

                    <p className="text-sm font-medium text-gray-700">
                      {new Date(
                        scheme.applicationEndDate
                      ).toLocaleDateString("en-IN")}
                    </p>
                  </div>

                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">

                <Link
                  to={`/officer/schemes/${scheme._id}`}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                >
                  View
                </Link>

                {scheme.status === "UPCOMING" && (
                  <button
                    onClick={() =>
                      handleOpenScheme(scheme._id)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Open Applications
                  </button>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default OfficerSchemes;