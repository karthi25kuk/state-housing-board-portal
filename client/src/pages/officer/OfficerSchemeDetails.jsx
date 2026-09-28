import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function OfficerSchemeDetails() {
  const { schemeId } = useParams();
  const { token, user } = useAuth();

  const [scheme, setScheme] = useState(null);

  // All configurations belonging to the logged-in officer
  const [configurations, setConfigurations] = useState([]);

  // Currently selected configuration for editing.
  // null means we are creating a new configuration.
  const [configuration, setConfiguration] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allottingConfigurationId, setAllottingConfigurationId] =
    useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [location, setLocation] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [allotmentDate, setAllotmentDate] = useState("");

  // ==================================================
  // DATE FORMATTER FOR INPUT
  // ==================================================

  const formatDateForInput = (date) => {
    if (!date) return "";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toISOString().split("T")[0];
  };

  // ==================================================
  // DISPLAY DATE
  // ==================================================

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

  // ==================================================
  // GET TODAY AS LOCAL DATE
  // ==================================================

  const getTodayDate = () => {
    const today = new Date();

    const year = today.getFullYear();

    const month = String(
      today.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      today.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ==================================================
  // CHECK WHETHER ALLOTMENT DATE HAS ARRIVED
  // ==================================================

  const hasAllotmentDateArrived = (date) => {
    if (!date) {
      return false;
    }

    const configuredDate =
      formatDateForInput(date);

    if (!configuredDate) {
      return false;
    }

    return configuredDate <= getTodayDate();
  };

  // ==================================================
  // CHECK WHETHER CONFIGURATION CAN BE ALLOTTED
  // ==================================================

  const canDoAllotment = (item) => {
    if (!item) {
      return false;
    }

    const availableUnits = Number(
      item.availableUnits || 0
    );

    return (
      hasAllotmentDateArrived(
        item.allotmentDate
      ) &&
      availableUnits > 0
    );
  };

  // ==================================================
  // GET OFFICER CONFIGURATIONS
  // ==================================================

  const getOfficerConfigurations = (
    loadedScheme
  ) => {
    if (
      Array.isArray(
        loadedScheme?.officerConfigurations
      )
    ) {
      return loadedScheme.officerConfigurations;
    }

    // Backward compatibility with older backend response
    if (loadedScheme?.officerConfiguration) {
      return [
        loadedScheme.officerConfiguration,
      ];
    }

    // Final fallback
    const allConfigurations =
      Array.isArray(
        loadedScheme?.configurations
      )
        ? loadedScheme.configurations
        : [];

    const officerDistrict =
      user?.district
        ?.trim()
        .toLowerCase();

    if (!officerDistrict) {
      return [];
    }

    return allConfigurations.filter(
      (item) =>
        item.district
          ?.trim()
          .toLowerCase() ===
        officerDistrict
    );
  };

  // ==================================================
  // POPULATE FORM FROM CONFIGURATION
  // ==================================================

  const loadConfigurationIntoForm = (
    selectedConfiguration
  ) => {
    if (!selectedConfiguration) {
      setConfiguration(null);
      setLocation("");
      setTotalUnits("");
      setAllotmentDate("");
      return;
    }

    setConfiguration(
      selectedConfiguration
    );

    setLocation(
      selectedConfiguration.location || ""
    );

    setTotalUnits(
      selectedConfiguration.totalUnits ?? ""
    );

    setAllotmentDate(
      formatDateForInput(
        selectedConfiguration.allotmentDate
      )
    );
  };

  // ==================================================
  // FETCH SCHEME
  // ==================================================

  const fetchScheme = async () => {
    try {
      setLoading(true);
      setError("");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!schemeId) {
        setError("Invalid scheme ID.");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/api/schemes/officer/${schemeId}`,
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
        throw new Error(
          data.message ||
            "Failed to load scheme."
        );
      }

      if (!data.scheme) {
        throw new Error(
          "Scheme data was not returned by the server."
        );
      }

      const loadedScheme =
        data.scheme;

      setScheme(loadedScheme);

      const officerConfigurations =
        getOfficerConfigurations(
          loadedScheme
        );

      setConfigurations(
        officerConfigurations
      );

      // Keep the currently selected configuration
      // when refreshing after allotment/save.
      if (configuration?._id) {
        const refreshedConfiguration =
          officerConfigurations.find(
            (item) =>
              item._id?.toString() ===
              configuration._id.toString()
          );

        if (refreshedConfiguration) {
          loadConfigurationIntoForm(
            refreshedConfiguration
          );
          return;
        }
      }

      // Automatically select first configuration
      // when the page is initially opened.
      if (
        officerConfigurations.length > 0
      ) {
        loadConfigurationIntoForm(
          officerConfigurations[0]
        );
      } else {
        loadConfigurationIntoForm(null);
      }
    } catch (error) {
      console.error(
        "Fetch officer scheme error:",
        error
      );

      setError(
        error.message ||
          "Unable to load scheme details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScheme();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    schemeId,
    token,
    user?.district,
  ]);

  // ==================================================
  // DO ALLOTMENT
  // ==================================================

  const handleDoAllotment = async (
    selectedConfiguration
  ) => {
    if (!token) {
      setError(
        "Your session has expired. Please login again."
      );
      return;
    }

    if (
      !selectedConfiguration?._id
    ) {
      setError(
        "Invalid housing configuration."
      );
      return;
    }

    if (
      !hasAllotmentDateArrived(
        selectedConfiguration.allotmentDate
      )
    ) {
      setError(
        "The allotment date has not arrived yet."
      );
      return;
    }

    if (
      Number(
        selectedConfiguration.availableUnits || 0
      ) <= 0
    ) {
      setError(
        "No houses are currently available in this configuration."
      );
      return;
    }

    const confirmed = window.confirm(
      `Do you want to allot the next eligible ranked applicant to ${selectedConfiguration.location}?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setAllottingConfigurationId(
        selectedConfiguration._id
      );

      setError("");
      setSuccess("");

      const response = await fetch(
        "http://localhost:5000/api/allotments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            configurationId:
              selectedConfiguration._id,
          }),
        }
      );

      let data = {};

      try {
        data = await response.json();
      } catch {
        data = {};
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to create allotment offer."
        );
      }

      const applicantName =
        data.applicant?.name ||
        "the eligible ranked applicant";

      const districtPosition =
        data.applicant
          ?.districtPosition;

      const houseNumber =
        data.allotment?.houseNumber ||
        "-";

      setSuccess(
        `Allotment offer created successfully for ${applicantName}${
          districtPosition
            ? ` (Waiting List Rank #${districtPosition})`
            : ""
        }. House: ${houseNumber}.`
      );

      // Refresh configuration data so the
      // available-unit count is immediately updated.
      await fetchScheme();
    } catch (error) {
      console.error(
        "Create allotment error:",
        error
      );

      setError(
        error.message ||
          "Unable to create allotment offer."
      );
    } finally {
      setAllottingConfigurationId(
        null
      );
    }
  };

  // ==================================================
  // ADD NEW CONFIGURATION
  // ==================================================

  const handleAddAnotherConfiguration =
    () => {
      setError("");
      setSuccess("");

      // null configuration means CREATE mode
      loadConfigurationIntoForm(null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // ==================================================
  // EDIT EXISTING CONFIGURATION
  // ==================================================

  const handleEditConfiguration = (
    selectedConfiguration
  ) => {
    setError("");
    setSuccess("");

    loadConfigurationIntoForm(
      selectedConfiguration
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==================================================
  // SAVE DISTRICT CONFIGURATION
  // ==================================================

  const handleSave = async (
    event
  ) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      if (!token) {
        setError(
          "Your session has expired. Please login again."
        );
        return;
      }

      if (!schemeId) {
        setError("Invalid scheme ID.");
        return;
      }

      if (!user?.district) {
        setError(
          "Your officer account does not have a district assigned."
        );
        return;
      }

      if (!location.trim()) {
        setError(
          "Housing location is required."
        );
        return;
      }

      const units = Number(totalUnits);

      if (
        !Number.isInteger(units) ||
        units < 1
      ) {
        setError(
          "Total housing units must be a whole number greater than 0."
        );
        return;
      }

      if (!allotmentDate) {
        setError(
          "Allotment date is required."
        );
        return;
      }

      const requestBody = {
        location:
          location.trim(),
        totalUnits: units,
        allotmentDate,
      };

      // Include configurationId only when editing.
      // If omitted, backend creates a new configuration.
      if (configuration?._id) {
        requestBody.configurationId =
          configuration._id;
      }

      const response = await fetch(
        `http://localhost:5000/api/schemes/officer/${schemeId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(
            requestBody
          ),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Failed to update housing configuration."
        );
      }

      if (!data.scheme) {
        throw new Error(
          "Updated scheme data was not returned by the server."
        );
      }

      const updatedScheme =
        data.scheme;

      setScheme(updatedScheme);

      const updatedConfigurations =
        getOfficerConfigurations(
          updatedScheme
        );

      setConfigurations(
        updatedConfigurations
      );

      // Determine which configuration
      // should remain selected after save.
      let updatedConfiguration =
        null;

      if (configuration?._id) {
        updatedConfiguration =
          updatedConfigurations.find(
            (item) =>
              item._id?.toString() ===
              configuration._id.toString()
          ) || null;
      } else {
        // When creating a new configuration,
        // find it using submitted location.
        updatedConfiguration =
          updatedConfigurations.find(
            (item) =>
              item.location
                ?.trim()
                .toLowerCase() ===
              location
                .trim()
                .toLowerCase()
          ) || null;
      }

      if (updatedConfiguration) {
        loadConfigurationIntoForm(
          updatedConfiguration
        );
      } else {
        loadConfigurationIntoForm(
          null
        );
      }

      setSuccess(
        data.message ||
          (configuration
            ? "District housing configuration updated successfully."
            : "District housing configuration created successfully.")
      );
    } catch (error) {
      console.error(
        "Update housing configuration error:",
        error
      );

      setError(
        error.message ||
          "Unable to update housing configuration."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==================================================
  // LOADING
  // ==================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <p className="text-gray-600">
            Loading scheme details...
          </p>
        </div>
      </div>
    );
  }

  // ==================================================
  // ERROR WITHOUT SCHEME
  // ==================================================

  if (error && !scheme) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/officer/schemes"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            &larr; Back to Housing Schemes
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
          <p className="text-gray-600">
            Scheme not found.
          </p>
        </div>
      </div>
    );
  }

  const isEditing =
    Boolean(configuration);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* ==========================================
            BACK
        ========================================== */}

        <Link
          to="/officer/schemes"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          &larr; Back to Housing Schemes
        </Link>

        {/* ==========================================
            ERROR / SUCCESS
        ========================================== */}

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg">
            {success}
          </div>
        )}

        {/* ==========================================
            HEADER
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <div>
            <p className="text-sm text-gray-500">
              Housing Scheme
            </p>

            <h1 className="text-3xl font-bold text-gray-800 mt-1">
              {scheme.schemeName}
            </h1>

            <p className="text-gray-500 mt-2">
              District:{" "}
              {user?.district ||
                "Not assigned"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Your Configurations:{" "}
              <span className="font-semibold text-gray-700">
                {configurations.length}
              </span>
            </p>
          </div>
        </div>

        {/* ==========================================
            COMMON SCHEME INFORMATION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">
            Scheme Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {/* House Model */}

            <div>
              <p className="text-sm text-gray-500">
                House Model
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                {scheme.houseModel ||
                  "-"}
              </p>
            </div>

            {/* House Price */}

            <div>
              <p className="text-sm text-gray-500">
                House Price
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {Number(
                  scheme.price || 0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>

            {/* Maximum Income */}

            <div>
              <p className="text-sm text-gray-500">
                Maximum Annual Income
              </p>

              <p className="font-semibold text-gray-800 mt-1">
                ₹
                {Number(
                  scheme.maximumAnnualIncome ||
                    0
                ).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ==========================================
            DESCRIPTION
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Scheme Description
          </h2>

          <p className="text-gray-600 mt-3 leading-relaxed">
            {scheme.description ||
              "No description available."}
          </p>
        </div>

        {/* ==========================================
            ELIGIBILITY
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Eligible Income Categories
          </h2>

          <div className="flex flex-wrap gap-3">
            {scheme
              .eligibleIncomeCategories
              ?.length > 0 ? (
              scheme
                .eligibleIncomeCategories
                .map(
                  (category) => (
                    <span
                      key={category}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {category}
                    </span>
                  )
                )
            ) : (
              <p className="text-sm text-gray-500">
                No income categories configured.
              </p>
            )}
          </div>
        </div>

        {/* ==========================================
            EXISTING CONFIGURATIONS
        ========================================== */}

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Your District Housing Configurations
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                You can manage multiple housing
                locations under your assigned
                district.
              </p>
            </div>

            <button
              type="button"
              onClick={
                handleAddAnotherConfiguration
              }
              className="bg-green-600 text-white px-5 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              + Add Another Configuration
            </button>
          </div>

          {configurations.length ===
          0 ? (
            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-lg p-5">
              <p className="text-gray-600">
                No housing configuration
                has been created for your
                district yet.
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Use the configuration form
                below to create the first
                location.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {configurations.map(
                (item, index) => {
                  const configuredUnits =
                    Number(
                      item.totalUnits ||
                        0
                    );

                  const availableUnits =
                    Number(
                      item.availableUnits ||
                        0
                    );

                  const isSelected =
                    configuration?._id &&
                    item._id?.toString() ===
                      configuration._id.toString();

                  const dateArrived =
                    hasAllotmentDateArrived(
                      item.allotmentDate
                    );

                  const allotmentAvailable =
                    canDoAllotment(item);

                  const isAllotting =
                    allottingConfigurationId ===
                    item._id;

                  return (
                    <div
                      key={
                        item._id ||
                        `${item.location}-${index}`
                      }
                      className={`border rounded-xl p-5 ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-gray-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-gray-500 uppercase tracking-wide">
                            Location{" "}
                            {index + 1}
                          </p>

                          <h3 className="text-lg font-semibold text-gray-800 mt-1">
                            {item.location ||
                              "-"}
                          </h3>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleEditConfiguration(
                              item
                            )
                          }
                          className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div>
                          <p className="text-xs text-gray-500">
                            Total Units
                          </p>

                          <p className="text-lg font-bold text-gray-800 mt-1">
                            {configuredUnits}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-gray-500">
                            Available Units
                          </p>

                          <p className="text-lg font-bold text-green-700 mt-1">
                            {availableUnits}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs text-gray-500">
                          Allotment Date
                        </p>

                        <p className="text-sm font-semibold text-gray-700 mt-1">
                          {formatDate(
                            item.allotmentDate
                          )}
                        </p>
                      </div>

                      {/* ==========================================
                          ALLOTMENT STATUS
                      ========================================== */}

                      <div className="mt-5">
                        {!dateArrived &&
                          item.allotmentDate && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-blue-700">
                                Allotment is not
                                available yet.
                              </p>

                              <p className="text-xs text-blue-600 mt-1">
                                Processing begins
                                on{" "}
                                {formatDate(
                                  item.allotmentDate
                                )}
                                .
                              </p>
                            </div>
                          )}

                        {dateArrived &&
                          availableUnits <=
                            0 && (
                            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3">
                              <p className="text-sm font-medium text-gray-700">
                                No houses available
                              </p>

                              <p className="text-xs text-gray-500 mt-1">
                                All units in this
                                configuration
                                have been reserved
                                or allotted.
                              </p>
                            </div>
                          )}

                        {allotmentAvailable && (
                          <button
                            type="button"
                            onClick={() =>
                              handleDoAllotment(
                                item
                              )
                            }
                            disabled={
                              isAllotting
                            }
                            className="w-full bg-green-600 text-white px-5 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed"
                          >
                            {isAllotting
                              ? "Processing Allotment..."
                              : "Do Allotment"}
                          </button>
                        )}
                      </div>

                      {isSelected && (
                        <div className="mt-4 text-xs font-medium text-blue-700">
                          Currently editing
                          this configuration
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* ==========================================
            DISTRICT CONFIGURATION FORM
        ========================================== */}

        <form
          onSubmit={handleSave}
          className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing
                  ? "Edit District Housing Configuration"
                  : "Create District Housing Configuration"}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {isEditing
                  ? "Update the selected housing location configuration."
                  : "Create a new housing location under your assigned district."}
              </p>
            </div>

            {isEditing && (
              <button
                type="button"
                onClick={
                  handleAddAnotherConfiguration
                }
                className="border border-green-600 text-green-700 px-4 py-2 rounded-lg hover:bg-green-50 font-medium"
              >
                + Add Another
              </button>
            )}
          </div>

          {/* District */}

          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District
            </label>

            <input
              type="text"
              value={
                user?.district || ""
              }
              disabled
              className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-100 text-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Location */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Housing Location
              </label>

              <input
                type="text"
                value={location}
                onChange={(event) =>
                  setLocation(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter housing location"
              />
            </div>

            {/* Total Units */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Housing Units
              </label>

              <input
                type="number"
                min="1"
                step="1"
                value={totalUnits}
                onChange={(event) =>
                  setTotalUnits(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total units"
              />
            </div>

            {/* Allotment Date */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allotment Date
              </label>

              <input
                type="date"
                value={allotmentDate}
                onChange={(event) =>
                  setAllotmentDate(
                    event.target.value
                  )
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                Allotment processing is
                driven by this district
                configuration date.
              </p>
            </div>
          </div>

          {/* Current Availability */}

          {isEditing && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Configured Units
                </p>

                <p className="text-xl font-bold text-gray-800 mt-1">
                  {Number(
                    configuration?.totalUnits ||
                      0
                  )}
                </p>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Available Units
                </p>

                <p className="text-xl font-bold text-green-700 mt-1">
                  {Number(
                    configuration?.availableUnits ||
                      0
                  )}
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-xs text-gray-500">
                  Allotment Date
                </p>

                <p className="text-sm font-semibold text-blue-700 mt-2">
                  {formatDate(
                    configuration?.allotmentDate
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Save */}

          <div className="flex flex-wrap gap-3 mt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            >
              {saving
                ? "Saving..."
                : isEditing
                ? "Update Configuration"
                : "Create District Configuration"}
            </button>

            {isEditing && (
              <button
                type="button"
                onClick={
                  handleAddAnotherConfiguration
                }
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </form>

        {/* ==========================================
            WORKFLOW INFORMATION
        ========================================== */}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 mt-6">
          <h2 className="text-lg font-semibold text-blue-800">
            Officer Workflow
          </h2>

          <div className="mt-4 space-y-3 text-sm text-blue-900">
            <p>
              <strong>1.</strong> Configure
              one or more housing locations,
              total units and allotment dates
              for your district.
            </p>

            <p>
              <strong>2.</strong> Verify
              eligible applications submitted
              by applicants from your district.
            </p>

            <p>
              <strong>3.</strong> Generate and
              manage the district-wise waiting
              list.
            </p>

            <p>
              <strong>4.</strong> When the
              allotment date arrives, use
              <strong> Do Allotment </strong>
              for a configuration to offer the
              next eligible ranked applicant a
              house automatically.
            </p>

            <p>
              <strong>5.</strong> The applicant
              receives the offer and can accept
              or reject it.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OfficerSchemeDetails;