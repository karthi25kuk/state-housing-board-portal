import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function CreateScheme() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [formData, setFormData] = useState({
    schemeName: "",
    description: "",
    eligibleIncomeCategories: [],
    maximumAnnualIncome: "",
    houseModel: "",
    price: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================
  // HANDLE INPUT
  // ==========================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // HANDLE INCOME CATEGORY
  // ==========================================

  const handleCategoryChange = (category) => {
    setFormData((previous) => {
      const categories = previous.eligibleIncomeCategories;

      if (categories.includes(category)) {
        return {
          ...previous,
          eligibleIncomeCategories: categories.filter(
            (item) => item !== category
          ),
        };
      }

      return {
        ...previous,
        eligibleIncomeCategories: [
          ...categories,
          category,
        ],
      };
    });
  };

  // ==========================================
  // CREATE SCHEME
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const schemeName = formData.schemeName.trim();
    const description = formData.description.trim();
    const houseModel = formData.houseModel.trim();

    // ==========================================
    // FRONTEND VALIDATION
    // ==========================================

    if (!schemeName) {
      setError("Please enter the scheme name.");
      return;
    }

    if (!description) {
      setError("Please enter the scheme description.");
      return;
    }

    if (
      formData.eligibleIncomeCategories.length === 0
    ) {
      setError(
        "Please select at least one eligible income category."
      );
      return;
    }

    if (
      formData.maximumAnnualIncome === "" ||
      Number(formData.maximumAnnualIncome) < 0 ||
      !Number.isFinite(
        Number(formData.maximumAnnualIncome)
      )
    ) {
      setError(
        "Please enter a valid maximum annual income."
      );
      return;
    }

    if (!houseModel) {
      setError("Please enter the house model.");
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0 ||
      !Number.isFinite(Number(formData.price))
    ) {
      setError("Please enter a valid house price.");
      return;
    }

    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/schemes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            schemeName,
            description,
            eligibleIncomeCategories:
              formData.eligibleIncomeCategories,
            maximumAnnualIncome: Number(
              formData.maximumAnnualIncome
            ),
            houseModel,
            price: Number(formData.price),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to create housing scheme."
        );
      }

      setSuccess(
        data.message ||
          "Housing scheme created successfully."
      );

      // Clear form
      setFormData({
        schemeName: "",
        description: "",
        eligibleIncomeCategories: [],
        maximumAnnualIncome: "",
        houseModel: "",
        price: "",
      });

      // Redirect after successful creation
      setTimeout(() => {
        navigate("/admin");
      }, 1500);
    } catch (error) {
      console.error(
        "Create scheme error:",
        error
      );

      setError(
        error.message ||
          "Unable to create housing scheme."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // MAIN UI
  // ==========================================

  return (
    <div className="min-h-screen bg-slate-50 p-6">

      <div className="max-w-4xl mx-auto">

        {/* HEADER */}

        <div className="mb-6">

          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            &larr; Back to Dashboard
          </Link>

          <h1 className="text-3xl font-bold text-gray-800 mt-3">
            Create Housing Scheme
          </h1>

          <p className="text-gray-500 mt-1">
            Create a common housing scheme for the Housing Board.
          </p>

        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {/* SUCCESS */}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* FORM */}

        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6"
        >

          {/* SCHEME INFORMATION */}

          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Scheme Information
            </h2>

            <p className="text-sm text-gray-500 mt-1 mb-5">
              Define the common eligibility and housing details
              that apply to this scheme.
            </p>
          </div>

          {/* SCHEME NAME */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Scheme Name
            </label>

            <input
              type="text"
              name="schemeName"
              value={formData.schemeName}
              onChange={handleChange}
              placeholder="Example: Tamil Nadu Affordable Housing Scheme"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* DESCRIPTION */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter housing scheme description"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* INCOME CATEGORIES */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-3">
              Eligible Income Categories
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">

              {["EWS", "LIG", "MIG", "HIG"].map(
                (category) => (
                  <label
                    key={category}
                    className={`border rounded-lg px-4 py-3 cursor-pointer text-center font-medium ${
                      formData.eligibleIncomeCategories.includes(
                        category
                      )
                        ? "bg-blue-50 border-blue-500 text-blue-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >

                    <input
                      type="checkbox"
                      checked={formData.eligibleIncomeCategories.includes(
                        category
                      )}
                      onChange={() =>
                        handleCategoryChange(category)
                      }
                      className="mr-2"
                    />

                    {category}

                  </label>
                )
              )}

            </div>

          </div>

          {/* INCOME AND PRICE */}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">

            {/* MAXIMUM INCOME */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Annual Income
              </label>

              <input
                type="number"
                name="maximumAnnualIncome"
                min="0"
                value={formData.maximumAnnualIncome}
                onChange={handleChange}
                placeholder="Example: 500000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

            {/* PRICE */}

            <div>

              <label className="block text-sm font-medium text-gray-700 mb-2">
                House Price
              </label>

              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="Example: 1500000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

            </div>

          </div>

          {/* HOUSE MODEL */}

          <div className="mb-5">

            <label className="block text-sm font-medium text-gray-700 mb-2">
              House Model
            </label>

            <input
              type="text"
              name="houseModel"
              value={formData.houseModel}
              onChange={handleChange}
              placeholder="Example: 2BHK"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />

          </div>

          {/* NOTE */}

          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">

            <p className="text-sm text-blue-800">
              <strong>Note:</strong> District, location, total
              units, available units, and allotment date are
              configured separately by district officers.
            </p>

          </div>

          {/* BUTTONS */}

          <div className="flex flex-wrap gap-3">

            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {loading
                ? "Creating Scheme..."
                : "Create Housing Scheme"}
            </button>

            <Link
              to="/admin"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateScheme;