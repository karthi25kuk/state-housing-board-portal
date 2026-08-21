import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getSchemeById } from "../../services/schemeService";

function ApplyScheme() {
  const { schemeId } = useParams();
  const navigate = useNavigate();

  const [scheme, setScheme] = useState(null);

  const [familyMembers, setFamilyMembers] = useState("");
  const [annualIncome, setAnnualIncome] = useState("");
  const [incomeCategory, setIncomeCategory] = useState("");
  const [employmentStatus, setEmploymentStatus] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // FETCH SCHEME
  // ==========================================

  useEffect(() => {
    const fetchScheme = async () => {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        if (!token) {
          setError("Your session has expired. Please login again.");
          return;
        }

        if (!schemeId) {
          setError("Invalid housing scheme.");
          return;
        }

        const data = await getSchemeById(token, schemeId);

        if (!data) {
          setError("Housing scheme not found.");
          return;
        }

        setScheme(data);
      } catch (error) {
        console.error("Fetch scheme error:", error);

        setError(
          error.message || "Unable to load housing scheme."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchScheme();
  }, [schemeId]);

  // ==========================================
  // SUBMIT APPLICATION
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const token = localStorage.getItem("token");

    if (!token) {
      setError("Your session has expired. Please login again.");
      return;
    }

    // ------------------------------------------
    // Validate form
    // ------------------------------------------

    if (
      !familyMembers ||
      !annualIncome ||
      !incomeCategory ||
      !employmentStatus
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(familyMembers) < 1) {
      setError("Family members must be at least 1.");
      return;
    }

    if (Number(annualIncome) < 0) {
      setError("Annual income cannot be negative.");
      return;
    }

    if (!scheme) {
      setError("Housing scheme details are unavailable.");
      return;
    }

    // ------------------------------------------
    // Check scheme status
    // ------------------------------------------

    if (scheme.status !== "OPEN") {
      setError(
        "Applications are currently not open for this scheme."
      );
      return;
    }

    // ------------------------------------------
    // Check available houses
    // ------------------------------------------

    if (
      scheme.availableUnits !== undefined &&
      Number(scheme.availableUnits) <= 0
    ) {
      setError("No houses are currently available in this scheme.");
      return;
    }

    // ------------------------------------------
    // Submit application
    // ------------------------------------------

    try {
      setSubmitting(true);

      const response = await fetch(
        "http://localhost:5000/api/applications",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            schemeId,
            familyMembers: Number(familyMembers),
            annualIncome: Number(annualIncome),
            incomeCategory,
            employmentStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Unable to submit housing application."
        );
        return;
      }

      setSuccess(
        data.message ||
          "Housing application submitted successfully."
      );

      // Clear form
      setFamilyMembers("");
      setAnnualIncome("");
      setIncomeCategory("");
      setEmploymentStatus("");

      // Redirect after successful submission
      setTimeout(() => {
        navigate("/applicant/applications");
      }, 1500);
    } catch (error) {
      console.error("Create application error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-gray-600">
            Loading scheme details...
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // SCHEME ERROR
  // ==========================================

  if (!scheme) {
    return (
      <section className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <Link
            to="/applicant/schemes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Housing Schemes
          </Link>

          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-6 mt-6">
            {error || "Housing scheme not found."}
          </div>
        </div>
      </section>
    );
  }

  // ==========================================
  // MAIN PAGE
  // ==========================================

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Back */}
        <Link
          to="/applicant/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Housing Schemes
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-5">
          <p className="text-sm text-blue-600 font-medium">
            Housing Application
          </p>

          <h1 className="text-2xl font-bold text-gray-800 mt-1">
            Apply for Housing Scheme
          </h1>

          <p className="text-gray-500 mt-2">
            Complete the following details to submit your application.
          </p>
        </div>

        {/* Selected Scheme */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-5">

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">

            <div>
              <p className="text-sm text-blue-600 font-medium">
                Selected Scheme
              </p>

              <h2 className="text-xl font-semibold text-gray-800 mt-1">
                {scheme.schemeName}
              </h2>

              <p className="text-sm text-gray-600 mt-1">
                {scheme.district}
                {scheme.location
                  ? ` · ${scheme.location}`
                  : ""}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                scheme.status === "OPEN"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {scheme.status}
            </span>
          </div>

          {/* Scheme Information */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-5">

            <div>
              <p className="text-xs text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {scheme.price !== undefined
                  ? Number(scheme.price).toLocaleString("en-IN")
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">
                Available Units
              </p>

              <p
                className={`font-semibold mt-1 ${
                  Number(scheme.availableUnits) > 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {scheme.availableUnits ?? "-"}
              </p>
            </div>

          </div>
        </div>

        {/* Application Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mt-5"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            Applicant Details
          </h2>

          <p className="text-sm text-gray-500 mt-1 mb-6">
            Provide the information required for eligibility verification.
          </p>

          {/* Family Members */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Family Members
            </label>

            <input
              type="number"
              min="1"
              value={familyMembers}
              onChange={(e) => setFamilyMembers(e.target.value)}
              placeholder="Enter number of family members"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Annual Income */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Annual Family Income
            </label>

            <input
              type="number"
              min="0"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(e.target.value)}
              placeholder="Enter annual income"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {/* Income Category */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Income Category
            </label>

            <select
              value={incomeCategory}
              onChange={(e) => setIncomeCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">
                Select income category
              </option>

              <option value="EWS">EWS</option>
              <option value="LIG">LIG</option>
              <option value="MIG">MIG</option>
              <option value="HIG">HIG</option>
            </select>
          </div>

          {/* Employment Status */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Employment Status
            </label>

            <select
              value={employmentStatus}
              onChange={(e) => setEmploymentStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-white outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">
                Select employment status
              </option>

              <option value="EMPLOYED">
                Employed
              </option>

              <option value="SELF_EMPLOYED">
                Self Employed
              </option>

              <option value="UNEMPLOYED">
                Unemployed
              </option>

              <option value="RETIRED">
                Retired
              </option>

              <option value="OTHER">
                Other
              </option>
            </select>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg p-4 mb-5 text-sm">
              {success}
            </div>
          )}

          {/* Declaration */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              I confirm that the information provided in this application
              is true and correct. I understand that the Housing Board may
              verify the submitted information before considering my
              application for allotment.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={
              submitting ||
              scheme.status !== "OPEN" ||
              Number(scheme.availableUnits) <= 0
            }
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {submitting
              ? "Submitting Application..."
              : scheme.status !== "OPEN"
              ? "Applications Closed"
              : Number(scheme.availableUnits) <= 0
              ? "No Houses Available"
              : "Submit Housing Application"}
          </button>
        </form>
      </div>
    </section>
  );
}

export default ApplyScheme;