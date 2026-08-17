import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateScheme() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    schemeName: "",
    description: "",
    location: "",
    houseModel: "",
    price: "",
    totalUnits: "",
    applicationStartDate: "",
    applicationEndDate: "",
    eligibleIncomeCategories: [],
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      if (checked) {
        return {
          ...prev,
          eligibleIncomeCategories: [
            ...prev.eligibleIncomeCategories,
            value,
          ],
        };
      }

      return {
        ...prev,
        eligibleIncomeCategories:
          prev.eligibleIncomeCategories.filter(
            (category) => category !== value
          ),
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !formData.schemeName ||
      !formData.description ||
      !formData.location ||
      !formData.houseModel ||
      !formData.price ||
      !formData.totalUnits ||
      !formData.applicationStartDate ||
      !formData.applicationEndDate
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (
      new Date(formData.applicationStartDate) >=
      new Date(formData.applicationEndDate)
    ) {
      setError(
        "Application end date must be after start date."
      );
      return;
    }

    if (formData.eligibleIncomeCategories.length === 0) {
      setError(
        "Please select at least one eligible income category."
      );
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      if (!token) {
        setError("Your session has expired. Please login again.");
        return;
      }

      const response = await fetch(
        "http://localhost:5000/api/schemes",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            schemeName: formData.schemeName,
            description: formData.description,
            location: formData.location,
            houseModel: formData.houseModel,
            price: Number(formData.price),
            totalUnits: Number(formData.totalUnits),
            applicationStartDate:
              formData.applicationStartDate,
            applicationEndDate:
              formData.applicationEndDate,
            eligibleIncomeCategories:
              formData.eligibleIncomeCategories,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Failed to create housing scheme."
        );
        return;
      }

      setSuccess("Housing scheme created successfully.");

      setTimeout(() => {
        navigate("/officer/schemes");
      }, 1200);
    } catch (error) {
      console.error("Create scheme error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 py-10 px-4">

      <div className="max-w-4xl mx-auto">

        {/* Back */}
        <Link
          to="/officer"
          className="text-blue-600 hover:text-blue-800 font-medium inline-block mb-6"
        >
          &larr; Back to Dashboard
        </Link>

        {/* Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 sm:p-8">

          {/* Heading */}
          <div className="mb-8">

            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              Create Housing Scheme
            </h1>

            <p className="text-gray-500 mt-2">
              Add a new housing scheme for your district.
            </p>

          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-7"
          >

            {/* ============================= */}
            {/* BASIC INFORMATION */}
            {/* ============================= */}

            <div>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Scheme Information
              </h2>

              <div className="space-y-5">

                {/* Scheme Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scheme Name
                  </label>

                  <input
                    type="text"
                    name="schemeName"
                    value={formData.schemeName}
                    onChange={handleChange}
                    placeholder="Enter scheme name"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>

                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Describe the housing scheme"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>

                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="Enter scheme location"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

            </div>


            {/* ============================= */}
            {/* HOUSE INFORMATION */}
            {/* ============================= */}

            <div>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                House Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

                {/* House Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Model
                  </label>

                  <input
                    type="text"
                    name="houseModel"
                    value={formData.houseModel}
                    onChange={handleChange}
                    placeholder="Example: Type B"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Price */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House Price
                  </label>

                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="₹"
                    min="0"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Units */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Houses
                  </label>

                  <input
                    type="number"
                    name="totalUnits"
                    value={formData.totalUnits}
                    onChange={handleChange}
                    placeholder="Number of houses"
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

            </div>


            {/* ============================= */}
            {/* APPLICATION PERIOD */}
            {/* ============================= */}

            <div>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Application Period
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Start Date
                  </label>

                  <input
                    type="date"
                    name="applicationStartDate"
                    value={formData.applicationStartDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application End Date
                  </label>

                  <input
                    type="date"
                    name="applicationEndDate"
                    value={formData.applicationEndDate}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

              </div>

            </div>


            {/* ============================= */}
            {/* ELIGIBILITY */}
            {/* ============================= */}

            <div>

              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Eligible Income Categories
              </h2>

              <div className="flex flex-wrap gap-4">

                {["EWS", "LIG", "MIG", "HIG"].map(
                  (category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        value={category}
                        checked={formData.eligibleIncomeCategories.includes(
                          category
                        )}
                        onChange={handleCategoryChange}
                      />

                      <span className="text-sm text-gray-700">
                        {category}
                      </span>
                    </label>
                  )
                )}

              </div>

            </div>


            {/* ============================= */}
            {/* DISTRICT */}
            {/* ============================= */}

            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">

              <p className="text-sm text-blue-800">
                <span className="font-semibold">
                  District:
                </span>{" "}
                The scheme will automatically be assigned
                to your registered district.
              </p>

            </div>


            {/* ============================= */}
            {/* BUTTONS */}
            {/* ============================= */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="button"
                onClick={() => navigate("/officer")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className={`w-full sm:w-auto px-6 py-3 text-white rounded-lg font-medium ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {loading
                  ? "Creating Scheme..."
                  : "Create Scheme"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </section>
  );
}

export default CreateScheme;